use axum::response::IntoResponse;
use metrics_exporter_prometheus::PrometheusHandle;

pub async fn metrics_handler(recorder: PrometheusHandle) -> impl IntoResponse {
    recorder.render()
}
