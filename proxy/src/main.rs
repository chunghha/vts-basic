//! Proxy server: serves static built assets and reverse-proxies all other
//! requests to the Bun SSR server.
//!
//! Features:
//! - Optional JSON structured logging (LOG_FORMAT=json)
//! - Prometheus metrics endpoint (/metrics)
//! - Graceful shutdown on SIGINT / SIGTERM
//! - Pre-compressed static asset serving (br/gz)
//! - Strong caching headers for versioned assets

mod config;
mod handlers;
mod state;

use anyhow::Context;
use axum::{
    Router,
    routing::{get, post},
};
use hyper_util::client::legacy::{Client, connect::HttpConnector};
use std::{env, net::SocketAddr, sync::Arc};
use tokio::signal;
use tower::ServiceBuilder;
use tower_http::{compression::CompressionLayer, services::ServeFile, trace::TraceLayer};

use metrics::{describe_counter, describe_histogram};
use metrics_exporter_prometheus::PrometheusBuilder;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::GlobalKeyExtractor, GovernorLayer,
};
use tracing_subscriber::{EnvFilter, Registry, layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config,
    handlers::{
        api_countries::api_countries, api_events::api_events, api_themes::api_themes, health_check::health_check,
        metrics::metrics_handler, proxy_fallback::proxy_fallback, serve_asset::serve_asset,
    },
    state::AppState,
};

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

#[tokio::main]

async fn main() -> anyhow::Result<()> {
    init_tracing();

    // Initialize Prometheus metrics recorder (served via /metrics on main port)

    let recorder = PrometheusBuilder::new()
        .install_recorder()
        .expect("failed to install Prometheus recorder");

    // Describe metrics so Prometheus exporter includes HELP/TYPE lines

    describe_counter!("proxy_requests_total", "Total number of proxy requests");

    describe_counter!("proxy_errors_total", "Total number of proxy errors");

    describe_histogram!(
        "proxy_upstream_latency_seconds",
        "Proxy upstream request latency in seconds"
    );

    describe_counter!(
        "frontend_events_total",
        "Total number of frontend events received"
    );

    tracing::info!("Initializing proxy server");

    let config = Arc::new(Config::load("proxy/proxy.ron".as_ref())?);

    let upstream_base = config.upstream_base();
    let asset_dir = config.asset_dir.clone();
    let proxy_port = config.proxy_port;
    let rate_limit_per_second = config.rate_limit_per_second;
    let rate_limit_burst_size = config.rate_limit_burst_size;

    let client = Client::builder(hyper_util::rt::TokioExecutor::new()).build(HttpConnector::new());
    let reqwest_client = reqwest::Client::new();

    let state = AppState {
        client,
        reqwest_client,

        upstream_base: Arc::new(upstream_base),

        asset_root: Arc::new(asset_dir.clone()),

        config,
    };

    let app = Router::new()
        // Health check endpoint
        .route("/isHealthy", get(health_check))
        // Metrics endpoint (same port as proxy)
        .route(
            "/api/metrics",
            get({
                let recorder = recorder.clone();

                move || metrics_handler(recorder)
            }),
        )
        .route("/api/events", post(api_events))
        // API endpoint for country data (served by Rust proxy)
        .route("/api/country", get(api_countries))
        .route("/api/themes", get(api_themes))
        .route("/assets/{*path}", get(serve_asset))
        .route_service(
            "/favicon.ico",
            ServeFile::new(format!("{asset_dir}/favicon.ico")),
        )
        .route_service(
            "/robots.txt",
            ServeFile::new(format!("{asset_dir}/robots.txt")),
        )
        .route_service("/sw.js", ServeFile::new(format!("{asset_dir}/sw.js")))
        .route_service(
            "/manifest.webmanifest",
            ServeFile::new(format!("{asset_dir}/manifest.webmanifest")),
        )
        .fallback(proxy_fallback)
        .with_state(state)
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(CompressionLayer::new())
                .layer({
                    // Rate limiting configured from proxy.ron (global limit)
                    let governor_conf = Arc::new(
                        GovernorConfigBuilder::default()
                            .per_second(rate_limit_per_second)
                            .burst_size(rate_limit_burst_size)
                            .key_extractor(GlobalKeyExtractor)
                            .finish()
                            .unwrap(),
                    );
                    GovernorLayer::new(governor_conf)
                }),
        );

    tracing::info!(
        rate_limit_per_second,
        rate_limit_burst_size,
        "Rate limiting enabled"
    );

    let addr = SocketAddr::from(([0, 0, 0, 0], proxy_port));

    tracing::info!(listen_addr = %addr, "Binding proxy listener");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .context("Failed to bind listener")?;

    tracing::info!(listen_addr = %addr, "Listening for requests");

    axum::serve(listener, app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .context("Server error")?;

    tracing::info!("Server stopped gracefully");

    Ok(())
}
