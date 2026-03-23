/**
 * Fetch wrappers for the backend API.
 * All paths are relative — Vite proxies /api → http://localhost:8000
 */

async function handleResponse(res) {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.json();
}

/** GET /api/data — returns {portfolio, portfolioExists, guidelines, guidelinesExists} */
export function getAppData() {
  return fetch("/api/data").then(handleResponse);
}

/** GET /api/configs — returns {presets: [{name, label, config}]} */
export function getConfigs() {
  return fetch("/api/configs").then(handleResponse);
}

/** GET /api/models — returns {models: [{id, label, provider, available}], default} */
export function getModels() {
  return fetch("/api/models").then(handleResponse);
}

/** GET /api/applications — returns {applications: [{name, path, hasPdf, hasMarkdown}]} */
export function getApplications() {
  return fetch("/api/applications").then(handleResponse);
}

/** GET /api/applications/{name} — returns {name, markdown, config} */
export function getApplication(name) {
  return fetch(`/api/applications/${encodeURIComponent(name)}`).then(handleResponse);
}

/** POST /api/generate — returns {markdown} */
export function generateResume(jd, model, customInstructions = "") {
  return fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd, model, customInstructions }),
  }).then(handleResponse);
}

/**
 * POST /api/export — returns a PDF blob for download.
 * @param {string} markdown
 * @param {object} config  frontend config object
 * @param {string} folderName
 */
export async function exportResume(markdown, config, folderName) {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, config, folderName }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return res.blob();
}

/**
 * Convert a backend YAML config object to the flat frontend config shape.
 * Used when loading a preset from /api/configs.
 */
export function yamlConfigToFrontend(yaml) {
  const p = yaml?.page || {};
  const f = yaml?.fonts || {};
  const s = yaml?.spacing || {};
  const c = yaml?.colors || {};

  const margin = p.margin_left_mm ?? 13;
  return {
    nameFontSize: f.name_size ?? 19,
    subtitleFontSize: f.subtitle_size ?? 9,
    contactFontSize: f.contact_size ?? 8.5,
    sectionTitleFontSize: f.section_title_size ?? 9.5,
    roleFontSize: f.role_title_size ?? 8.5,
    subheadingFontSize: f.subheading_size ?? 8,
    bodyFontSize: f.body_size ?? 8,
    summaryFontSize: f.summary_size ?? 8,
    lineHeight: s.line_height_ratio ?? 1.30,
    pageMarginMm: margin,
    sectionGap: s.section_gap ?? 5,
    accentColor: c.accent ?? "#2d5986",
  };
}
