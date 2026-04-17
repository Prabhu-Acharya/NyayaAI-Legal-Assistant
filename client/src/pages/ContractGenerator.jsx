// ─────────────────────────────────────────────────────────────────────────────
// ContractGenerator.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import API from "../services/api";
import PremiumModal from "../components/PremiumModal";
import { CONTRACT_TYPES, ContractTypeSelector, ContractFieldForm, styles } from "../components/ContractForm";
import { ContractPreview, HistoryList } from "../components/ContractPreview";

const FREE_LIMIT = 3;

const layoutStyles = {
  wrapper: {
    minHeight: "100%",
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
    fontFamily: "'Georgia', serif",
    color: "#e8e0d0",
  },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  pageTitle: { fontSize: "32px", fontWeight: "700", color: "#c9a84c", marginBottom: "6px", letterSpacing: "0.5px" },
  pageSubtitle: { color: "#a0917a", fontSize: "15px", marginBottom: "36px", fontFamily: "sans-serif" },
  stepRow: { display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap" },
  step: (active, done) => ({
    padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontFamily: "sans-serif",
    border: done ? "1px solid #c9a84c" : active ? "1px solid #c9a84c" : "1px solid #333",
    background: done ? "#c9a84c22" : active ? "#c9a84c18" : "transparent",
    color: done ? "#c9a84c" : active ? "#c9a84c" : "#666",
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

// ── PlanUsageBar ──────────────────────────────────────────────────────────────
function PlanUsageBar({ used, limit, isPremium, resetDate, onUpgrade }) {
  if (isPremium) return null;

  const pct = Math.min((used / limit) * 100, 100);
  const atLimit = used >= limit;
  const remaining = Math.max(limit - used, 0);

  const formattedResetDate = resetDate
    ? new Date(resetDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      .toLocaleDateString("en-IN", { day: "numeric", month: "long" });

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${atLimit ? "rgba(226,75,74,0.4)" : "rgba(201,168,76,0.2)"}`,
      borderRadius: "12px",
      padding: "14px 16px",
      marginBottom: "20px",
      fontFamily: "sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "500", color: "#d4c5a9" }}>
          Contract generations
        </span>
        <span style={{ fontSize: "13px", color: "#a0917a" }}>
          <strong style={{ color: atLimit ? "#E24B4A" : "#c9a84c" }}>{used}</strong> / {limit} used
        </span>
      </div>

      <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: "99px",
          background: atLimit ? "#E24B4A" : "linear-gradient(90deg, #c9a84c, #a67c2e)",
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      <div style={{ fontSize: "12px", color: "#666" }}>
        {atLimit ? (
          <>Limit reached · Resets {formattedResetDate} · <button onClick={onUpgrade} style={{ background: "none", border: "none", color: "#c9a84c", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Upgrade for unlimited</button></>
        ) : (
          <>{remaining} generation{remaining !== 1 ? "s" : ""} remaining · <button onClick={onUpgrade} style={{ background: "none", border: "none", color: "#c9a84c", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Upgrade for unlimited</button></>
        )}
      </div>
    </div>
  );
}

// ── ContractGenerator ─────────────────────────────────────────────────────────
export default function ContractGenerator() {
  const [tab, setTab] = useState("generate");
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usage, setUsage] = useState({ used: 0, limit: FREE_LIMIT, isPremium: false, resetDate: null });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { data } = await API.get("/api/users/usage");
        setUsage(data);
      } catch {
        // silently fail — bar just shows 0
      }
    };
    fetchUsage();
  }, []);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await API.get("/api/contracts");
      setHistory(data);
    } catch {
      setHistory([]);
    }
    setHistoryLoading(false);
  };

  const handleGenerate = async () => {
    if (!usage.isPremium && usage.used >= usage.limit) {
      setShowModal(true);
      return;
    }

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
      const { data } = await API.post("/api/contracts/generate", {
        type: selectedType,
        formData,
      });

      if (data.upgradeRequired) {
        setShowModal(true);
        setLoading(false);
        return;
      }

      if (data.usage) {
        setUsage(prev => ({ ...prev, ...data.usage }));
      }

      setContract(data);
      setStep(3);
      setSuccess("Contract generated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      if (err.response?.data?.upgradeRequired) {
        setShowModal(true);
      } else {
        setError(err.response?.data?.message || "Generation failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleViewHistory = async (id) => {
    try {
      const { data } = await API.get(`/api/contracts/${id}`);
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
      await API.delete(`/api/contracts/${id}`);
      setHistory((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  const resetFlow = () => {
    setStep(1); setSelectedType(""); setFormData({}); setContract(null); setError("");
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type); setFormData({}); setError("");
  };

  const atLimit = !usage.isPremium && usage.used >= usage.limit;

  return (
    <div style={layoutStyles.wrapper}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus { border-color: #c9a84c !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 3px; }
      `}</style>

      <div style={layoutStyles.container}>
        <h1 style={layoutStyles.pageTitle}>Contract Generator</h1>
        <p style={layoutStyles.pageSubtitle}>
          Generate legally compliant contracts under Indian law — powered by Groq AI
        </p>

        <div style={layoutStyles.tabs}>
          <button style={layoutStyles.tab(tab === "generate")} onClick={() => setTab("generate")}>
            ✍ Generate Contract
          </button>
          <button style={layoutStyles.tab(tab === "history")} onClick={() => setTab("history")}>
            📁 My Contracts
          </button>
        </div>

        {tab === "generate" && (
          <>
            <PlanUsageBar
              used={usage.used}
              limit={usage.limit}
              isPremium={usage.isPremium}
              resetDate={usage.resetDate}
              onUpgrade={() => setShowModal(true)}
            />
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

            {error && <div style={styles.alert("error")}>⚠ {error}</div>}
            {success && <div style={styles.alert("success")}>✓ {success}</div>}

            {step === 1 && (
              <ContractTypeSelector
                selectedType={selectedType}
                onSelect={handleTypeSelect}
                onContinue={() => atLimit ? setShowModal(true) : setStep(2)}
              />
            )}
            {step === 2 && (
              <ContractFieldForm
                selectedType={selectedType}
                formData={formData}
                onChange={(key, val) => setFormData((prev) => ({ ...prev, [key]: val }))}
                onBack={() => setStep(1)}
                onGenerate={handleGenerate}
                loading={loading}
                atLimit={atLimit}
              />
            )}
            {step === 3 && contract && (
              <ContractPreview
                contract={contract}
                onNewContract={resetFlow}
                onEditDetails={() => { setStep(2); setContract(null); }}
              />
            )}
          </>
        )}

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

      <PremiumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpgradeSuccess={() => setUsage(prev => ({ ...prev, isPremium: true }))}
      />
    </div>
  );
}