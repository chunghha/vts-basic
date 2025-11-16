use axum::{
    Router,
    body::Body,
    extract::State,
    http::{Request, StatusCode, Uri},
    response::IntoResponse,
};
use hyper_util::client::legacy::Client;
use hyper_util::client::legacy::connect::HttpConnector;
use std::net::SocketAddr;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

type HttpClient = Client<HttpConnector, Body>;

#[derive(Clone)]
struct AppState {
    client: HttpClient,
}

#[tokio::main]
async fn main() {
    eprintln!("Initializing proxy server...");

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "proxy=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    eprintln!("Building HTTP client...");
    let client = Client::builder(hyper_util::rt::TokioExecutor::new()).build(HttpConnector::new());

    let state = AppState { client };

    eprintln!("Setting up routes...");
    let app = Router::new()
        .nest_service("/assets", ServeDir::new("dist/client/assets"))
        .route_service("/favicon.ico", ServeFile::new("dist/client/favicon.ico"))
        .route_service("/robots.txt", ServeFile::new("dist/client/robots.txt"))
        .route_service(
            "/manifest.json",
            ServeFile::new("dist/client/manifest.json"),
        )
        .route_service("/logo192.png", ServeFile::new("dist/client/logo192.png"))
        .route_service("/logo512.png", ServeFile::new("dist/client/logo512.png"))
        .fallback(proxy_fallback)
        .with_state(state)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    eprintln!("Binding to {}...", addr);
    tracing::debug!("listening on {}", addr);

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => {
            eprintln!("✓ Proxy server listening on http://localhost:3000");
            eprintln!("✓ Proxying requests to http://127.0.0.1:8081");
            listener
        }
        Err(e) => {
            eprintln!("✗ Failed to bind to port 3000: {}", e);
            std::process::exit(1);
        }
    };

    eprintln!("Starting server loop...");
    if let Err(e) = axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    {
        eprintln!("✗ Server error: {}", e);
        std::process::exit(1);
    }

    eprintln!("Server stopped");
}

async fn proxy_fallback(
    State(state): State<AppState>,
    mut req: Request<Body>,
) -> impl IntoResponse {
    let path = req.uri().path();
    let path_query = req
        .uri()
        .path_and_query()
        .map(|v| v.as_str())
        .unwrap_or(path);

    let upstream_uri = format!("http://127.0.0.1:8081{}", path_query);

    *req.uri_mut() = Uri::try_from(upstream_uri).unwrap();

    match state.client.request(req).await {
        Ok(response) => response.into_response(),
        Err(error) => {
            tracing::error!("Upstream server error: {}", error);
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}
// rebuild
// final rebuild
