#!/usr/bin/env python3
"""
Resume PDF Generator (importable module + CLI)
================================================
Reads config dict + markdown text, outputs a one-page A4 resume PDF.

Usage as module:
    from pdf_generator import generate_pdf
    generate_pdf(markdown_text, config_dict, "output/company/resume.pdf")

Usage as CLI:
    python pdf_generator.py -c ../configs/default.yaml -m ../content.md
    python pdf_generator.py -c ../configs/compact.yaml -m input.md -o out.pdf
"""

import argparse
import re
import sys
import yaml
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Flowable
)
from io import BytesIO


# ─── Content Parsers ──────────────────────────────────────────

def parse_content_from_string(text: str) -> dict:
    """Parse markdown text into structured sections dict."""
    sections = {}
    current_section = None
    current_lines = []

    for line in text.split("\n"):
        stripped = line.strip()

        # Skip pure comments (single #, not ## or ###)
        if stripped.startswith("# ") and not stripped.startswith("## "):
            continue

        if stripped.startswith("## "):
            if current_section:
                sections[current_section] = "\n".join(current_lines)
            current_section = stripped[3:].strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_section:
        sections[current_section] = "\n".join(current_lines)

    return sections


def parse_content(filepath: str) -> dict:
    """Parse a content.md file into structured sections dict."""
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()
    return parse_content_from_string(raw)


def parse_header(text: str) -> dict:
    """Parse HEADER section into name, subtitle, contacts."""
    header = {"name": "", "subtitle": "", "contacts": []}
    in_contacts = False
    for line in text.strip().split("\n"):
        stripped = line.strip()
        if stripped.startswith("name:"):
            header["name"] = stripped[5:].strip()
        elif stripped.startswith("subtitle:"):
            header["subtitle"] = stripped[9:].strip()
        elif stripped.startswith("contacts:"):
            in_contacts = True
        elif in_contacts and stripped.startswith("- text:"):
            header["contacts"].append({"text": stripped[7:].strip(), "url": ""})
        elif in_contacts and stripped.startswith("url:") and header["contacts"]:
            header["contacts"][-1]["url"] = stripped[4:].strip()
    return header


def parse_experience(text: str) -> list:
    """Parse EXPERIENCE section into roles with subsections."""
    roles = []
    current_role = None
    current_subsection = None

    for line in text.split("\n"):
        stripped = line.strip()

        # Role line: **Role | Company | Period | Description**
        if stripped.startswith("**") and "|" in stripped:
            if current_role:
                if current_subsection:
                    current_role["subsections"].append(current_subsection)
                roles.append(current_role)

            parts = stripped.strip("*").split("|")
            parts = [p.strip() for p in parts]
            current_role = {
                "role": parts[0] if len(parts) > 0 else "",
                "company": parts[1] if len(parts) > 1 else "",
                "period": parts[2] if len(parts) > 2 else "",
                "desc": parts[3] if len(parts) > 3 else "",
                "subsections": [],
            }
            current_subsection = None

        # Subsection heading: ### Heading
        elif stripped.startswith("### "):
            if current_subsection and current_role:
                current_role["subsections"].append(current_subsection)
            current_subsection = {"heading": stripped[4:].strip(), "bullets": []}

        # Bullet
        elif stripped.startswith("- "):
            bullet_text = stripped[2:].strip()
            if current_subsection:
                current_subsection["bullets"].append(bullet_text)
            elif current_role:
                if not current_role["subsections"] or current_role["subsections"][-1]["heading"]:
                    current_role["subsections"].append({"heading": "", "bullets": []})
                current_role["subsections"][-1]["bullets"].append(bullet_text)

        elif stripped == "---":
            if current_role:
                if current_subsection:
                    current_role["subsections"].append(current_subsection)
                    current_subsection = None
                roles.append(current_role)
                current_role = None

    # Flush last
    if current_role:
        if current_subsection:
            current_role["subsections"].append(current_subsection)
        roles.append(current_role)

    return roles


def parse_bullets(text: str) -> list:
    """Parse a section with simple bullet lines."""
    bullets = []
    for line in text.strip().split("\n"):
        stripped = line.strip()
        if stripped.startswith("- "):
            bullets.append(stripped[2:].strip())
    return bullets


def md_to_rl(text: str) -> str:
    """Convert markdown bold/italic (**text**, *text*) to ReportLab HTML tags."""
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    return text


# ─── PDF Builder ──────────────────────────────────────────────

