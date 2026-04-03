// ─────────────────────────────────────────────────────────────────────────────
// ContractPreview.jsx
// Responsibilities:
//   • Step 3: Contract text preview + PDF / DOCX export buttons
//   • HistoryItem: single row in the "My Contracts" list
//   • HistoryList: full history tab content (loading, empty, list)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from "react";
import { styles } from "./ContractForm";

// ── Extra styles only needed in this file ────────────────────────────────────
const localStyles = {
  contractPreview: {
    background: "#0a0a1a",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "12px",
    padding: "32px",
    fontFamily: "'Georgia', serif",
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#d4c5a9",
    maxHeight: "520px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  exportRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" },
  btnDocx: {
    padding: "13px 32px", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #1e5c99, #1a4a7a)",
    color: "#fff", fontWeight: "700", fontSize: "15px",
    cursor: "pointer", fontFamily: "sans-serif",
  },
  historyItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    gap: "12px",
  },
  badge: {
    padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
    fontFamily: "sans-serif", fontWeight: "600",
    background: "rgba(201,168,76,0.15)", color: "#c9a84c",
    border: "1px solid rgba(201,168,76,0.3)",
    textTransform: "uppercase",
  },
  btnGhost: (color = "#c9a84c") => ({
    padding: "10px 16px", borderRadius: "8px",
    border: "1px solid #333", background: "transparent",
    color, cursor: "pointer", fontSize: "13px",
    fontFamily: "sans-serif",
  }),
  btnSuccess: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#2d6a4f", color: "#fff", fontWeight: "600",
    fontSize: "13px", cursor: "pointer", fontFamily: "sans-serif",
  },
  btnDanger: {
    padding: "10px 20px", borderRadius: "8px", border: "none",
    background: "#7f1d1d", color: "#fff", fontWeight: "600",
    fontSize: "13px", cursor: "pointer", fontFamily: "sans-serif",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function openExport(contractId, format) {
  const token = localStorage.getItem("token");
  window.open(`/api/contracts/${contractId}/export/${format}?token=${token}`, "_blank");
}

// ── Step 3: Contract preview + export ─────────────────────────────────────────
// Props:
//   contract   { contractId, title, content }
//   onNewContract  () => void   — resets flow to step 1
//   onEditDetails  () => void   — returns to step 2
export function ContractPreview({ contract, onNewContract, onEditDetails }) {
  const previewRef = useRef(null);

  return (
    <div style={styles.card}>
      {/* Title row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ ...styles.sectionTitle, margin: 0 }}>{contract.title}</div>
          <p style={{ color: "#666", fontSize: "13px", fontFamily: "sans-serif", marginTop: "4px" }}>
            Review carefully before signing. Consult a qualified advocate.
          </p>
        </div>
        <button style={styles.btnSecondary} onClick={onNewContract}>
          + New Contract
        </button>
      </div>

      {/* Contract text */}
      <div style={localStyles.contractPreview} ref={previewRef}>
        {contract.content}
      </div>

      {/* Export buttons */}
      <div style={localStyles.exportRow}>
        <button style={styles.btnPrimary} onClick={() => openExport(contract.contractId, "pdf")}>
          📄 Export PDF
        </button>
        <button style={localStyles.btnDocx} onClick={() => openExport(contract.contractId, "docx")}>
          📝 Export DOCX
        </button>
        <button style={styles.btnSecondary} onClick={onEditDetails}>
          ✏ Edit Details
        </button>
      </div>

      <p style={{ marginTop: "14px", fontSize: "11px", color: "#444", fontFamily: "sans-serif" }}>
        ⚠ This document is AI-generated for informational purposes. Please have it reviewed by a
        qualified Indian advocate before execution. Stamp duty may be applicable as per state laws.
      </p>
    </div>
  );
}

// ── Single history row ────────────────────────────────────────────────────────
// Props:
//   contract   { _id, type, title, createdAt }
//   onView     (id) => void
//   onDelete   (id) => void
export function HistoryItem({ contract, onView, onDelete }) {
  return (
    <div style={localStyles.historyItem}>
      {/* Left: title + metadata */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>
          {contract.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={localStyles.badge}>{contract.type}</span>
          <span style={{ fontSize: "12px", color: "#666", fontFamily: "sans-serif" }}>
            {new Date(contract.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={localStyles.btnSuccess} onClick={() => onView(contract._id)}>
          👁 View
        </button>
        <button
          style={localStyles.btnGhost("#c9a84c")}
          onClick={() => openExport(contract._id, "pdf")}
        >
          PDF
        </button>
        <button
          style={localStyles.btnGhost("#6ea8d4")}
          onClick={() => openExport(contract._id, "docx")}
        >
          DOCX
        </button>
        <button style={localStyles.btnDanger} onClick={() => onDelete(contract._id)}>
          🗑
        </button>
      </div>
    </div>
  );
}

// ── Full history tab ──────────────────────────────────────────────────────────
// Props:
//   history         Contract[]
//   loading         boolean
//   onView          (id) => void
//   onDelete        (id) => void
//   onGoGenerate    () => void   — CTA when list is empty
export function HistoryList({ history, loading, onView, onDelete, onGoGenerate }) {
  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.sectionTitle }}>My Generated Contracts</div>
        <div style={{ textAlign: "center", padding: "40px", color: "#666", fontFamily: "sans-serif" }}>
          <span style={styles.spinner} /> Loading contracts…
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.sectionTitle}>My Generated Contracts</div>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <p>No contracts generated yet.</p>
          <button style={{ ...styles.btnPrimary, marginTop: "16px" }} onClick={onGoGenerate}>
            Generate Your First Contract
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>My Generated Contracts</div>
      <div>
        {history.map((c) => (
          <HistoryItem key={c._id} contract={c} onView={onView} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}