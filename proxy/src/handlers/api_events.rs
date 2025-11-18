use crate::state::AppState;
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use metrics::counter;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Event {
    route: String,
}

pub async fn api_events(
    State(_state): State<AppState>,
    Json(payload): Json<Event>,
) -> impl IntoResponse {
    tracing::info!(route = %payload.route, "Frontend route visited");
    counter!("frontend_events_total", "route" => payload.route).increment(1);
    (StatusCode::OK, "Event received").into_response()
}
