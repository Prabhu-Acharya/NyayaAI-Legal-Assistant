// ─────────────────────────────────────────────────────────────────────────────
// ContractGenerator.jsx  (refactored orchestrator — was the monolithic file)
// UI state only. All rendering delegated to ContractForm / ContractPreview.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CONTRACT_TYPES, ContractTypeSelector, ContractFieldForm, styles } from "../components/ContractForm";
import { ContractPreview, HistoryList } from "../components/ContractPreview";

// Auth header helper — token stored as "token" in localStorage (matches App.jsx)
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Top-level layout styles (not shared with children) ───────────────────────
const layoutStyles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
    fontFamily: "'Georgia', serif",
    color: "#e8e0d0",
  },
  topBar: {
    background: "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(201,168,76,0.3)",
    padding: "16px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(10px)",
  },
  logo:    { fontSize: "22px", fontWeight: "700", color: "#c9a84c", letterSpacing: "1px" },
  logoSub: { fontSize: "12px", color: "#888", marginTop: "2px", fontFamily: "sans-serif" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  pageTitle:    { fontSize: "32px", fontWeight: "700", color: "#c9a84c", marginBottom: "6px", letterSpacing: "0.5px" },
  pageSubtitle: { color: "#a0917a", fontSize: "15px", marginBottom: "36px", fontFamily: "sans-serif" },
  stepRow:  { display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap" },
  step: (active, done) => ({
    padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontFamily: "sans-serif",
    border:      done ? "1px solid #c9a84c" : active ? "1px solid #c9a84c" : "1px solid #333",
    background:  done ? "#c9a84c22"         : active ? "#c9a84c18"         : "transparent",
    color:       done ? "#c9a84c"           : active ? "#c9a84c"           : "#666",
    cursor: done ? "pointer" : "default",
    transition: "all 0.2s",
  }),
  tabs: { display: "flex", gap: "0", marginBottom: "28px", borderBottom: "1px solid rgba(201,168,76,0.2)" },
  tab: (active) => ({
    padding: "12px 24px", cursor: "pointer", fontFamily: "sans-serif",
    fontSize: "14px", fontWeight: active ? "600" : "400",
    color: active ? "#c9a84c" : "#666",
    borderBottom: active ? "2px solid #c9a84c" : "2px solid transparent",
    marginBottom: "-1px", background: "transparent", border: "none",
    transition: "color 0.2s",
  }),
};

export default function ContractGenerator() {
  const [tab,            setTab]            = useState("generate"); // "generate" | "history"
  const [step,           setStep]           = useState(1);          // 1 | 2 | 3
  const [selectedType,   setSelectedType]   = useState("");
  const [formData,       setFormData]       = useState({});
  const [loading,        setLoading]        = useState(false);
  const [contract,       setContract]       = useState(null);       // { contractId, title, content }
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get("/api/contracts", authHeaders());
      setHistory(data);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  // ── Generation ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const cfg = CONTRACT_TYPES[selectedType];
    if (!cfg) return;

    const missing = cfg.fields.filter((f) => f.required && !formData[f.key]?.trim?.());
    if (missing.length) {
      setError(`Please fill required fields: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/contracts/generate",
        { type: selectedType, formData },
        authHeaders()
      );
      setContract(data);
      setStep(3);
      setSuccess("Contract generated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Generation failed. Please try again.";
      setError(err.response?.data?.upgradeRequired ? `⭐ ${msg}` : msg);
    }
    setLoading(false);
  };

  // ── History actions ────────────────────────────────────────────────────────
  const handleViewHistory = async (id) => {
    try {
      const { data } = await axios.get(`/api/contracts/${id}`, authHeaders());
      setContract({ contractId: data._id, title: data.title, content: data.content });
      setSelectedType(data.type);
      setFormData(data.formData);
      setTab("generate");
      setStep(3);
    } catch {
      setError("Failed to load contract.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contract permanently?")) return;
    try {
      await axios.delete(`/api/contracts/${id}`, authHeaders());
      setHistory((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  // ── Flow helpers ───────────────────────────────────────────────────────────
  const resetFlow = () => {
    setStep(1);
    setSelectedType("");
    setFormData({});
    setContract(null);
    setError("");
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({});
    setError("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={layoutStyles.wrapper}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: #c9a84c !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 3px; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={layoutStyles.topBar}>
        <div>
          <div style={layoutStyles.logo}>⚖ NyayaAI</div>
          <div style={layoutStyles.logoSub}>AI-Powered Indian Legal Assistant</div>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#666" }}>
          Indian Contract Act, 1872 Compliant
        </div>
      </div>

      <div style={layoutStyles.container}>
        <h1 style={layoutStyles.pageTitle}>Contract Generator</h1>
        <p style={layoutStyles.pageSubtitle}>
          Generate legally compliant contracts under Indian law — powered by Groq AI
        </p>

        {/* ── Tabs ── */}
        <div style={layoutStyles.tabs}>
          <button style={layoutStyles.tab(tab === "generate")} onClick={() => setTab("generate")}>
            ✍ Generate Contract
          </button>
          <button style={layoutStyles.tab(tab === "history")} onClick={() => setTab("history")}>
            📁 My Contracts
          </button>
        </div>

        {/* ── GENERATE TAB ── */}
        {tab === "generate" && (
          <>
            {/* Step indicators */}
            <div style={layoutStyles.stepRow}>
              {["Select Type", "Fill Details", "Review & Export"].map((label, i) => (
                <div
                  key={i}
                  style={layoutStyles.step(step === i + 1, step > i + 1)}
                  onClick={() => step > i + 1 && setStep(i + 1)}
                >
                  {step > i + 1 ? "✓ " : `${i + 1}. `}{label}
                </div>
              ))}
            </div>

            {error   && <div style={styles.alert("error")}>⚠ {error}</div>}
            {success && <div style={styles.alert("success")}>✓ {success}</div>}

            {/* Step 1 */}
            {step === 1 && (
              <ContractTypeSelector
                selectedType={selectedType}
                onSelect={handleTypeSelect}
                onContinue={() => setStep(2)}
              />
            )}

            {/* Step 2 */}
            {step === 2 && (
              <ContractFieldForm
                selectedType={selectedType}
                formData={formData}
                onChange={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
                onBack={() => setStep(1)}
                onGenerate={handleGenerate}
                loading={loading}
              />
            )}

            {/* Step 3 */}
            {step === 3 && contract && (
              <ContractPreview
                contract={contract}
                onNewContract={resetFlow}
                onEditDetails={() => { setStep(2); setContract(null); }}
              />
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <HistoryList
            history={history}
            loading={historyLoading}
            onView={handleViewHistory}
            onDelete={handleDelete}
            onGoGenerate={() => setTab("generate")}
          />
        )}
      </div>
    </div>
  );
}