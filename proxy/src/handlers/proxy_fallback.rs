use axum::{
    body::Body as AxumBody,
    extract::State,
    http::{Request, StatusCode, Uri},
    response::IntoResponse,
};
use metrics::{counter, histogram};
use tracing::{field, info_span};

use crate::state::AppState;

/// Reverse-proxies unmatched requests to the upstream SSR server.
pub async fn proxy_fallback(
    State(state): State<AppState>,
    mut req: Request<AxumBody>,
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
            let elapsed = start.elapsed();
            let status = resp.status();
            span.record("status", status.as_u16());
            histogram!("proxy_upstream_latency_seconds").record(elapsed.as_secs_f64());
            resp.headers_mut()
                .insert("x-proxy", "rust-proxy".parse().unwrap());
            resp.into_response()
        }
        Err(error) => {
            let elapsed = start.elapsed();
            tracing::error!(%error, "Upstream server error");
            histogram!("proxy_upstream_latency_seconds").record(elapsed.as_secs_f64());
            let _ = counter!("proxy_errors_total", "error_type" => "upstream_error".to_string());
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}
