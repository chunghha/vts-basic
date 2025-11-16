//! Proxy server: serves static built assets and reverse-proxies all other
//! requests to the Bun SSR server.
//!
//! Features:
//! - Optional JSON structured logging (LOG_FORMAT=json)
//! - Prometheus metrics endpoint (/metrics)
//! - Graceful shutdown on SIGINT / SIGTERM
//! - Pre-compressed static asset serving (br/gz)
//! - Strong caching headers for versioned assets

use axum::{
    Router,
    body::Body,
    extract::{Path, State},
    http::{HeaderMap, Request, Response, StatusCode, Uri, header},
    response::IntoResponse,
    routing::get,
};
use hyper_util::client::legacy::{Client, connect::HttpConnector};
use sha2::{Digest, Sha256};
use std::{env, net::SocketAddr, sync::Arc};
use tokio::{fs, signal};
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, services::ServeFile, trace::TraceLayer};

use metrics::{counter, describe_counter, describe_histogram};
use metrics_exporter_prometheus::PrometheusBuilder;
use tracing::{field, info_span};
use tracing_subscriber::{EnvFilter, Registry, layer::SubscriberExt, util::SubscriberInitExt};

type HttpClient = Client<HttpConnector, Body>;

#[derive(Clone)]
struct AppState {
    client: HttpClient,
    upstream_base: Arc<String>,
    asset_root: Arc<String>,
}

/// Initializes tracing with optional JSON formatting.
fn init_tracing() {
    let filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| "proxy=info,tower_http=info".into());

    let log_format = env::var("LOG_FORMAT").unwrap_or_else(|_| "text".into());

    let subscriber = Registry::default().with(filter);

    if log_format.eq_ignore_ascii_case("json") {
        let fmt_layer = tracing_subscriber::fmt::layer()
            .with_target(true)
            .with_timer(tracing_subscriber::fmt::time::SystemTime)
            .json();
        subscriber.with(fmt_layer).init();
    } else {
        let fmt_layer = tracing_subscriber::fmt::layer()
            .with_target(true)
            .with_timer(tracing_subscriber::fmt::time::SystemTime);
        subscriber.with(fmt_layer).init();
    }
}

/// Graceful shutdown signal future.
async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => tracing::info!("Received Ctrl+C, starting graceful shutdown"),
        _ = terminate => tracing::info!("Received SIGTERM, starting graceful shutdown"),
    }
}

/// Serves a static asset, handling pre-compressed variants.
async fn serve_asset(
    State(state): State<AppState>,
    Path(path): Path<String>,
    headers: HeaderMap,
) -> impl IntoResponse {
    let base_path = format!("{}/assets/{}", state.asset_root, path);
    let accept_encoding = headers
        .get(header::ACCEPT_ENCODING)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let (serve_path, content_encoding) = if accept_encoding.contains("br")
        && fs::metadata(format!("{base_path}.br")).await.is_ok()
    {
        (format!("{base_path}.br"), Some("br"))
    } else if accept_encoding.contains("gzip")
        && fs::metadata(format!("{base_path}.gz")).await.is_ok()
    {
        (format!("{base_path}.gz"), Some("gzip"))
    } else {
        (base_path.clone(), None)
    };

    let bytes = match fs::read(&serve_path).await {
        Ok(b) => b,
        Err(_) => return (StatusCode::NOT_FOUND, "Not Found").into_response(),
    };

    let mime = mime_guess::from_path(&base_path)
        .first_or_octet_stream()
        .to_string();

    let is_hashed = base_path
        .split('.')
        .any(|part| part.len() >= 8 && part.chars().all(|c| c.is_ascii_hexdigit()));
    let cache_control = if is_hashed {
        "public, max-age=31536000, immutable"
    } else {
        "no-cache"
    };

    let etag = format!("W/\"{:x}\"", Sha256::digest(&bytes));

    let mut resp_builder = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime)
        .header(header::CACHE_CONTROL, cache_control)
        .header(header::ETAG, etag)
        .header(header::VARY, "Accept-Encoding");

    if let Some(enc) = content_encoding {
        resp_builder = resp_builder.header(header::CONTENT_ENCODING, enc);
    }

    resp_builder
        .body(Body::from(bytes))
        .unwrap()
        .into_response()
}

