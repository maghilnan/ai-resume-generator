import { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { dracula } from "@uiw/codemirror-theme-dracula";
import ResumePreview from "./ResumePreview.jsx";
import ConfigPanel from "./ConfigPanel.jsx";
import ExportPanel from "./ExportPanel.jsx";

export default function MarkdownEditor({ initialMarkdown, config, onConfigChange, onNewResume, initialFolderName }) {
  const [markdownText, setMarkdownText] = useState(initialMarkdown || "");
  const [sidebarTab, setSidebarTab] = useState("config"); // config | export

  const handleChange = useCallback((value) => {
    setMarkdownText(value);
  }, []);

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#0c0e14", overflow: "hidden",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .cm-editor { height: 100%; font-size: 11.5px !important; }
        .cm-scroller { overflow: auto; }
        .cm-content { font-family: 'Menlo', 'Monaco', 'Courier New', monospace !important; }
      `}</style>

      {/* Left: CodeMirror editor */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        borderRight: "1px solid #1e2030", minWidth: 0,
      }}>
        <PanelHeader>
          <span style={{ color: "#7af", fontWeight: 600 }}>content.md</span>
          <span style={{ color: "#445", fontSize: 10 }}>Edit markdown directly</span>
        </PanelHeader>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <CodeMirror
            value={markdownText}
            onChange={handleChange}
            extensions={[markdown()]}
            theme={dracula}
            style={{ height: "100%" }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
            }}
          />
        </div>
      </div>

      {/* Centre: Live preview */}
      <div style={{
        flex: "0 0 auto", overflowY: "auto", background: "#0c0e14",
        display: "flex", flexDirection: "column",
      }}>
        <PanelHeader>
          <span style={{ color: "#7af", fontWeight: 600 }}>Preview</span>
          <span style={{ color: "#445", fontSize: 10 }}>HTML approximation</span>
        </PanelHeader>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.5)", borderRadius: 2, display: "inline-block" }}>
            <ResumePreview markdown={markdownText} config={config} />
          </div>
        </div>
      </div>

      {/* Right: Sidebar (config + export) */}
      <div style={{
        width: 220, flexShrink: 0, background: "#12141b",
        borderLeft: "1px solid #1e2030", display: "flex", flexDirection: "column",
      }}>
        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e2030" }}>
          {["config", "export"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSidebarTab(tab)}
              style={{
                flex: 1, padding: "8px 0", background: "none",
                border: "none", borderBottom: sidebarTab === tab ? "2px solid #4a9eff" : "2px solid transparent",
                color: sidebarTab === tab ? "#dde" : "#556",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                textTransform: "capitalize", transition: "color 0.12s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {sidebarTab === "config" && (
            <ConfigPanel config={config} onChange={onConfigChange} />
          )}
          {sidebarTab === "export" && (
            <ExportPanel markdown={markdownText} config={config} initialFolderName={initialFolderName} />
          )}
        </div>

        {/* Bottom: New resume button */}
        <div style={{ padding: 12, borderTop: "1px solid #1e2030" }}>
          <button
            onClick={onNewResume}
            style={{
              width: "100%", padding: "8px 0", background: "none",
              border: "1px solid #2a2d3a", color: "#889",
              borderRadius: 6, fontSize: 11, cursor: "pointer",
            }}
          >
            ← New Resume
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ children }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 14px", borderBottom: "1px solid #1e2030",
      background: "#12141b", flexShrink: 0, height: 36,
    }}>
      {children}
    </div>
  );
}
