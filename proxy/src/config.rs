use anyhow::Result;
use serde::Deserialize;
use std::path::Path;

/// Application configuration loaded from proxy.ron
#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub country_api_url: String,
    #[serde(default = "default_proxy_port")]
    pub proxy_port: u16,
    #[serde(default = "default_upstream_host")]
    pub upstream_host: String,
    #[serde(default = "default_upstream_port")]
    pub upstream_port: u16,
    #[serde(default = "default_asset_dir")]
    pub asset_dir: String,
    #[serde(default = "default_rate_limit_per_second")]
    pub rate_limit_per_second: u64,
    #[serde(default = "default_rate_limit_burst_size")]
    pub rate_limit_burst_size: u32,
}

fn default_proxy_port() -> u16 {
    3000
}

fn default_upstream_host() -> String {
    "127.0.0.1".to_string()
}

fn default_upstream_port() -> u16 {
    8081
}

fn default_asset_dir() -> String {
    "dist/client".to_string()
}

fn default_rate_limit_per_second() -> u64 {
    2
}

fn default_rate_limit_burst_size() -> u32 {
    10
}

impl Config {
    /// Load configuration from RON file with validation
    pub fn load(path: &Path) -> Result<Self> {
        let config_str = std::fs::read_to_string(path)?;
        let config: Config = ron::de::from_str(&config_str)?;

        // Validate configuration
        config.validate()?;

        tracing::info!(
            proxy_port = config.proxy_port,
            upstream_host = %config.upstream_host,
            upstream_port = config.upstream_port,
            asset_dir = %config.asset_dir,
            country_api_url = %config.country_api_url,
            rate_limit_per_second = config.rate_limit_per_second,
            rate_limit_burst_size = config.rate_limit_burst_size,
            "Configuration loaded and validated"
        );

        Ok(config)
    }

    /// Validate configuration values
    fn validate(&self) -> Result<()> {
        // Validate asset directory exists
        let asset_path = Path::new(&self.asset_dir);
        if !asset_path.exists() {
            anyhow::bail!(
                "Asset directory does not exist: {}. Please run 'bun run build' first.",
                self.asset_dir
            );
        }

        if !asset_path.is_dir() {
            anyhow::bail!(
                "Asset path exists but is not a directory: {}",
                self.asset_dir
            );
        }

        // Validate port ranges
        if self.proxy_port == 0 {
            anyhow::bail!("proxy_port cannot be 0");
        }

        if self.upstream_port == 0 {
            anyhow::bail!("upstream_port cannot be 0");
        }

        // Validate upstream host is not empty
        if self.upstream_host.is_empty() {
            anyhow::bail!("upstream_host cannot be empty");
        }

        // Validate country API URL is not empty
        if self.country_api_url.is_empty() {
            anyhow::bail!("country_api_url cannot be empty");
        }

        Ok(())
    }

    /// Get the full upstream base URL
    pub fn upstream_base(&self) -> String {
        format!("http://{}:{}", self.upstream_host, self.upstream_port)
    }
}
