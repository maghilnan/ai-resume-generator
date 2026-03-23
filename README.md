# Resume Generator

A full-stack AI-powered resume generator. Paste a job description, get a tailored resume markdown, edit it live, and export a PDF.

## Features

- **AI tailoring** — sends your work portfolio + JD to an LLM (Anthropic or OpenAI) and returns a structured resume
- **Live preview** — CodeMirror editor with a real-time HTML preview that matches the PDF output
- **PDF export** — server-side PDF generation via ReportLab; always outputs a single-page PDF sized to content
- **Save & reopen** — saved resumes stored in `output/` can be reopened and re-edited
- **Config panel** — adjust font sizes, margins, and accent color with live preview updates
- **Inline formatting** — supports `<b>`, `<i>`, `<a href="...">` and `**bold**` / `*italic*` markdown in bullet text

---

## Architecture

```
resume-generator/
├── backend/          # FastAPI + ReportLab
│   ├── app.py        # API server (all endpoints)
│   └── pdf_generator.py  # ReportLab PDF builder + content.md parser
├── frontend/         # React + Vite
│   └── src/
│       ├── App.jsx               # State machine: input → loading → editor
│       ├── components/
│       │   ├── JDInput.jsx       # Landing page: JD input + saved resume browser
│       │   ├── MarkdownEditor.jsx # 3-panel editor (CodeMirror / Preview / Sidebar)
│       │   ├── ResumePreview.jsx # Live A4 HTML preview
│       │   ├── ConfigPanel.jsx   # Typography & layout sliders
│       │   └── ExportPanel.jsx   # Save / Save As PDF export
│       └── utils/
│           ├── api.js            # Fetch wrappers + yamlConfigToFrontend()
│           └── markdownParser.js # JS port of pdf_generator parsers (for live preview)
├── data/
│   ├── experiences/  # Per-company portfolio.md + guidelines.md + meta.md
│   ├── template/     # Static resume sections (header, projects, skills, education)
│   └── prompts/      # system.md — LLM system prompt
├── configs/          # default.yaml, compact.yaml — PDF styling presets
├── output/           # Saved resumes: output/{name}/content.md + config.yaml + resume.pdf
└── dev.sh            # Starts backend + frontend together
```

### How it works

1. **Generate** — frontend sends JD + model choice to `POST /api/generate`. Backend assembles your portfolio files + template + system prompt and calls the LLM. Returns a `content.md` string.
2. **Edit** — the markdown opens in a CodeMirror editor. The live preview re-parses it on every keystroke using the same logic as the PDF generator.
3. **Export** — `POST /api/export` sends markdown + config to the backend, which runs ReportLab and saves `content.md`, `config.yaml`, and `resume.pdf` to `output/{folderName}/`. The PDF height auto-fits the content — always one page.
4. **Reopen** — the homepage lists all folders in `output/`. Clicking one calls `GET /api/applications/{name}` to restore the markdown and config into the editor.

---

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone and set up Python environment

```bash
git clone <repo>
cd resume-generator
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Configure API keys

Create a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # optional — only needed if using OpenAI models
```

### 4. Add your work portfolio

For each job, create a folder under `data/experiences/`:

```
data/experiences/
└── mycompany/
    ├── meta.md        # One line: **Role | Company | Period | Description**
    ├── portfolio.md   # Detailed work history for the LLM to draw from
    └── guidelines.md  # (optional) Extra instructions for tailoring this role
```

Edit `data/experiences/_order.txt` to control which roles appear in the resume and in what order (one folder name per line).

---

## Usage

### Start the dev server

```bash
./dev.sh
```

Opens backend on `http://localhost:8000` and frontend on `http://localhost:5173`.

### Generate a resume

1. Open the frontend in your browser
2. Paste a job description
3. Optionally add custom instructions (e.g. *"Emphasise monetisation skills"*)
4. Select an AI model and click **Generate Tailored Resume**
5. Edit the markdown and preview in real time
6. Use the **Config** tab to adjust fonts, margins, and accent color
7. Use the **Export** tab to save as PDF

### Reopen a saved resume

Saved resumes appear on the homepage. Click any row to reopen it in the editor with its original markdown and config restored.

---

## content.md Format

```markdown
## HEADER
name: Your Name
subtitle: Product Manager
contacts:
  - text: your@email.com
  - text: linkedin.com/in/you
    url: https://linkedin.com/in/you

## SUMMARY
One paragraph summary.

## PROJECTS — BUILT WITH AI
- <b>Project Name</b> — <a href='https://github.com/you/repo'>GitHub</a> · Short description

## EXPERIENCE
**Role | Company | Jan 2022 - Present | Brief tagline**
### Section Heading
- Bullet point with <b>bold metric</b> or **markdown bold**
---

## TOOLS & SKILLS
<b>Category:</b> Tool1, Tool2, Tool3

## EDUCATION
Degree, Field, University — Year
```

---

## System Prompt (`data/prompts/system.md`)

The LLM is instructed to act as an experienced recruiter and resume writer. Key rules it follows:

- **SUMMARY** — 2-3 sentences, lead with the most relevant strength, positioned specifically for the JD
- **HEADER subtitle** — replaced with a concise role title matching the JD (e.g. "Product Manager", "AI Product Manager")
- **PROJECTS** — optional; only included if AI-building skills are relevant to the JD. Selects and reorders the 3-4 most relevant projects from your template list — never adds new ones
- **TOOLS & SKILLS** — reorders categories and items to lead with the most JD-relevant skills — never adds or invents new ones
- **EXPERIENCE** — replaces `[FILL IN]` placeholders with subsections and bullets drawn strictly from each role's `portfolio.md`. Prioritises quantifiable impact; bolds key metrics with `<b>value</b>`
- **EDUCATION** — copied verbatim from the template, never modified

Output is raw `content.md` — no markdown fences or explanation — so it feeds directly into the PDF generator.

---

## Resume Template (`data/template/`)

The template is assembled from four static files that the LLM fills in or reorders:

### `header.md`
```
## HEADER
name: Your Name
subtitle: [FILL IN: 2-3 word role title]
contacts:
  - text: you@email.com
    url: mailto:you@email.com
  - text: linkedin.com/in/you
    url: https://linkedin.com/in/you
  - text: github.com/you
    url: https://github.com/you
```

### `projects.md`
```
## PROJECTS — BUILT WITH AI
[FILL IN based on the defined RULES]
- <b>Project Name</b> | <a href='https://github.com/you/repo'>Link</a> Short description
- <b>Another Project</b> | <a href='https://github.com/you/repo2'>Link</a> Short description
```
The LLM picks 3-4 relevant entries from this list and reorders them. It never adds new projects.

### `skills.md`
```
## TOOLS & SKILLS
[FILL IN - Rearrange categories and items to lead with the most relevant skills]
<b>Category 1:</b> Tool1, Tool2, Tool3
<b>Category 2:</b> Skill1, Skill2, Skill3
```
The LLM reorders categories and items but never invents new ones.

### `education.md`
```
## EDUCATION
<b>Degree, Field</b> · University · Year – Year
```
Copied verbatim — the LLM is instructed not to touch this section.

---

## PDF Styling

Edit `configs/default.yaml` (or `configs/compact.yaml`) to change fonts, margins, and colors globally. The config panel in the editor overrides these per-session and saves the result alongside the PDF.

Since the PDF always fits to one page, reducing font sizes and tightening margins is the main lever for fitting more content.