/// Reverse-proxies unmatched requests to the upstream SSR server.
async fn proxy_fallback(
    State(state): State<AppState>,
    mut req: Request<Body>,
) -> impl IntoResponse {
    let start = std::time::Instant::now();
    let orig_uri = req.uri().clone();
    let path_and_query = orig_uri
        .path_and_query()
        .map(|v| v.as_str())
        .unwrap_or(orig_uri.path());
    let target_uri = format!("{}{}", state.upstream_base, path_and_query);

    let span = info_span!(
        "proxy_request",
        method = %req.method(),
        path = %orig_uri.path(),
        upstream = %target_uri,
        status = field::Empty
    );
    let _enter = span.enter();

    let _ = counter!("proxy_requests_total", "path" => orig_uri.path().to_string());

    *req.uri_mut() = Uri::try_from(target_uri).unwrap();

    match state.client.request(req).await {
        Ok(mut resp) => {
            let _elapsed = start.elapsed();
            let status = resp.status();
            span.record("status", status.as_u16());
            // histogram!("proxy_request_latency_ms", elapsed.as_millis() as f64);
            resp.headers_mut()
                .insert("x-proxy", "rust-proxy".parse().unwrap());
            resp.into_response()
        }
        Err(error) => {
            let _elapsed = start.elapsed();
            tracing::error!(%error, "Upstream server error");
            // histogram!("proxy_request_latency_ms", elapsed.as_millis() as f64);
            let _ = counter!("proxy_errors_total", "error_type" => "upstream_error".to_string());
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}

#[tokio::main]
async fn main() {
    init_tracing();
    // Initialize Prometheus metrics recorder (served via /metrics on main port)
    let recorder = PrometheusBuilder::new()
        .install_recorder()
        .expect("failed to install Prometheus recorder");

    // Describe metrics so Prometheus exporter includes HELP/TYPE lines
    describe_counter!("proxy_requests_total", "Total number of proxy requests");
    describe_counter!("proxy_errors_total", "Total number of proxy errors");
    describe_histogram!(
        "proxy_request_latency_ms",
        "Proxy upstream request latency in milliseconds"
    );

    tracing::info!("Initializing proxy server");

    let proxy_port: u16 = env::var("PROXY_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3000);
    let upstream_host = env::var("SSR_UPSTREAM_HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let upstream_port: u16 = env::var("SSR_UPSTREAM_PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8081);
    let upstream_base = format!("http://{upstream_host}:{upstream_port}");
    let asset_dir = env::var("ASSET_DIR").unwrap_or_else(|_| "dist/client".into());

    tracing::info!(%upstream_base, %asset_dir, "Configuration loaded");

    let client = Client::builder(hyper_util::rt::TokioExecutor::new()).build(HttpConnector::new());
    let state = AppState {
        client,
        upstream_base: Arc::new(upstream_base),
        asset_root: Arc::new(asset_dir.clone()),
    };

    let app = Router::new()
        // Metrics endpoint (same port as proxy)
        .route(
            "/metrics",
            get({
                let recorder = recorder.clone();
                move || async move { recorder.render() }
            }),
        )
        .route("/assets/{*path}", get(serve_asset))
        .route_service(
            "/favicon.ico",
            ServeFile::new(format!("{asset_dir}/favicon.ico")),
        )
        .route_service(
            "/robots.txt",
            ServeFile::new(format!("{asset_dir}/robots.txt")),
        )
        .fallback(proxy_fallback)
        .with_state(state)
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new()),
        );

    let addr = SocketAddr::from(([0, 0, 0, 0], proxy_port));
    tracing::info!(listen_addr = %addr, "Binding proxy listener");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| {
            tracing::error!(error = %e, "Failed to bind listener");
            std::process::exit(1);
        });

    if let Err(e) = axum::serve(listener, app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
    {
        tracing::error!(error = %e, "Server error");
        std::process::exit(2);
    }

    tracing::info!("Server stopped gracefully");
}
