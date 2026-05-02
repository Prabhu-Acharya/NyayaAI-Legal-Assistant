/**
 * components/CitationCards.jsx
 * Renders BNS/legal section citations + IndianKanoon case cards
 * below each AI chat message. Works with bns-map.json trigger shape.
 */

import { useState } from "react";

function SectionCard({ citation, index }) {
  return (
    <div style={styles.bnsCard}>
      <div style={styles.bnsHeader}>
        <span style={styles.bnsIndex}>{index + 1}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.bnsTitle}>{citation.section}</p>
          <p style={styles.bnsHeading}>{citation.topic}</p>
        </div>
        <span style={styles.bnsChapter}>{citation.contractType}</span>
        {citation.score > 0 && (
          <span style={styles.bnsScore}>{citation.score} match</span>
        )}
      </div>
    </div>
  );
}

function CaseCard({ caseItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={styles.caseCard}>
      <div style={styles.caseHeader} onClick={() => setExpanded((v) => !v)}>
        <div style={styles.caseLeft}>
          <span style={styles.caseGlyph}>⚖</span>
          <div>
            <p style={styles.caseTitle}>{caseItem.title}</p>
            {(caseItem.court || caseItem.date) && (
              <p style={styles.caseMeta}>
                {[caseItem.court, caseItem.date].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <span style={{ ...styles.chevron, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </div>
      {expanded && (
        <div style={styles.caseBody}>
          {caseItem.snippet && <p style={styles.caseSnippet}>{caseItem.snippet}…</p>}
          {caseItem.url && (
            <a href={caseItem.url} target="_blank" rel="noopener noreferrer" style={styles.caseLink}>
              Read full judgment →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Props:
 *   citations  — array from req.ragContext.citations (section, topic, contractType, score)
 *   cases      — array from indianKanoon.searchIndianKanoon()
 */
export default function CitationCards({ citations = [], cases = [] }) {
  const [showSections, setShowSections] = useState(false);
  const [showCases, setShowCases] = useState(false);

  if (!citations.length && !cases.length) return null;

  return (
    <div style={styles.root}>
      {citations.length > 0 && (
        <div style={styles.section}>
          <button style={styles.toggleBtn} onClick={() => setShowSections((v) => !v)}>
            <span style={styles.toggleIcon}>📖</span>
            <span>Legal Sources ({citations.length})</span>
            <span style={{ ...styles.chevron, marginLeft: "auto", transform: showSections ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </button>
          {showSections && (
            <div style={styles.cardList}>
              {citations.map((c, i) => (
                <SectionCard key={c.section + i} citation={c} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {cases.length > 0 && (
        <div style={styles.section}>
          <button style={styles.toggleBtn} onClick={() => setShowCases((v) => !v)}>
            <span style={styles.toggleIcon}>⚖</span>
            <span>Case Precedents ({cases.length})</span>
            <span style={{ ...styles.chevron, marginLeft: "auto", transform: showCases ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
          </button>
          {showCases && (
            <div style={styles.cardList}>
              {cases.map((c, i) => (
                <CaseCard key={c.url || i} caseItem={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { display: "flex", flexDirection: "column", gap: 8, marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 12 },
  section: { display: "flex", flexDirection: "column", gap: 6 },
  toggleBtn: { display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", textAlign: "left", width: "100%" },
  toggleIcon: { fontSize: 14 },
  chevron: { fontSize: 14, color: "#9ca3af", transition: "transform 0.2s ease" },
  cardList: { display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4 },
  bnsCard: { background: "#fffbf2", border: "1px solid #f3e8c0", borderRadius: 8, overflow: "hidden" },
  bnsHeader: { display: "flex", alignItems: "center", padding: "10px 14px", gap: 10 },
  bnsIndex: { fontSize: 11, fontWeight: 700, background: "#B8922A", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bnsTitle: { fontSize: 13, fontWeight: 700, color: "#92400e", margin: 0, lineHeight: 1.3 },
  bnsHeading: { fontSize: 12, color: "#78350f", margin: 0, lineHeight: 1.4 },
  bnsChapter: { fontSize: 11, color: "#a16207", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", textTransform: "capitalize" },
  bnsScore: { fontSize: 11, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" },
  caseCard: { background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 8, overflow: "hidden" },
  caseHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", cursor: "pointer", gap: 12 },
  caseLeft: { display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 },
  caseGlyph: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  caseTitle: { fontSize: 13, fontWeight: 600, color: "#1e3a5f", margin: 0, lineHeight: 1.4 },
  caseMeta: { fontSize: 11, color: "#6b7280", margin: 0, marginTop: 2 },
  caseBody: { borderTop: "1px solid #dbeafe", padding: "10px 14px" },
  caseSnippet: { fontSize: 13, color: "#374151", lineHeight: 1.65, margin: "0 0 8px" },
  caseLink: { fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 600 },
};