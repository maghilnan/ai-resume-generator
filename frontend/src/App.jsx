import { useState } from "react";
import JDInput from "./components/JDInput.jsx";
import MarkdownEditor from "./components/MarkdownEditor.jsx";
import { generateResume, getApplication, yamlConfigToFrontend } from "./utils/api.js";

const DEFAULT_CONFIG = {
  nameFontSize: 19,
  subtitleFontSize: 9,
  contactFontSize: 8.5,
  sectionTitleFontSize: 9.5,
  roleFontSize: 8.5,
  subheadingFontSize: 8,
  bodyFontSize: 8,
  summaryFontSize: 8,
  lineHeight: 1.3,
  pageMarginMm: 13,
  sectionGap: 5,
  accentColor: "#2d5986",
};

export default function App() {
  const [step, setStep] = useState("input"); // input | loading | editor
  const [markdown, setMarkdown] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [openedFolderName, setOpenedFolderName] = useState("");

  const handleGenerate = async (jd, model, customInstructions) => {
    setStep("loading");
    setLoadingMsg("Calling AI to tailor your resume...");
    setOpenedFolderName("");

    const result = await generateResume(jd, model, customInstructions);
    setMarkdown(result.markdown);
    setStep("editor");
  };

  const handleOpenSaved = async (name) => {
    setStep("loading");
    setLoadingMsg("Loading saved resume...");

    const result = await getApplication(name);
    setMarkdown(result.markdown || "");
    if (result.config) setConfig(yamlConfigToFrontend(result.config));
    setOpenedFolderName(name);
    setStep("editor");
  };

  const handleNewResume = () => {
    setStep("input");
    setMarkdown("");
    setOpenedFolderName("");
  };

  if (step === "input") {
    return <JDInput onGenerate={handleGenerate} onOpenSaved={handleOpenSaved} />;
  }

  if (step === "loading") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0c0e14",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #252830",
            borderTopColor: "#4a9eff", borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ color: "#aab", fontSize: 14 }}>{loadingMsg}</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <MarkdownEditor
      initialMarkdown={markdown}
      config={config}
      onConfigChange={setConfig}
      onNewResume={handleNewResume}
      initialFolderName={openedFolderName}
    />
  );
}
