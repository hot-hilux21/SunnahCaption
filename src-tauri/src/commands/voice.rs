use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::PathBuf;

use crate::path_utils;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VoiceGenerationRequest {
    pub text: String,
    pub voice_id: String,
    pub api_key: String,
    pub output_path: String,
    pub model_id: Option<String>,
}

/// Genere un fichier audio avec l'API ElevenLabs.
///
/// @param request Texte, voix, cle API et chemin de sortie.
/// @returns Chemin du fichier audio genere.
#[tauri::command]
pub async fn generate_elevenlabs_tts(
    request: VoiceGenerationRequest,
) -> Result<String, String> {
    if request.text.trim().is_empty() {
        return Err("Text is required".to_string());
    }
    if request.voice_id.trim().is_empty() {
        return Err("Voice ID is required".to_string());
    }
    if request.api_key.trim().is_empty() {
        return Err("API key is required".to_string());
    }

    let model_id = request
        .model_id
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "eleven_multilingual_v2".to_string());

    let url = format!(
        "https://api.elevenlabs.io/v1/text-to-speech/{}",
        request.voice_id.trim()
    );

    let body = json!({
        "text": request.text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    });

    let client = reqwest::Client::new();
    let response = client
        .post(url)
        .header("xi-api-key", request.api_key.trim())
        .header(CONTENT_TYPE, "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|error| format!("ElevenLabs request failed: {error}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_default();
        return Err(format!("ElevenLabs error {status}: {error_body}"));
    }

    let audio_bytes = response
        .bytes()
        .await
        .map_err(|error| format!("Failed to read ElevenLabs audio: {error}"))?;

    let output_path = path_utils::normalize_output_path(&request.output_path);
    if let Some(parent) = output_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create output directory: {error}"))?;
    }
    fs::write(&output_path, audio_bytes)
        .map_err(|error| format!("Failed to write audio file: {error}"))?;

    Ok(output_path.to_string_lossy().to_string())
}

/// Genere un fichier audio avec une API TTS gratuite compatible arabe.
///
/// Cette implementation utilise le point de terminaison public de Google Translate
/// TTS pour les cas ou aucune cle API ElevenLabs n'est configuree.
#[tauri::command]
pub async fn generate_free_arabic_tts(
    text: String,
    output_path: String,
    language: Option<String>,
) -> Result<String, String> {
    if text.trim().is_empty() {
        return Err("Text is required".to_string());
    }

    let language = language.unwrap_or_else(|| "ar".to_string());
    let url = format!(
        "https://translate.google.com/translate_tts?ie=UTF-8&q={}&tl={}&client=tw-ob",
        urlencoding(&text),
        urlencoding(&language)
    );

    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header("User-Agent", "Mozilla/5.0")
        .send()
        .await
        .map_err(|error| format!("Free TTS request failed: {error}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_default();
        return Err(format!("Free TTS error {status}: {error_body}"));
    }

    let audio_bytes = response
        .bytes()
        .await
        .map_err(|error| format!("Failed to read free TTS audio: {error}"))?;

    let output_path = path_utils::normalize_output_path(&output_path);
    if let Some(parent) = output_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create output directory: {error}"))?;
    }
    fs::write(&output_path, audio_bytes)
        .map_err(|error| format!("Failed to write audio file: {error}"))?;

    Ok(output_path.to_string_lossy().to_string())
}

fn urlencoding(value: &str) -> String {
    value
        .bytes()
        .map(|byte| match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                (byte as char).to_string()
            }
            _ => format!("%{:02X}", byte),
        })
        .collect()
}
PY