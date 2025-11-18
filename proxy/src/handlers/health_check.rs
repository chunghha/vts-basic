use axum::{Json, response::IntoResponse};
use serde_json::json;

/// Health check endpoint handler
///
/// Returns a simple JSON response indicating the service is healthy.
/// Useful for container orchestration, load balancers, and monitoring systems.
///
/// # Example Response
/// ```json
/// {"isHealthy": true}
/// ```
pub async fn health_check() -> impl IntoResponse {
    Json(json!({"isHealthy": true}))
}
