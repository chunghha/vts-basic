use anyhow::Context;
use axum::{
    body::Body as AxumBody,
    extract::State,
    http::{Response, StatusCode, header},
    response::IntoResponse,
};

use crate::state::AppState;

/// Fetches countries from restcountries.com via reqwest, simplifies the JSON, and returns it.
pub async fn api_countries(State(state): State<AppState>) -> impl IntoResponse {
    match fetch_and_simplify_countries(state).await {
        Ok(resp_body) => Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "application/json")
            .body(AxumBody::from(resp_body))
            .unwrap()
            .into_response(),
        Err(e) => {
            tracing::error!(error = %e, "Failed to fetch and simplify countries");
            (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
        }
    }
}

async fn fetch_and_simplify_countries(state: AppState) -> anyhow::Result<Vec<u8>> {
    let url = &state.config.country_api_url;

    let client = reqwest::Client::new();
    let resp = client
        .get(url)
        .send()
        .await
        .context("Failed to fetch countries upstream")?;

    if !resp.status().is_success() {
        tracing::error!(status = %resp.status(), "Upstream returned non-200");
        anyhow::bail!("Upstream returned non-200 status: {}", resp.status());
    }

    let parsed: Vec<serde_json::Value> =
        resp.json().await.context("Failed to parse upstream JSON")?;

    let mut simplified: Vec<serde_json::Value> = Vec::with_capacity(parsed.len());
    for item in parsed.into_iter() {
        let cca2 = item
            .get("cca2")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_uppercase();
        let name = item
            .get("name")
            .and_then(|n| n.get("common"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let region = item
            .get("region")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let population = item.get("population").and_then(|v| v.as_u64()).unwrap_or(0);
        let flag_png = item
            .get("flags")
            .and_then(|f| f.get("png"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        simplified.push(serde_json::json!({
            "code": cca2,
            "name": if name.is_empty() { cca2.clone() } else { name },
            "region": region,
            "population": population,
            "flag": flag_png,
        }));
    }

    simplified.sort_by(|a, b| {
        let na = a.get("name").and_then(|v| v.as_str()).unwrap_or("");
        let nb = b.get("name").and_then(|v| v.as_str()).unwrap_or("");
        na.cmp(nb)
    });

    let resp_body =
        serde_json::to_vec(&simplified).context("Failed to serialize simplified JSON")?;

    Ok(resp_body)
}
