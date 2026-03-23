#!/usr/bin/env python3
"""
FastAPI backend for the Resume Generator web app.

Run with:
    uvicorn app:app --reload --port 8000
"""

import os
import yaml
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
from openai import OpenAI

from pdf_generator import generate_pdf

load_dotenv(Path(__file__).parent.parent / ".env")

app = FastAPI(title="Resume Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIGS_DIR = BASE_DIR / "configs"
OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(exist_ok=True)


# ─── Data assembly ────────────────────────────────────────────

def load_experiences() -> list[dict]:
    """Load ordered experience metadata from data/experiences/.

    Order is controlled by data/experiences/_order.txt (one folder name per line).
    Falls back to alphabetical if the file is missing.
    """
    exp_dir = DATA_DIR / "experiences"
    order_file = exp_dir / "_order.txt"

    if order_file.exists():
        names = [n.strip() for n in order_file.read_text(encoding="utf-8").splitlines() if n.strip()]
    else:
        names = sorted(d.name for d in exp_dir.iterdir() if d.is_dir())

    experiences = []
    for name in names:
        folder = exp_dir / name
        if not folder.is_dir():
            continue
        meta_path = folder / "meta.md"
        portfolio_path = folder / "portfolio.md"
        guidelines_path = folder / "guidelines.md"
        experiences.append({
            "name": name,
            "folder": folder,
            "meta": meta_path.read_text(encoding="utf-8").strip() if meta_path.exists() else "",
            "has_portfolio": portfolio_path.exists() and portfolio_path.stat().st_size > 0,
            "has_guidelines": guidelines_path.exists() and guidelines_path.stat().st_size > 0,
        })
    return experiences


def assemble_template(experiences: list[dict]) -> str:
    """Compose the full resume content template from data/template/ parts + experience meta."""
    tmpl = DATA_DIR / "template"

    parts = []
    parts.append((tmpl / "header.md").read_text(encoding="utf-8").strip())
    parts.append("")
    parts.append("## SUMMARY")
    parts.append("[FILL IN: 2-3 sentences tailored to the job description]")
    parts.append("")
    parts.append((tmpl / "projects.md").read_text(encoding="utf-8").strip())
    parts.append("")
    parts.append("## EXPERIENCE")

    for i, exp in enumerate(experiences):
        parts.append("")
        parts.append(exp["meta"])
        parts.append("")
        parts.append(f"[FILL IN {exp['name'].upper()} BULLETS]")
        if i < len(experiences) - 1:
            parts.append("")
            parts.append("---")

    parts.append("")
    parts.append((tmpl / "skills.md").read_text(encoding="utf-8").strip())
    parts.append("")
    parts.append((tmpl / "education.md").read_text(encoding="utf-8").strip())

    return "\n".join(parts)


def assemble_system_prompt(custom_instructions: str = "") -> str:
    """Compose system prompt from data/prompts/system.md + optional custom instructions."""
    base = (DATA_DIR / "prompts" / "system.md").read_text(encoding="utf-8").strip()

    if custom_instructions and custom_instructions.strip():
        base += "\n\nCUSTOM INSTRUCTIONS (take priority over defaults above):\n" + custom_instructions.strip()

    return base


# ─── Config converter ─────────────────────────────────────────

def frontend_config_to_yaml(fc: dict) -> dict:
    """Convert flat frontend config keys to nested YAML config structure."""
    margin = fc.get("pageMarginMm", 13)
    return {
        "page": {
            "margin_top_mm": fc.get("marginTopMm", margin),
            "margin_bottom_mm": fc.get("marginBottomMm", max(margin - 2, 8)),
            "margin_left_mm": fc.get("marginLeftMm", margin),
            "margin_right_mm": fc.get("marginRightMm", margin),
        },
        "colors": {
            "accent": fc.get("accentColor", "#2d5986"),
            "text": "#1a1a1a",
            "subtle": "#555555",
            "light": "#888888",
            "divider": "#cccccc",
        },
        "fonts": {
            "name_size": fc.get("nameFontSize", 19),
            "subtitle_size": fc.get("subtitleFontSize", 9),
            "contact_size": fc.get("contactFontSize", 8.5),
            "section_title_size": fc.get("sectionTitleFontSize", 9.5),
            "role_title_size": fc.get("roleFontSize", 8.5),
            "subheading_size": fc.get("subheadingFontSize", 8),
            "body_size": fc.get("bodyFontSize", 8),
            "summary_size": fc.get("summaryFontSize", 8),
        },
        "spacing": {
            "line_height_ratio": fc.get("lineHeight", 1.30),
            "section_gap": fc.get("sectionGap", 5),
            "subsection_gap": 3,
            "bullet_indent": 6,
            "role_gap": 5,
            "after_name": 1,
            "after_subtitle": 2,
            "after_contacts": 2,
            "after_section_title": 2,
            "bullet_spacing": 0.5,
        },
    }


# ─── Available models ─────────────────────────────────────────

MODELS = [
    {"id": "claude-sonnet-4-6", "label": "Claude Sonnet 4.6", "provider": "anthropic"},
    {"id": "claude-opus-4-6",   "label": "Claude Opus 4.6",   "provider": "anthropic"},
    {"id": "gpt-5.4",           "label": "GPT-5.4",           "provider": "openai"},
    {"id": "gpt-5.4-mini",      "label": "GPT-5.4 mini",      "provider": "openai"},
]

DEFAULT_MODEL = "gpt-5.4-mini"


# ─── Request models ───────────────────────────────────────────

class GenerateRequest(BaseModel):
    jd: str
    model: str = DEFAULT_MODEL
    customInstructions: str = ""

class ExportRequest(BaseModel):
    markdown: str
    config: dict
    folderName: str


# ─── Endpoints ────────────────────────────────────────────────

@app.get("/api/data")
def get_data():
    """Return per-experience data status from data/experiences/."""
    experiences = load_experiences()
    exp_status = [
        {
            "name": exp["name"],
            "hasPortfolio": exp["has_portfolio"],
            "hasGuidelines": exp["has_guidelines"],
        }
        for exp in experiences
    ]
    return {
        "experiences": exp_status,
        # Backward compat: true if any experience has a portfolio
        "portfolioExists": any(e["has_portfolio"] for e in experiences),
        "guidelinesExists": any(e["has_guidelines"] for e in experiences),
    }


@app.get("/api/configs")
def get_configs():
    """List available config presets from configs/."""
    presets = []
    for yaml_file in sorted(CONFIGS_DIR.glob("*.yaml")):
        with open(yaml_file) as f:
            config = yaml.safe_load(f)
        presets.append({
            "name": yaml_file.stem,
            "label": yaml_file.stem.replace("-", " ").replace("_", " ").title(),
            "config": config,
        })
    return {"presets": presets}


@app.get("/api/applications")
def get_applications():
    """List output subfolders with metadata."""
    applications = []
    for folder in sorted(OUTPUT_DIR.iterdir()):
        if folder.is_dir():
            applications.append({
                "name": folder.name,
                "path": str(folder),
                "hasPdf": (folder / "resume.pdf").exists(),
                "hasMarkdown": (folder / "content.md").exists(),
            })
    return {"applications": applications}


@app.get("/api/applications/{name}")
def get_application(name: str):
    """Return content.md and config.yaml for a saved resume folder."""
    folder = OUTPUT_DIR / name
    if not folder.is_dir():
        raise HTTPException(status_code=404, detail="Application not found")

    result = {"name": name}

    content_path = folder / "content.md"
    if content_path.exists():
        result["markdown"] = content_path.read_text(encoding="utf-8")

    config_path = folder / "config.yaml"
    if config_path.exists():
        with open(config_path) as f:
            result["config"] = yaml.safe_load(f)

    return result


@app.get("/api/models")
def get_models():
    """Return available models, flagging which providers have API keys configured."""
    has_anthropic = bool(os.environ.get("ANTHROPIC_API_KEY"))
    has_openai = bool(os.environ.get("OPENAI_API_KEY"))
    return {
        "models": [
            {**m, "available": has_anthropic if m["provider"] == "anthropic" else has_openai}
            for m in MODELS
        ],
        "default": DEFAULT_MODEL,
    }


@app.post("/api/generate")
def generate_resume(body: GenerateRequest):
    """Call the selected LLM to generate tailored content.md from JD + per-experience portfolios."""
    experiences = load_experiences()

    if not any(e["has_portfolio"] for e in experiences):
        raise HTTPException(
            status_code=400,
            detail="No experience portfolios found. Add portfolio.md to at least one folder in data/experiences/."
        )

    content_template = assemble_template(experiences)
    system_prompt = assemble_system_prompt(body.customInstructions)

    # Build per-experience portfolio/guidelines sections
    portfolio_sections = []
    for exp in experiences:
        if exp["has_portfolio"]:
            portfolio_text = (exp["folder"] / "portfolio.md").read_text(encoding="utf-8")
            section = f"### {exp['name'].upper()} PORTFOLIO:\n{portfolio_text}"
            if exp["has_guidelines"]:
                guidelines_text = (exp["folder"] / "guidelines.md").read_text(encoding="utf-8")
                section += f"\n\n### {exp['name'].upper()} GUIDELINES:\n{guidelines_text}"
            portfolio_sections.append(section)

    user_message = f"""## JOB DESCRIPTION:
{body.jd}

## CANDIDATE PORTFOLIOS:
{"".join(portfolio_sections)}

## RESUME TEMPLATE (fill in ALL [FILL IN] sections):
{content_template}"""

    # Determine provider from model id
    model_meta = next((m for m in MODELS if m["id"] == body.model), None)
    provider = model_meta["provider"] if model_meta else (
        "openai" if body.model.startswith(("gpt-", "o1", "o3", "o4")) else "anthropic"
    )

    if provider == "anthropic":
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set in .env")
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=body.model,
            max_tokens=4000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        markdown = message.content[0].text.strip()

    else:  # openai
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set in .env")
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=body.model,
            max_completion_tokens=4000,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        markdown = response.choices[0].message.content.strip()

    return {"markdown": markdown}


@app.post("/api/export")
def export_resume(body: ExportRequest):
    """Generate PDF, save to output/{folderName}/, return PDF for download."""
    # Sanitize folder name
    folder_name = "".join(c for c in body.folderName if c.isalnum() or c in "-_").strip("-_")
    if not folder_name:
        raise HTTPException(status_code=400, detail="Invalid folder name")

    folder_path = OUTPUT_DIR / folder_name
    folder_path.mkdir(parents=True, exist_ok=True)

    # Save content.md
    (folder_path / "content.md").write_text(body.markdown, encoding="utf-8")

    # Convert frontend config to YAML structure
    config_dict = frontend_config_to_yaml(body.config)

    # Save config.yaml
    with open(folder_path / "config.yaml", "w") as f:
        yaml.dump(config_dict, f, default_flow_style=False)

    # Generate PDF
    pdf_path = folder_path / "resume.pdf"
    try:
        generate_pdf(body.markdown, config_dict, str(pdf_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename=f"{folder_name}_resume.pdf",
    )
