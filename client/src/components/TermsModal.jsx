// client/src/components/TermsModal.jsx
import { useState } from "react";
import api from "../services/api"; // centralized Axios instance — NO hardcoded URLs

/**
 * TermsModal
 * Props:
 *   onAccepted  — callback fired after the server confirms acceptance
 *                 Parent should update user state (hasAcceptedTerms: true)
 */
export default function TermsModal({ onAccepted }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track scroll position inside the terms text box
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/users/accept-terms"); // JWT auto-attached by Axios interceptor
      onAccepted();                          // lift state up → parent removes modal
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── Overlay ─────────────────────────────────────────────────────────── */
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="terms-title">
      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badge}>Legal</span>
          <h2 id="terms-title" style={styles.title}>Terms &amp; Conditions</h2>
          <p style={styles.subtitle}>
            Please read and accept our terms before using NyayaAI.
          </p>
        </div>

        {/* Scrollable body */}
        <div style={styles.body} onScroll={handleScroll}>
          <Section title="1. Acceptance of Terms">
            By accessing or using NyayaAI, you agree to be bound by these Terms
            and Conditions. If you do not agree, you may not use this platform.
          </Section>

          <Section title="2. Nature of Service">
            NyayaAI provides AI-generated legal information for general guidance
            only. It does <strong>not</strong> constitute legal advice, and no
            attorney–client relationship is formed. Always consult a qualified
            legal professional for advice specific to your situation.
          </Section>

          <Section title="3. Accuracy Disclaimer">
            While we strive for accuracy, AI outputs may be incomplete,
            outdated, or incorrect. NyayaAI disclaims all liability for
            decisions made in reliance on information provided by this platform.
          </Section>

          <Section title="4. User Responsibilities">
            You agree not to misuse the platform, attempt to circumvent security
            measures, or use outputs for unlawful purposes. You are responsible
            for ensuring that your use complies with applicable laws.
          </Section>

          <Section title="5. Data &amp; Privacy">
            We collect and process data in accordance with our Privacy Policy.
            Queries submitted to NyayaAI may be used to improve the service.
            Do not submit sensitive personal or confidential information.
          </Section>

          <Section title="6. Intellectual Property">
            All platform content, trademarks, and technology are owned by
            NyayaAI or its licensors. You may not copy, redistribute, or
            reverse-engineer any part of the service.
          </Section>

          <Section title="7. Termination">
            We reserve the right to suspend or terminate access for violations
            of these terms or for any other reason at our sole discretion.
          </Section>

          <Section title="8. Governing Law">
            These terms are governed by the laws of India. Any disputes shall
            be subject to the exclusive jurisdiction of courts in New Delhi.
          </Section>

          <Section title="9. Changes to Terms">
            We may update these terms at any time. Continued use after changes
            are posted constitutes acceptance of the revised terms.
          </Section>

          <Section title="10. Contact">
            For questions about these terms, contact us at{" "}
            <a href="mailto:legal@nyayaai.in" style={styles.link}>
              legal@nyayaai.in
            </a>
            .
          </Section>

          {/* Scroll-to-unlock hint */}
          {!scrolledToBottom && (
            <p style={styles.scrollHint}>↓ Scroll to read all terms before accepting</p>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {error && <p style={styles.error}>{error}</p>}
          <button
            style={{
              ...styles.btn,
              ...((!scrolledToBottom || loading) ? styles.btnDisabled : {}),
            }}
            disabled={!scrolledToBottom || loading}
            onClick={handleAccept}
          >
            {loading ? "Saving…" : "I have read and accept the Terms & Conditions"}
          </button>
          {!scrolledToBottom && (
            <p style={styles.disabledNote}>
              Scroll to the bottom to enable this button.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper sub-component ─────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "#1a1a2e" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#444", margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

/* ── Inline styles (no extra CSS file needed) ─────────────────────────────── */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 10, 30, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "620px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
    overflow: "hidden",
  },
  header: {
    padding: "1.5rem 1.75rem 1rem",
    borderBottom: "1px solid #eee",
  },
  badge: {
    display: "inline-block",
    background: "#e8f0fe",
    color: "#1a56db",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    marginBottom: "0.5rem",
  },
  title: {
    margin: "0 0 0.25rem",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#1a1a2e",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#666",
  },
  body: {
    padding: "1.25rem 1.75rem",
    overflowY: "auto",
    flex: 1,
  },
  scrollHint: {
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#999",
    marginTop: "1rem",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  footer: {
    padding: "1rem 1.75rem 1.5rem",
    borderTop: "1px solid #eee",
  },
  btn: {
    width: "100%",
    padding: "0.8rem 1rem",
    background: "#1a56db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnDisabled: {
    background: "#b0c4f8",
    cursor: "not-allowed",
  },
  disabledNote: {
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#999",
    marginTop: "0.5rem",
    marginBottom: 0,
  },
  error: {
    color: "#c0392b",
    fontSize: "0.8rem",
    marginBottom: "0.5rem",
    textAlign: "center",
  },
  link: { color: "#1a56db" },
};