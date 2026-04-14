// ─────────────────────────────────────────────────────────────────────────────
// ContractPreview.jsx
// Day 6 additions:
//   • PlaceholderHighlighter — highlights [PLACEHOLDER] tokens in gold
//   • Copy-to-clipboard button
//   • PDF download via html2pdf.js
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from "react";
import { styles } from "./ContractForm";

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
  btnCopy: (copied) => ({
    padding: "13px 24px", borderRadius: "8px",
    border: `1px solid ${copied ? "#4CAF7D" : "rgba(201,168,76,0.3)"}`,
    background: copied ? "rgba(76,175,125,0.1)" : "transparent",
    color: copied ? "#4CAF7D" : "#c9a84c",
    fontWeight: "600", fontSize: "15px",
    cursor: "pointer", fontFamily: "sans-serif",
    transition: "all 0.2s",
  }),
  btnPdf: {
    padding: "13px 24px", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
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

// ── PlaceholderHighlighter ────────────────────────────────────────────────────
// Splits contract text on [PLACEHOLDER] tokens and highlights them in gold
function PlaceholderHighlighter({ text }) {
  if (!text) return null;

  const parts = text.split(/(\[[A-Z_\s]+\])/g);

  return (
    <>
      {parts.map((part, i) =>
        /^\[[A-Z_\s]+\]$/.test(part) ? (
          <mark
            key={i}
            style={{
              background: "rgba(201,168,76,0.2)",
              color: "#f0d080",
              borderRadius: "3px",
              padding: "0 3px",
              border: "1px solid rgba(201,168,76,0.4)",
              fontWeight: "600",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function openExport(contractId, format) {
  const token = localStorage.getItem("token");
  window.open(`/api/contracts/${contractId}/export/${format}?token=${token}`, "_blank");
}

// Load html2pdf script dynamically
function loadHtml2Pdf() {
  return new Promise((resolve) => {
    if (window.html2pdf) return resolve(true);
    if (document.getElementById("html2pdf-script")) {
      // already loading — wait for it
      const interval = setInterval(() => {
        if (window.html2pdf) { clearInterval(interval); resolve(true); }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id  = "html2pdf-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Step 3: Contract preview + export ────────────────────────────────────────
export function ContractPreview({ contract, onNewContract, onEditDetails }) {
  const previewRef  = useRef(null);
  const [copied,    setCopied]    = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contract.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = contract.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── PDF download via html2pdf ──────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    const loaded = await loadHtml2Pdf();
    if (!loaded) {
      alert("Failed to load PDF library. Check your internet connection.");
      setPdfLoading(false);
      return;
    }

    // Build a clean printable HTML string — no dark background
    const html = `
      <div style="
        font-family: Georgia, serif;
        font-size: 13px;
        line-height: 1.8;
        color: #1a1a1a;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      ">
        <h2 style="
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1a1a1a;
        ">${contract.title}</h2>
        <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 24px;" />
        <pre style="
          white-space: pre-wrap;
          word-break: break-word;
          font-family: Georgia, serif;
          font-size: 13px;
          line-height: 1.8;
          color: #1a1a1a;
        ">${contract.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        <hr style="border: none; border-top: 1px solid #ccc; margin-top: 32px;" />
        <p style="font-size: 10px; color: #888; margin-top: 8px;">
          Generated by NyayaAI · AI-generated document · Please review with a qualified Indian advocate before execution.
        </p>
      </div>
    `;

    const filename = contract.title
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

    await window.html2pdf()
      .set({
        margin:      [10, 10, 10, 10],
        filename:    `${filename}.pdf`,
        image:       { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(html)
      .save();

    setPdfLoading(false);
  };

  return (
    <div style={styles.card}>
      {/* Title row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "20px",
        flexWrap: "wrap", gap: "12px",
      }}>
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

      {/* Contract text with placeholder highlighting */}
      <div style={localStyles.contractPreview} ref={previewRef}>
        <PlaceholderHighlighter text={contract.content} />
      </div>

      {/* Export buttons */}
      <div style={localStyles.exportRow}>
        {/* Server-side PDF (existing) */}
        <button style={styles.btnPrimary} onClick={() => openExport(contract.contractId, "pdf")}>
          📄 Export PDF
        </button>

        {/* Client-side PDF download via html2pdf */}
        <button
          style={localStyles.btnPdf}
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? "Generating…" : "⬇ Download PDF"}
        </button>

        {/* DOCX */}
        <button style={localStyles.btnDocx} onClick={() => openExport(contract.contractId, "docx")}>
          📝 Export DOCX
        </button>

        {/* Copy to clipboard */}
        <button style={localStyles.btnCopy(copied)} onClick={handleCopy}>
          {copied ? "✓ Copied!" : "📋 Copy Text"}
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
export function HistoryItem({ contract, onView, onDelete }) {
  return (
    <div style={localStyles.historyItem}>
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
      <div style={{ display: "flex", gap: "8px" }}>
        <button style={localStyles.btnSuccess} onClick={() => onView(contract._id)}>
          👁 View
        </button>
        <button style={localStyles.btnGhost("#c9a84c")} onClick={() => openExport(contract._id, "pdf")}>
          PDF
        </button>
        <button style={localStyles.btnGhost("#6ea8d4")} onClick={() => openExport(contract._id, "docx")}>
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