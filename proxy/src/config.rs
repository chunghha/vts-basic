use anyhow::Result;
use serde::Deserialize;
use std::path::Path;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub country_api_url: String,
}

impl Config {
    pub fn load(path: &Path) -> Result<Self> {
        let config_str = std::fs::read_to_string(path)?;
        let config: Config = ron::de::from_str(&config_str)?;
        Ok(config)
    }
}
