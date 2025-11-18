use axum::body::Body as AxumBody;
use hyper_util::client::legacy::{Client, connect::HttpConnector};
use std::sync::Arc;

use crate::config::Config;

pub type HttpClient = Client<HttpConnector, AxumBody>;

#[derive(Clone)]
pub struct AppState {
    pub client: HttpClient,
    pub upstream_base: Arc<String>,
    pub asset_root: Arc<String>,
    pub config: Arc<Config>,
}
