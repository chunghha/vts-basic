use axum::{Json, http::StatusCode, response::IntoResponse, extract::State};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::fs;
use tracing::{debug, error, info, warn};

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Theme {
    name: String,
    primary: String,
    secondary: String,
    accent: String,
    base100: String,
    base_content: String,
}

/// Reads the configured CSS file, extracts daisyUI theme blocks and their key colors,
/// and returns a JSON list of themes.
///
pub async fn api_themes(State(state): State<AppState>) -> impl IntoResponse {
    // Read the CSS file from configured path
    let css_path = &state.config.themes_css_path;
    let css_content = match fs::read_to_string(css_path) {
        Ok(c) => c,
        Err(e) => {
            error!(path = %css_path, error = %e, "Failed to read CSS file");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to read CSS file".into_response(),
            );
        }
    };

    info!(len = css_content.len(), "Read CSS content");

    let mut themes: Vec<Theme> = Vec::new();

    // Regex to match daisyui theme blocks.
    // This finds the @plugin "daisyui/theme" { ... } block and captures the inner body.
    // We use non-greedy matching for the body to stop at the first closing brace.
    let block_re = Regex::new(r#"@plugin\s*"daisyui/theme"\s*\{\s*([\s\S]*?)\}"#)
        .expect("block regex should compile");

    // Regex to extract the theme name anywhere inside a block: name: "theName";
    let name_re = Regex::new(r#"name\s*:\s*"([^"]+)""#).expect("name regex should compile");

    // Regex to extract color properties.
    // Captures property key (e.g. primary, base-100, contrast) and value (anything up to the next semicolon).
    // We include `contrast` to accept `--color-contrast` as a fallback for base-content.
    let color_re = Regex::new(
        r#"--color-(primary|secondary|accent|base-100|base-content|contrast)\s*:\s*([^;]+);"#,
    )
    .expect("color regex should compile");

    let mut block_count = 0usize;
    let mut added_count = 0usize;

    for block_caps in block_re.captures_iter(&css_content) {
        block_count += 1;
        let block_body = block_caps.get(1).map(|m| m.as_str()).unwrap_or("");
        debug!(
            idx = block_count,
            len = block_body.len(),
            "Found theme block body"
        );

        // Try to find the name inside the block
        let name = if let Some(name_caps) = name_re.captures(block_body) {
            name_caps
                .get(1)
                .map(|m| m.as_str().to_string())
                .unwrap_or_default()
        } else {
            // If no name provided, generate a placeholder with index to aid debugging
            warn!(
                idx = block_count,
                "Theme block missing a `name` entry; skipping"
            );
            continue;
        };

        debug!(theme = %name, "Parsing colors for theme");

        // placeholders
        let mut primary = String::new();
        let mut secondary = String::new();
        let mut accent = String::new();
        let mut base100 = String::new();
        let mut base_content = String::new();

        for color_caps in color_re.captures_iter(block_body) {
            let key = color_caps.get(1).map(|m| m.as_str()).unwrap_or_default();
            let raw_value = color_caps.get(2).map(|m| m.as_str()).unwrap_or_default();

            // Trim and strip surrounding quotes if present
            let mut value = raw_value.trim().to_string();
            if value.starts_with('"') && value.ends_with('"') && value.len() >= 2 {
                value = value[1..value.len() - 1].to_string();
            }
            // Also strip single quotes just in case
            if value.starts_with('\'') && value.ends_with('\'') && value.len() >= 2 {
                value = value[1..value.len() - 1].to_string();
            }

            debug!(theme = %name, key = %key, value = %value, "Found color");

            match key {
                "primary" => primary = value,
                "secondary" => secondary = value,
                "accent" => accent = value,
                "base-100" => base100 = value,
                "base-content" => base_content = value,
                // If `--color-base-content` isn't present, use `--color-contrast` as a fallback.
                "contrast" => {
                    if base_content.is_empty() {
                        base_content = value;
                    } else {
                        debug!(theme = %name, "Ignoring contrast because base-content already set");
                    }
                }
                _ => {
                    // Shouldn't happen because regex limits keys, but keep for completeness.
                    debug!(theme = %name, key = %key, "Unrecognized color key");
                }
            }
        }

        // Validate presence of required colors

        if primary.is_empty()
            || secondary.is_empty()
            || accent.is_empty()
            || base100.is_empty()
            || base_content.is_empty()
        {
            warn!(
                theme = %name,
                primary = primary.is_empty(),
                secondary = secondary.is_empty(),
                accent = accent.is_empty(),
                base100 = base100.is_empty(),
                base_content = base_content.is_empty(),
                "Skipping theme due to missing colors"
            );
            continue;
        }

        themes.push(Theme {
            name: name.clone(),
            primary,
            secondary,
            accent,
            base100,
            base_content,
        });
        added_count += 1;
        info!(theme = %name, idx = added_count, "Theme added");
    }

    info!(
        total_blocks = block_count,
        total_added = added_count,
        "Theme parsing complete"
    );

    // Return JSON with OK status
    (StatusCode::OK, Json(themes).into_response())
}
