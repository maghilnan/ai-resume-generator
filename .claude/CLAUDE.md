# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack resume generator:
- **Backend** (`backend/`): FastAPI + ReportLab. Handles LLM generation, PDF export, config presets, saved resume retrieval.
- **Frontend** (`frontend/`): React + Vite. State-machine UI (no router): `"input" → "loading" → "editor"`. All styles inline — no CSS framework.

## Dev Setup

```bash
./dev.sh          # starts both backend (port 8000) and frontend (Vite) together
```

Vite proxies `/api` → `http://localhost:8000`.

## Backend API (`backend/app.py`)

| Endpoint | Purpose |
|---|---|
| `GET /api/data` | Experience portfolio metadata |
| `GET /api/configs` | Config presets from `configs/*.yaml` |
| `GET /api/models` | Available LLM models (Anthropic/OpenAI) |
| `GET /api/applications` | List saved resumes in `output/` |
| `GET /api/applications/{name}` | Load saved resume (markdown + config) |
| `POST /api/generate` | LLM-tailored resume markdown |
| `POST /api/export` | Generate PDF → saves to `output/{folderName}/` |

## Architecture

### Frontend State Machine (`frontend/src/App.jsx`)
`"input"` (JDInput) → `"loading"` → `"editor"` (MarkdownEditor). Navigation is state-driven, not router-based.

### Parser Parity
`frontend/src/utils/markdownParser.js` is a JS port of `backend/pdf_generator.py`'s parsers. **Keep them in sync** — the preview must match the PDF output.

### Config Bridge
`yamlConfigToFrontend()` in `frontend/src/utils/api.js` maps nested YAML config keys (snake_case) → flat frontend config (camelCase). Always use this when loading any saved config.

### Output Structure
Each saved resume lives in `output/{folderName}/` with three files: `content.md`, `config.yaml`, `resume.pdf`.

### content.md Format
- `## SECTION_NAME` — top-level sections
- `### Subsection` — subsections within Experience
- `**Role | Company | Period | Description**` — job role blocks
- `- bullet text` — bullet points
- `<b>bold</b>` / `<i>italic</i>` / `<a href='url'>text</a>` — inline formatting
- `**bold**` / `*italic*` markdown syntax also works (converted automatically)
- `---` — role separators

### Config YAML Fields
Controls page margins, font sizes, colors (accent, text), line height, spacing. Two variants: `configs/default.yaml` and `configs/compact.yaml` (tighter layout, different accent color).

## One-Page Constraint

Both the backend PDF generator and the live preview are deliberately designed to produce single-page resumes. If content overflows:
- Adjust font sizes (`name_font_size`, `body_font_size`, etc. in config)
- Tighten margins (`top_margin`, `bottom_margin`, `side_margin`)
- Reduce bullets or summary length
