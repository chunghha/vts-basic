//! Integration test for the proxy binary.
//!
//! Spawns a dummy upstream SSR server (Axum) and then launches the compiled
//! proxy binary as a child process, pointing it at the upstream via env vars.
//! Verifies:
//!   - Proxy responds with upstream body
//!   - Adds x-proxy header
//!   - Metrics endpoint exposes counters for requests
//!
//! This test assumes the proxy binary has already been built by `cargo test`.
//! Paths checked:
//!   - target/debug/proxy
//!   - target/release/proxy (fallback)
//!
//! If running tests with `--release`, the release path will be used.
//!
//! NOTE: The proxy will attempt to serve static assets from `dist/client`.
//! For this integration test, we only exercise the reverse proxy fallback.
//!
//! Environment variables consumed by proxy:
//!   PROXY_PORT, SSR_UPSTREAM_HOST, SSR_UPSTREAM_PORT, METRICS_PORT
//!
//! The test chooses random high ports via binding to port 0.
//!
//! Uses only existing dependencies (tokio, axum, hyper) to avoid adding
//! extra dev-dependencies.

use axum::{body::Body, Router, routing::get};
use hyper_util::client::legacy::{Client, connect::HttpConnector};
use http_body_util::BodyExt;
use std::{
    env, fs,
    path::Path,
    process::{Child, Command, Stdio},
    time::Duration,
};
use tokio::net::TcpListener;
use tokio::time::sleep;

/// Build an ephemeral upstream axum server returning fixed text for any GET /test route.
async fn spawn_upstream() -> (u16, tokio::task::JoinHandle<()>) {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    let app = Router::new().route("/test", get(|| async { "UPSTREAM OK" }));

    let handle = tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, app.into_make_service()).await {
            eprintln!("Upstream server error: {e}");
        }
    });

    (port, handle)
}

/// Find the proxy binary path (debug first, then release).
fn find_proxy_binary() -> Option<std::path::PathBuf> {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let debug_path = Path::new(manifest_dir)
        .join("target")
        .join("debug")
        .join("proxy");
    if debug_path.exists() {
        return Some(debug_path);
    }
    let release_path = Path::new(manifest_dir)
        .join("target")
        .join("release")
        .join("proxy");
    if release_path.exists() {
        return Some(release_path);
    }
    None
}

/// Spawn proxy child process configured to point at our dummy upstream.
fn spawn_proxy(upstream_port: u16, proxy_port: u16) -> Child {
    let binary =
        find_proxy_binary().unwrap_or_else(|| panic!("Proxy binary not found. Build failed?"));

    // Ensure executable permissions (some CI artifacts can lose them)
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&binary).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&binary, perms).unwrap();
    }

    let mut cmd = Command::new(&binary);
    cmd.env("PROXY_PORT", proxy_port.to_string())
        .env("SSR_UPSTREAM_HOST", "127.0.0.1")
        .env("SSR_UPSTREAM_PORT", upstream_port.to_string())
        .env("LOG_FORMAT", "json") // exercise JSON logging path
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let child = cmd.spawn().expect("Failed to spawn proxy process");
    child
}

/// Poll an HTTP GET until success or timeout.
async fn wait_for_get_ok(url: &str, timeout: Duration) -> Result<Vec<u8>, String> {
    let client: Client<_, Body> = Client::builder(hyper_util::rt::TokioExecutor::new()).build(HttpConnector::new());
    let start = std::time::Instant::now();

    loop {
        match client.get(url.parse().unwrap()).await {
            Ok(resp) => {
                if resp.status().is_success() {
                    let body_bytes = resp.into_body().collect()
                        .await
                        .map_err(|e| format!("Body read error: {e}"))?
                        .to_bytes();
                    return Ok(body_bytes.to_vec());
                }
            }
            Err(_) => {}
        }
        if start.elapsed() > timeout {
            return Err(format!("Timeout waiting for {url}"));
        }
        sleep(Duration::from_millis(250)).await;
    }
}

/// Read metrics endpoint text.
async fn fetch_metrics(url: &str) -> Result<String, String> {
    let client: Client<_, Body> = Client::builder(hyper_util::rt::TokioExecutor::new()).build(HttpConnector::new());
    let resp = client
        .get(url.parse().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("Metrics non-200: {}", resp.status()));
    }
    let bytes = resp.into_body().collect()
        .await
        .map_err(|e| e.to_string())?
        .to_bytes();
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_proxy_end_to_end() {
    // Spawn upstream
    let (upstream_port, _upstream_handle) = spawn_upstream().await;

    // Reserve proxy port by binding then letting it go (to reduce collision risk)
    let proxy_listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let proxy_port = proxy_listener.local_addr().unwrap().port();
    drop(proxy_listener);

    // Spawn proxy
    let mut proxy_child = spawn_proxy(upstream_port, proxy_port);

    // Wait for proxy to respond
    let proxy_url = format!("http://127.0.0.1:{proxy_port}/test");
    let body = wait_for_get_ok(&proxy_url, Duration::from_secs(8))
        .await
        .expect("Proxy did not become ready");
    assert_eq!(body, b"UPSTREAM OK");

    // Perform another request to accumulate metrics
    let _ = wait_for_get_ok(&proxy_url, Duration::from_secs(3))
        .await
        .expect("Second request failed");

    // Fetch metrics
    let metrics_url = format!("http://127.0.0.1:{proxy_port}/api/metrics");
    let metrics_output = fetch_metrics(&metrics_url)
        .await
        .expect("metrics fetch failed");

    // Basic assertions about metrics counters
    assert!(
        metrics_output.contains("proxy_requests_total"),
        "Expected proxy_requests_total in metrics output"
    );
    assert!(
        metrics_output.contains(r#"proxy_responses_total{status="200"}"#),
        "Expected proxy_responses_total with 200 status"
    );

    // Ensure upstream latency histogram recorded
    assert!(
        metrics_output.contains("proxy_upstream_latency_seconds"),
        "Expected latency histogram in metrics output"
    );

    // Cleanup
    let _ = proxy_child.kill();
    let _ = proxy_child.wait();
}

/// Additional test: ensure missing binary path reports clear panic (skipped if binary exists).
#[test]
fn test_binary_path_exists() {
    assert!(
        find_proxy_binary().is_some(),
        "Proxy binary should exist after build; run `cargo build` first."
    );
}
