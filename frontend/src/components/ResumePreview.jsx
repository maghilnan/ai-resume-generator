import { useMemo } from "react";
import { parseResumeForPreview, parseInlineSegments } from "../utils/markdownParser.js";

/**
 * Renders a content.md string as an A4-sized HTML preview
 * matching the PDF layout as closely as possible.
 */
export default function ResumePreview({ markdown, config }) {
  const data = useMemo(() => parseResumeForPreview(markdown || ""), [markdown]);

  const accent = config.accentColor || "#2d5986";
  const marginMm = config.pageMarginMm || 13;
  const bottomMarginMm = Math.max(marginMm - 2, 8); // matches backend frontend_config_to_yaml
  const body = config.bodyFontSize || 8;
  const lh = config.lineHeight || 1.3;

  // All sizes in "pt" to match ReportLab's point-based sizing (1pt ≠ 1px).
  // This makes the preview faithfully represent what the PDF will look like.
  const pt = (n) => `${n}pt`;

  const styles = {
    page: {
      width: "210mm", background: "white",
      paddingTop: `${marginMm}mm`, paddingBottom: `${bottomMarginMm}mm`,
      paddingLeft: `${marginMm}mm`, paddingRight: `${marginMm}mm`,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: "#1a1a1a", boxSizing: "border-box", fontSize: pt(body),
    },
    name: {
      fontSize: pt(config.nameFontSize || 19), fontWeight: 700, textAlign: "center",
      letterSpacing: 1.5, marginBottom: pt(1), lineHeight: pt((config.nameFontSize || 19) * 1.1),
    },
    subtitle: {
      fontSize: pt(config.subtitleFontSize || 9), textAlign: "center",
      color: "#555555", lineHeight: pt((config.subtitleFontSize || 9) * lh), marginBottom: pt(2),
    },
    contacts: {
      display: "flex", justifyContent: "center", gap: pt(10),
      flexWrap: "wrap", marginTop: pt(2), marginBottom: pt(4),
      fontSize: pt(config.contactFontSize || 8.5), color: accent,
    },
    divider: {
      borderTop: "0.5px solid #cccccc",
      marginTop: pt(config.sectionGap || 5),
      marginBottom: pt(2),
    },
    sectionTitle: {
      fontSize: pt(config.sectionTitleFontSize || 9.5), fontWeight: 700,
      color: accent, marginBottom: pt(2), lineHeight: pt((config.sectionTitleFontSize || 9.5) * 1.15),
    },
    roleTitle: {
      fontSize: pt(config.roleFontSize || 8.5), fontWeight: 700,
      lineHeight: pt((config.roleFontSize || 8.5) * lh),
    },
    roleMeta: {
      fontSize: pt((config.bodyFontSize || 8) - 0.5), color: "#888888",
      lineHeight: pt(((config.bodyFontSize || 8) - 0.5) * lh),
    },
    subheading: {
      fontSize: pt(config.subheadingFontSize || 8), fontWeight: 700, color: accent,
      marginTop: pt(3), marginBottom: pt(0.5), lineHeight: pt((config.subheadingFontSize || 8) * lh),
    },
    bullet: {
      display: "flex", gap: pt(5), marginBottom: pt(0.5),
      paddingLeft: pt(8), lineHeight: pt(body * lh), fontSize: pt(body),
    },
    dot: { flexShrink: 0, marginTop: 0 },
    summary: { fontSize: pt(config.summaryFontSize || 8), lineHeight: pt((config.summaryFontSize || 8) * lh) },
    bodyText: { fontSize: pt(body), lineHeight: pt(body * lh) },
    bodyBold: { fontSize: pt(body), fontWeight: 700, lineHeight: pt(body * lh) },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.name}>{data.header.name || "Name"}</div>
      <div style={styles.subtitle}>{data.header.subtitle}</div>
      <div style={styles.contacts}>
        {data.header.contacts.map((c, i) => (
          <span key={i}>{c.text}{i < data.header.contacts.length - 1 && <span style={{ color: "#aaa", margin: "0 3px" }}>·</span>}</span>
        ))}
      </div>

      {/* Summary */}
      {data.summary && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>SUMMARY</div>
          <div style={styles.summary}>
            <Inline text={data.summary} accentColor={accent} />
          </div>
        </>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>{data.projectsSectionName}</div>
          {data.projects.map((b, i) => (
            <BulletRow key={i} text={b} styles={styles} accentColor={accent} />
          ))}
        </>
      )}

      {/* Experience */}
      {data.roles.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>EXPERIENCE</div>
          {data.roles.map((role, ri) => (
            <div key={ri} style={{ marginTop: ri > 0 ? "5pt" : 0 }}>
              <div style={styles.roleTitle}>
                <span>{role.role}</span>
                {role.company && <span style={{ fontWeight: 400 }}> · </span>}
                <span>{role.company}</span>
              </div>
              <div style={styles.roleMeta}>
                {[role.period, role.desc].filter(Boolean).join(" · ")}
              </div>
              {role.subsections.map((sub, si) => (
                <div key={si}>
                  {sub.heading && (
                    <div style={styles.subheading}>{sub.heading}</div>
                  )}
                  {sub.bullets.map((b, bi) => (
                    <BulletRow key={bi} text={b} styles={styles} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {data.skills && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>TOOLS & SKILLS</div>
          <div style={styles.bodyText}>
            <Inline text={data.skills} accentColor={accent} />
          </div>
        </>
      )}

      {/* Education */}
      {data.education && (
        <>
          <div style={styles.divider} />
          <div style={styles.sectionTitle}>EDUCATION</div>
          <div style={styles.bodyBold}>
            <Inline text={data.education} accentColor={accent} />
          </div>
        </>
      )}
    </div>
  );
}

/** Render a bullet row with dot */
function BulletRow({ text, styles, accentColor }) {
  return (
    <div style={styles.bullet}>
      <span style={styles.dot}>•</span>
      <span><Inline text={text} accentColor={accentColor} /></span>
    </div>
  );
}

/** Render inline text with <b>, <i>, and <a href="..."> segments as React elements */
function Inline({ text, accentColor }) {
  const segments = parseInlineSegments(text || "");
  return segments.map((seg, i) => {
    const inner = seg.bold && seg.italic ? <strong><em>{seg.text}</em></strong>
      : seg.bold ? <strong>{seg.text}</strong>
      : seg.italic ? <em>{seg.text}</em>
      : seg.text;
    if (seg.href) {
      return (
        <a key={i} href={seg.href} target="_blank" rel="noreferrer"
          style={{ color: accentColor || "#2d5986", textDecoration: "none" }}>
          {inner}
        </a>
      );
    }
    return <span key={i}>{inner}</span>;
  });
}
