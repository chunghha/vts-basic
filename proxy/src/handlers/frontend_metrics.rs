use axum::{http::StatusCode, response::IntoResponse};
use metrics::counter;

/// Handles events sent from the frontend.
pub async fn handle_frontend_events(body: String) -> impl IntoResponse {
    counter!("frontend_events_total").increment(1);
    tracing::info!(body, "Received frontend events");
    (StatusCode::OK, "Received")
}
