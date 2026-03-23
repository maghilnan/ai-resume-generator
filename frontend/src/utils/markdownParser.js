/**
 * JS port of the Python content.md parser from pdf_generator.py.
 * Enables live preview without server round-trips.
 * Pure data — no rendering concerns here.
 */

/** Split text into sections by ## SECTION_NAME headers. */
export function parseContent(text) {
  const sections = {};
  let currentSection = null;
  const currentLines = [];

  for (const line of text.split("\n")) {
    const stripped = line.trim();

    // Skip pure comments (single #, not ## or ###)
    if (stripped.startsWith("# ") && !stripped.startsWith("## ")) {
      continue;
    }

    if (stripped.startsWith("## ")) {
      if (currentSection !== null) {
        sections[currentSection] = currentLines.join("\n");
        currentLines.length = 0;
      }
      currentSection = stripped.slice(3).trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentSection !== null) {
    sections[currentSection] = currentLines.join("\n");
  }

  return sections;
}

/** Parse HEADER section into {name, subtitle, contacts[{text, url}]}. */
export function parseHeader(text) {
  const header = { name: "", subtitle: "", contacts: [] };
  let inContacts = false;

  for (const line of text.trim().split("\n")) {
    const stripped = line.trim();
    if (stripped.startsWith("name:")) {
      header.name = stripped.slice(5).trim();
    } else if (stripped.startsWith("subtitle:")) {
      header.subtitle = stripped.slice(9).trim();
    } else if (stripped.startsWith("contacts:")) {
      inContacts = true;
    } else if (inContacts && stripped.startsWith("- text:")) {
      header.contacts.push({ text: stripped.slice(7).trim(), url: "" });
    } else if (inContacts && stripped.startsWith("url:") && header.contacts.length > 0) {
      header.contacts[header.contacts.length - 1].url = stripped.slice(4).trim();
    }
  }

  return header;
}

/**
 * Parse EXPERIENCE section into roles.
 * Each role: {role, company, period, desc, subsections: [{heading, bullets[]}]}
 */
export function parseExperience(text) {
  const roles = [];
  let currentRole = null;
  let currentSubsection = null;

  for (const line of text.split("\n")) {
    const stripped = line.trim();

    // Role line: **Role | Company | Period | Description**
    if (stripped.startsWith("**") && stripped.includes("|")) {
      if (currentRole) {
        if (currentSubsection) currentRole.subsections.push(currentSubsection);
        roles.push(currentRole);
      }
      const inner = stripped.replace(/^\*\*/, "").replace(/\*\*$/, "");
      const parts = inner.split("|").map((p) => p.trim());
      currentRole = {
        role: parts[0] || "",
        company: parts[1] || "",
        period: parts[2] || "",
        desc: parts[3] || "",
        subsections: [],
      };
      currentSubsection = null;
    }
    // Subsection heading: ### Heading
    else if (stripped.startsWith("### ")) {
      if (currentSubsection && currentRole) {
        currentRole.subsections.push(currentSubsection);
      }
      currentSubsection = { heading: stripped.slice(4).trim(), bullets: [] };
    }
    // Bullet
    else if (stripped.startsWith("- ")) {
      const bulletText = stripped.slice(2).trim();
      if (currentSubsection) {
        currentSubsection.bullets.push(bulletText);
      } else if (currentRole) {
        const last = currentRole.subsections[currentRole.subsections.length - 1];
        if (!last || last.heading) {
          currentRole.subsections.push({ heading: "", bullets: [] });
        }
        currentRole.subsections[currentRole.subsections.length - 1].bullets.push(bulletText);
      }
    }
    // Role separator
    else if (stripped === "---") {
      if (currentRole) {
        if (currentSubsection) {
          currentRole.subsections.push(currentSubsection);
          currentSubsection = null;
        }
        roles.push(currentRole);
        currentRole = null;
      }
    }
  }

  // Flush last role
  if (currentRole) {
    if (currentSubsection) currentRole.subsections.push(currentSubsection);
    roles.push(currentRole);
  }

  return roles;
}

/** Parse a section with simple "- bullet" lines. */
export function parseBullets(text) {
  return text
    .trim()
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => line.trim().slice(2).trim());
}

/**
 * Strip HTML tags from a string, returning plain text.
 * Used for safe text-only rendering in the preview.
 */
export function stripHtml(text) {
  return text.replace(/<[^>]+>/g, "");
}

/**
 * Convert markdown bold/italic (**text**, *text*) to HTML tags (<b>, <i>).
 */
function mdToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>");
}

/**
 * Parse inline content.md HTML (<b>, <i>, <a href="...">) and markdown
 * (**bold**, *italic*) into an array of segments for React rendering.
 */
export function parseInlineSegments(text) {
  const segments = [];
  const normalized = mdToHtml(text);
  // Split on <b>, </b>, <i>, </i>, and <a href="...">...</a> tags
  const parts = normalized.split(/(<a\s[^>]*>.*?<\/a>|<\/?(?:b|i)>)/);
  let bold = false;
  let italic = false;

  for (const part of parts) {
    if (part === "<b>") { bold = true; continue; }
    if (part === "</b>") { bold = false; continue; }
    if (part === "<i>") { italic = true; continue; }
    if (part === "</i>") { italic = false; continue; }

    // Anchor tag: extract href and inner text
    const aMatch = part.match(/^<a\s+href=['"]([^'"]*)['"]\s*>(.*?)<\/a>$/);
    if (aMatch) {
      segments.push({ text: aMatch[2], href: aMatch[1], bold, italic });
      continue;
    }

    if (part) {
      segments.push({ text: part, bold, italic });
    }
  }

  return segments;
}

/**
 * Parse all sections from a content.md string into a structured object
 * ready for ResumePreview to render.
 */
export function parseResumeForPreview(text) {
  const sections = parseContent(text);

  const header = parseHeader(sections["HEADER"] || "");
  const summary = (sections["SUMMARY"] || "").trim();

  const projectsKey = Object.keys(sections).find((k) => k.toUpperCase().includes("PROJECT"));
  const projects = projectsKey ? parseBullets(sections[projectsKey]) : [];
  const projectsSectionName = projectsKey || "PROJECTS";

  const roles = parseExperience(sections["EXPERIENCE"] || "");
  const skills = (sections["TOOLS & SKILLS"] || "").trim();
  const education = (sections["EDUCATION"] || "").trim();

  return { header, summary, projects, projectsSectionName, roles, skills, education };
}
