import { useEffect, useState } from "react";
import { exportResume } from "../utils/api.js";

export default function ExportPanel({ markdown, config, initialFolderName }) {
  const [saveAsName, setSaveAsName] = useState(initialFolderName || "");
  const [saveStatus, setSaveStatus] = useState("idle");    // idle | loading | success | error
  const [saveAsStatus, setSaveAsStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [saveAsError, setSaveAsError] = useState("");
  const [savedPath, setSavedPath] = useState("");

  useEffect(() => {
    setSaveAsName(initialFolderName || "");
    setSaveStatus("idle");
    setSaveAsStatus("idle");
  }, [initialFolderName]);

  const doExport = async (folderName, setStatus, setError) => {
    setStatus("loading");
    setError("");
    try {
      const blob = await exportResume(markdown, config, folderName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}_resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSavedPath(`output/${folderName}/`);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleSave = () => {
    doExport(initialFolderName, setSaveStatus, setSaveError);
  };

  const handleSaveAs = () => {
    const name = saveAsName.trim();
    if (!name) {
      setSaveAsError("Enter a folder name (e.g. google-pm-2026)");
      setSaveAsStatus("error");
      return;
    }
    doExport(name, setSaveAsStatus, setSaveAsError);
  };

  return (
    <div style={{ padding: "12px 12px" }}>
      <div style={{
        color: "#7af", fontWeight: 700, fontSize: 9, letterSpacing: 1.5,
        marginBottom: 12, textTransform: "uppercase",
      }}>
        Export PDF
      </div>

      {/* Save (overwrite existing) — only shown when editing a saved resume */}
      {initialFolderName && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10.5, color: "#99aacc", marginBottom: 6 }}>
            Save
          </div>
          <div style={{ fontSize: 9.5, color: "#556", marginBottom: 6 }}>
            Overwrites <code style={{ fontFamily: "monospace", color: "#778" }}>output/{initialFolderName}/</code>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === "loading"}
            style={{
              width: "100%", padding: "8px 0",
              background: saveStatus === "loading" ? "#2a3a55" : "#2d5986",
              color: saveStatus === "loading" ? "#668" : "#fff",
              border: "none", borderRadius: 6, fontSize: 12,
              fontWeight: 700, cursor: saveStatus === "loading" ? "wait" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {saveStatus === "loading" ? "Saving..." : "Save"}
          </button>

          {saveStatus === "success" && (
            <div style={{
              marginTop: 8, padding: "6px 8px", borderRadius: 6,
              background: "rgba(74,255,140,0.08)", border: "1px solid rgba(74,255,140,0.2)",
              fontSize: 10, color: "#4fda88",
            }}>
              Saved to <code style={{ fontFamily: "monospace" }}>{savedPath}</code>
            </div>
          )}
          {saveStatus === "error" && saveError && (
            <div style={{
              marginTop: 8, padding: "6px 8px", borderRadius: 6,
              background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)",
              fontSize: 10, color: "#f77",
            }}>
              {saveError}
            </div>
          )}

          <div style={{ borderTop: "1px solid #1e2030", margin: "14px 0" }} />
        </div>
      )}

      {/* Save As */}
      <div>
        <div style={{ fontSize: 10.5, color: "#99aacc", marginBottom: 6 }}>
          Save As
        </div>
        <input
          type="text"
          value={saveAsName}
          onChange={(e) => { setSaveAsName(e.target.value); setSaveAsStatus("idle"); }}
          placeholder="google-pm-2026"
          style={{
            width: "100%", background: "#1a1d2a", color: "#dde",
            border: "1px solid #2a2d3a", borderRadius: 5, padding: "6px 8px",
            fontSize: 11, fontFamily: "monospace", boxSizing: "border-box",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSaveAs()}
        />
        <div style={{ fontSize: 9.5, color: "#445", marginTop: 3, marginBottom: 8 }}>
          Saves to output/{saveAsName || "…"}/
        </div>
        <button
          onClick={handleSaveAs}
          disabled={saveAsStatus === "loading"}
          style={{
            width: "100%", padding: "8px 0",
            background: saveAsStatus === "loading" ? "#2a3a55" : "#4a9eff",
            color: saveAsStatus === "loading" ? "#668" : "#fff",
            border: "none", borderRadius: 6, fontSize: 12,
            fontWeight: 700, cursor: saveAsStatus === "loading" ? "wait" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {saveAsStatus === "loading" ? "Generating PDF..." : "Save As"}
        </button>

        {saveAsStatus === "success" && (
          <div style={{
            marginTop: 8, padding: "6px 8px", borderRadius: 6,
            background: "rgba(74,255,140,0.08)", border: "1px solid rgba(74,255,140,0.2)",
            fontSize: 10, color: "#4fda88",
          }}>
            Saved to <code style={{ fontFamily: "monospace" }}>{savedPath}</code>
            <br />
            <span style={{ color: "#3a9a60" }}>content.md and config.yaml also saved.</span>
          </div>
        )}
        {saveAsStatus === "error" && saveAsError && (
          <div style={{
            marginTop: 8, padding: "6px 8px", borderRadius: 6,
            background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)",
            fontSize: 10, color: "#f77",
          }}>
            {saveAsError}
          </div>
        )}
      </div>
    </div>
  );
}