class _MeasuringDoc(SimpleDocTemplate):
    """SimpleDocTemplate subclass that records the y-position after the last flowable,
    so we can compute the exact content height for a single-page PDF."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._last_y = None

    def afterFlowable(self, flowable):
        if self.frame is not None:
            self._last_y = self.frame._y


def _make_styles(config: dict):
    """Build and return all ParagraphStyle objects from config."""
    colors = config["colors"]
    fonts = config["fonts"]
    spacing = config["spacing"]

    accent = HexColor(colors["accent"])
    text_color = HexColor(colors["text"])
    subtle = HexColor(colors["subtle"])
    light = HexColor(colors["light"])
    lh = spacing["line_height_ratio"]

    return dict(
        s_name=ParagraphStyle("Name",
            fontSize=fonts["name_size"],
            leading=fonts["name_size"] * 1.1,
            textColor=text_color, fontName="Helvetica-Bold",
            alignment=TA_CENTER, spaceAfter=spacing["after_name"]),
        s_subtitle=ParagraphStyle("Subtitle",
            fontSize=fonts["subtitle_size"],
            leading=fonts["subtitle_size"] * lh,
            textColor=subtle, fontName="Helvetica",
            alignment=TA_CENTER, spaceAfter=spacing["after_subtitle"]),
        s_contacts=ParagraphStyle("Contacts",
            fontSize=fonts["contact_size"],
            leading=fonts["contact_size"] * lh,
            textColor=accent, fontName="Helvetica",
            alignment=TA_CENTER, spaceAfter=spacing["after_contacts"]),
        s_section=ParagraphStyle("Section",
            fontSize=fonts["section_title_size"],
            leading=fonts["section_title_size"] * 1.15,
            textColor=accent, fontName="Helvetica-Bold",
            spaceAfter=spacing["after_section_title"]),
        s_role=ParagraphStyle("Role",
            fontSize=fonts["role_title_size"],
            leading=fonts["role_title_size"] * lh,
            textColor=text_color, fontName="Helvetica-Bold"),
        s_role_meta=ParagraphStyle("RoleMeta",
            fontSize=fonts["body_size"] - 0.5,
            leading=(fonts["body_size"] - 0.5) * lh,
            textColor=light, fontName="Helvetica"),
        s_subheading=ParagraphStyle("Subheading",
            fontSize=fonts["subheading_size"],
            leading=fonts["subheading_size"] * lh,
            textColor=accent, fontName="Helvetica-Bold",
            spaceBefore=spacing["subsection_gap"], spaceAfter=0.5),
        s_bullet=ParagraphStyle("Bullet",
            fontSize=fonts["body_size"],
            leading=fonts["body_size"] * lh,
            textColor=text_color, fontName="Helvetica",
            leftIndent=spacing["bullet_indent"],
            firstLineIndent=-spacing["bullet_indent"],
            spaceBefore=spacing["bullet_spacing"]),
        s_summary=ParagraphStyle("Summary",
            fontSize=fonts["summary_size"],
            leading=fonts["summary_size"] * lh,
            textColor=text_color, fontName="Helvetica",
            spaceBefore=0),
        s_body=ParagraphStyle("Body",
            fontSize=fonts["body_size"],
            leading=fonts["body_size"] * lh,
            textColor=text_color, fontName="Helvetica"),
        s_body_bold=ParagraphStyle("BodyBold",
            fontSize=fonts["body_size"],
            leading=fonts["body_size"] * lh,
            textColor=text_color, fontName="Helvetica-Bold"),
        divider_color=HexColor(colors["divider"]),
        accent_hex=colors["accent"],
    )


def _make_story(config: dict, sections: dict, styles: dict) -> list:
    """Build and return the ReportLab story (list of Flowables)."""
    spacing = config["spacing"]
    s = styles
    story = []

    def divider():
        story.append(HRFlowable(
            width="100%", thickness=0.5, color=s["divider_color"],
            spaceBefore=spacing["section_gap"], spaceAfter=1))

    def section_title(title):
        story.append(Paragraph(title, s["s_section"]))

    def add_bullet(text):
        story.append(Paragraph(f"\u2022 {md_to_rl(text)}", s["s_bullet"]))

    # ─── HEADER ───
    header = parse_header(sections.get("HEADER", ""))
    story.append(Paragraph(header["name"], s["s_name"]))
    story.append(Paragraph(header["subtitle"], s["s_subtitle"]))

    contact_parts = []
    for c in header["contacts"]:
        if c["url"]:
            contact_parts.append(
                f'<a href="{c["url"]}" color="{s["accent_hex"]}">{c["text"]}</a>')
        else:
            contact_parts.append(c["text"])
    story.append(Paragraph(" &nbsp;·&nbsp; ".join(contact_parts), s["s_contacts"]))

    # ─── SUMMARY ───
    summary_text = sections.get("SUMMARY", "").strip()
    if summary_text:
        divider()
        section_title("SUMMARY")
        story.append(Paragraph(md_to_rl(summary_text), s["s_summary"]))

    # ─── PROJECTS ───
    projects_key = None
    for k in sections:
        if "PROJECT" in k.upper():
            projects_key = k
            break
    if projects_key:
        bullets = parse_bullets(sections[projects_key])
        if bullets:
            divider()
            section_title(projects_key)
            for b in bullets:
                add_bullet(b)

    # ─── EXPERIENCE ───
    exp_text = sections.get("EXPERIENCE", "")
    if exp_text.strip():
        roles = parse_experience(exp_text)
        divider()
        section_title("EXPERIENCE")

        for ri, role in enumerate(roles):
            if ri > 0:
                story.append(Spacer(1, spacing["role_gap"]))

            role_line = f"<b>{role['role']}</b> · <b>{role['company']}</b>"
            story.append(Paragraph(role_line, s["s_role"]))

            meta_parts = [role["period"]]
            if role["desc"]:
                meta_parts.append(role["desc"])
            story.append(Paragraph(" · ".join(meta_parts), s["s_role_meta"]))

            for sub in role["subsections"]:
                if sub["heading"]:
                    story.append(Paragraph(f"<b>{sub['heading']}</b>", s["s_subheading"]))
                for bullet_text in sub["bullets"]:
                    add_bullet(bullet_text)

    # ─── TOOLS & SKILLS ───
    skills_text = sections.get("TOOLS & SKILLS", "").strip()
    if skills_text:
        divider()
        section_title("TOOLS & SKILLS")
        story.append(Paragraph(skills_text, s["s_body"]))

    # ─── EDUCATION ───
    edu_text = sections.get("EDUCATION", "").strip()
    if edu_text:
        divider()
        section_title("EDUCATION")
        story.append(Paragraph(edu_text, s["s_body_bold"]))

    return story


def build_pdf(config: dict, sections: dict, output_path: str) -> None:
    """Build a single-page PDF whose height auto-fits the content."""

    page_cfg = config["page"]
    page_width = A4[0]
    top_margin    = page_cfg["margin_top_mm"] * mm
    bottom_margin = page_cfg["margin_bottom_mm"] * mm
    left_margin   = page_cfg["margin_left_mm"] * mm
    right_margin  = page_cfg["margin_right_mm"] * mm

    styles = _make_styles(config)

    # ── Pass 1: measure content height using a very tall dummy page ──
    TALL = 10000
    measure_doc = _MeasuringDoc(
        BytesIO(),
        pagesize=(page_width, TALL),
        topMargin=top_margin, bottomMargin=bottom_margin,
        leftMargin=left_margin, rightMargin=right_margin,
    )
    measure_doc.build(_make_story(config, sections, styles))

    if measure_doc._last_y is not None:
        # In ReportLab's bottom-up coords: frame top = page_height - top_margin.
        # content_height = frame_top - y_after_last_element.
        # Add FRAME_PAD (ReportLab Frame default bottomPadding=6pt): the pass-1 tall
        # page absorbs it, but pass-2's tight height excludes it, pushing the last
        # line onto a second page.
        FRAME_PAD = 6
        content_height = (TALL - top_margin) - measure_doc._last_y
        exact_height = top_margin + content_height + bottom_margin + FRAME_PAD
    else:
        exact_height = A4[1]  # fallback: standard A4 height

    # ── Pass 2: render at exact content height ──
    doc = SimpleDocTemplate(
        output_path,
        pagesize=(page_width, exact_height),
        topMargin=top_margin, bottomMargin=bottom_margin,
        leftMargin=left_margin, rightMargin=right_margin,
    )
    doc.build(_make_story(config, sections, styles))


def generate_pdf(markdown_text: str, config_dict: dict, output_path: str) -> str:
    """High-level function: parse markdown + config, generate PDF, return path."""
    sections = parse_content_from_string(markdown_text)
    build_pdf(config_dict, sections, output_path)
    return output_path


# ─── CLI ──────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a one-page resume PDF")
    parser.add_argument("-c", "--config", default="../configs/default.yaml",
                        help="Path to config YAML (default: ../configs/default.yaml)")
    parser.add_argument("-m", "--content", default="../data/content.md",
                        help="Path to content markdown (default: ../data/content.md)")
    parser.add_argument("-o", "--output", default=None,
                        help="Output PDF path (overrides config)")
    args = parser.parse_args()

    with open(args.config, "r") as f:
        config = yaml.safe_load(f)

    sections = parse_content(args.content)
    output_path = args.output or "resume.pdf"

    build_pdf(config, sections, output_path)
    print(f"\n✅ Resume generated: {output_path}")
    print(f"   Config: {args.config}")
    print(f"   Content: {args.content}")
