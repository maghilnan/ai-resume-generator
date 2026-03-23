import { useState, useEffect } from "react";
import { getAppData, getModels, getApplications } from "../utils/api.js";

const PROVIDER_COLORS = {
  anthropic: "#c97a4a",
  openai:    "#19c37d",
};

export default function JDInput({ onGenerate, onOpenSaved }) {
  const [jd, setJd] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState({ experiences: [], portfolioExists: false });
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    getAppData()
      .then((data) => setDataStatus(data))
      .catch(() => {});

    getModels()
      .then((data) => {
        setModels(data.models || []);
        setSelectedModel(data.default || "");
      })
      .catch(() => {});

    getApplications()
      .then((data) => setApplications(data.applications || []))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!jd.trim()) {
      setError("Please paste a job description.");
      return;
    }
    if (!dataStatus.portfolioExists) {
      setError("No experience portfolios found. Add portfolio.md to at least one folder in data/experiences/.");
      return;
    }
    const model = models.find((m) => m.id === selectedModel);
    if (model && !model.available) {
      const keyName = model.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY";
      setError(`${keyName} not set in .env`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onGenerate(jd, selectedModel, customInstructions);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Group models by provider for the dropdown
  const anthropicModels = models.filter((m) => m.provider === "anthropic");
  const openaiModels = models.filter((m) => m.provider === "openai");

  const selectedMeta = models.find((m) => m.id === selectedModel);

  return (
    <div style={{
      minHeight: "100vh", background: "#0c0e14", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        ::placeholder { color: #444; }
        textarea:focus { outline: none; border-color: #4a9eff !important; box-shadow: 0 0 0 2px rgba(74,158,255,0.12); }
        select option:disabled { color: #556; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 640, padding: 24 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Resume Generator
          </div>
          <div style={{ fontSize: 13, color: "#667", marginTop: 6 }}>
            Paste a JD → get AI-tailored markdown → edit → generate a proper PDF
          </div>
        </div>

        {/* Status row: data indicators + model selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          {dataStatus.experiences.map((exp) => (
            <StatusPill
              key={exp.name}
              label={exp.name.charAt(0).toUpperCase() + exp.name.slice(1)}
              active={exp.hasPortfolio}
              hint={exp.hasPortfolio
                ? `data/experiences/${exp.name}/portfolio.md loaded${exp.hasGuidelines ? " + guidelines" : ""}`
                : `Add data/experiences/${exp.name}/portfolio.md`
              }
            />
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Model selector */}
          {models.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {selectedMeta && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: PROVIDER_COLORS[selectedMeta.provider] || "#7af",
                }} />
              )}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  background: "#141720", color: "#dde",
                  border: "1px solid #252830", borderRadius: 6,
                  padding: "5px 8px", fontSize: 11.5, cursor: "pointer",
                  outline: "none",
                }}
              >
                {anthropicModels.length > 0 && (
                  <optgroup label="Anthropic">
                    {anthropicModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}{!m.available ? " (no key)" : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {openaiModels.length > 0 && (
                  <optgroup label="OpenAI">
                    {openaiModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}{!m.available ? " (no key)" : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#8899aa", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Job Description <span style={{ color: "#f55" }}>*</span>
          </div>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{
              width: "100%", minHeight: 240, padding: 14, fontSize: 13,
              lineHeight: 1.6, background: "#141720", color: "#dde",
              border: "1px solid #252830", borderRadius: 8,
              fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Custom Instructions */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#8899aa", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            Custom Instructions <span style={{ color: "#445", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </div>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={'e.g. "Use \'AI Product Manager\' as the subtitle" or "Emphasize monetization skills"'}
            style={{
              width: "100%", minHeight: 72, padding: 12, fontSize: 12,
              lineHeight: 1.6, background: "#0f1118", color: "#aab",
              border: "1px solid #1e2230", borderRadius: 8,
              fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div style={{ color: "#f77", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 0",
            background: loading ? "#2a3a55" : "#4a9eff",
            color: loading ? "#668" : "#fff",
            border: "none", borderRadius: 8, fontSize: 14,
            fontWeight: 700, cursor: loading ? "wait" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Generating..." : "Generate Tailored Resume"}
        </button>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#445" }}>
          LLM call happens server-side — API keys stay in .env
        </div>

        {/* Saved resumes */}
        {applications.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
            }}>
              <div style={{ flex: 1, height: 1, background: "#1e2230" }} />
              <span style={{ fontSize: 11, color: "#445", whiteSpace: "nowrap" }}>or open a saved resume</span>
              <div style={{ flex: 1, height: 1, background: "#1e2230" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {applications.map((app) => (
                <SavedResumeRow key={app.name} app={app} onClick={() => onOpenSaved(app.name)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, active, hint }) {
  return (
    <div
      title={hint}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 10px", borderRadius: 20,
        background: active ? "rgba(74,255,140,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(74,255,140,0.25)" : "#252830"}`,
        fontSize: 11, color: active ? "#4fda88" : "#556",
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: active ? "#4fda88" : "#334",
        flexShrink: 0,
      }} />
      {label}
    </div>
  );
}

function SavedResumeRow({ app, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 14px", borderRadius: 7, cursor: "pointer",
        background: "#141720",
        border: `1px solid ${hovered ? "#4a9eff" : "#252830"}`,
        transition: "border-color 0.12s",
      }}
    >
      <span style={{ fontSize: 12.5, color: "#ccd", fontFamily: "monospace" }}>{app.name}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {app.hasMarkdown && (
          <span style={{ fontSize: 10, color: "#4fda88", background: "rgba(74,255,140,0.08)", border: "1px solid rgba(74,255,140,0.2)", borderRadius: 4, padding: "2px 6px" }}>MD</span>
        )}
        {app.hasPdf && (
          <span style={{ fontSize: 10, color: "#7af", background: "rgba(100,170,255,0.08)", border: "1px solid rgba(100,170,255,0.2)", borderRadius: 4, padding: "2px 6px" }}>PDF</span>
        )}
      </div>
    </div>
  );
}
