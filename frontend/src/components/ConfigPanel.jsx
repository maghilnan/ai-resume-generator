import { useEffect, useState } from "react";
import { getConfigs, yamlConfigToFrontend } from "../utils/api.js";

const ACCENT_COLORS = [
  "#2d5986", "#1a1a1a", "#8b5c2a", "#2d7d46",
  "#7c3aed", "#be185d", "#0e7490", "#b45309",
];

export default function ConfigPanel({ config, onChange }) {
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    getConfigs()
      .then((data) => setPresets(data.presets || []))
      .catch(() => {});
  }, []);

  const slider = (label, key, min, max, step = 0.5) => (
    <div key={key} style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10.5, color: "#99aacc" }}>{label}</span>
        <span style={{ fontSize: 10.5, color: "#7af", fontFamily: "monospace" }}>
          {config[key]}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={config[key]}
        onChange={(e) => onChange({ ...config, [key]: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: "#4a9eff", height: 4 }}
      />
    </div>
  );

  const handlePresetChange = (e) => {
    const preset = presets.find((p) => p.name === e.target.value);
    if (preset) onChange(yamlConfigToFrontend(preset.config));
  };

  return (
    <div style={{ padding: "12px 12px" }}>
      {/* Preset selector */}
      {presets.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: "#7af", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
            Preset
          </div>
          <select
            onChange={handlePresetChange}
            style={{
              width: "100%", background: "#1a1d2a", color: "#aab",
              border: "1px solid #2a2d3a", borderRadius: 5, padding: "5px 8px",
              fontSize: 11, cursor: "pointer",
            }}
          >
            <option value="">Custom</option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      <SectionLabel>Typography</SectionLabel>
      {slider("Name", "nameFontSize", 14, 26, 1)}
      {slider("Subtitle", "subtitleFontSize", 7, 13)}
      {slider("Contacts", "contactFontSize", 7, 11)}
      {slider("Section Titles", "sectionTitleFontSize", 7, 13)}
      {slider("Role Title", "roleFontSize", 7, 11)}
      {slider("Subheadings", "subheadingFontSize", 7, 11)}
      {slider("Body", "bodyFontSize", 6.5, 11)}
      {slider("Summary", "summaryFontSize", 6.5, 11)}
      {slider("Line Height", "lineHeight", 1.1, 1.55, 0.02)}

      <SectionLabel>Layout</SectionLabel>
      {slider("Margin (mm)", "pageMarginMm", 8, 22, 1)}
      {slider("Section Gap", "sectionGap", 1, 10, 1)}

      <SectionLabel>Accent Color</SectionLabel>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {ACCENT_COLORS.map((c) => (
          <div
            key={c}
            onClick={() => onChange({ ...config, accentColor: c })}
            style={{
              width: 22, height: 22, borderRadius: 5, background: c, cursor: "pointer",
              border: config.accentColor === c ? "2px solid #fff" : "2px solid transparent",
              boxShadow: config.accentColor === c ? `0 0 0 1px ${c}` : "none",
            }}
          />
        ))}
      </div>

      {/* Custom hex input */}
      <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, flexShrink: 0,
          background: config.accentColor, border: "1px solid #333",
        }} />
        <input
          type="text"
          value={config.accentColor}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange({ ...config, accentColor: v });
          }}
          style={{
            flex: 1, background: "#1a1d2a", color: "#aab", border: "1px solid #2a2d3a",
            borderRadius: 4, padding: "3px 6px", fontSize: 11, fontFamily: "monospace",
          }}
          placeholder="#2d5986"
        />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      color: "#7af", fontWeight: 700, fontSize: 9, letterSpacing: 1.5,
      marginTop: 14, marginBottom: 10, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}
