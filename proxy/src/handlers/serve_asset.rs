use axum::{
    body::Body as AxumBody,
    extract::{Path, State},
    http::{HeaderMap, Response, StatusCode, header},
    response::IntoResponse,
};
use sha2::{Digest, Sha256};
use tokio::fs;

use crate::state::AppState;

/// Serves a static asset, handling pre-compressed variants.
pub async fn serve_asset(
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
        .body(AxumBody::from(bytes))
        .unwrap()
        .into_response()
}
