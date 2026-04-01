import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// =============================================================
// 🔐 AUTH HELPER
// authMiddleware expects: Authorization: Bearer <token>
// Token stored in localStorage as "token" — matches App.jsx
// =============================================================
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Contract type configs with their dynamic form fields ─────────────────────
const CONTRACT_TYPES = {
  employment: {
    label: "Employment Agreement",
    icon: "👔",
    fields: [
      { key: "employerName", label: "Employer / Company Name", required: true },
      { key: "employerAddress", label: "Employer Registered Address", required: true },
      { key: "employeeName", label: "Employee Full Name", required: true },
      { key: "employeeAddress", label: "Employee Address", required: true },
      { key: "designation", label: "Designation / Job Title", required: true },
      { key: "department", label: "Department" },
      { key: "startDate", label: "Commencement Date", type: "date", required: true },
      { key: "salary", label: "Monthly Gross Salary (₹)", required: true },
      { key: "noticePeriod", label: "Notice Period (days)", required: true },
      { key: "probationPeriod", label: "Probation Period (months)" },
      { key: "placeOfWork", label: "Place of Work", required: true },
    ],
  },
  nda: {
    label: "Non-Disclosure Agreement",
    icon: "🔒",
    fields: [
      { key: "disclosingParty", label: "Disclosing Party (Full Name / Company)", required: true },
      { key: "disclosingAddress", label: "Disclosing Party Address", required: true },
      { key: "receivingParty", label: "Receiving Party (Full Name / Company)", required: true },
      { key: "receivingAddress", label: "Receiving Party Address", required: true },
      { key: "purpose", label: "Purpose of Disclosure", required: true },
      { key: "duration", label: "Confidentiality Duration (years)", required: true },
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "jurisdiction", label: "Jurisdiction City (e.g., Mumbai)" },
    ],
  },
  service: {
    label: "Service Agreement",
    icon: "🤝",
    fields: [
      { key: "clientName", label: "Client Name / Company", required: true },
      { key: "clientAddress", label: "Client Address", required: true },
      { key: "providerName", label: "Service Provider Name / Company", required: true },
      { key: "providerAddress", label: "Service Provider Address", required: true },
      { key: "serviceDescription", label: "Description of Services", required: true, multiline: true },
      { key: "fees", label: "Total Fees / Compensation (₹)", required: true },
      { key: "paymentTerms", label: "Payment Terms (e.g., 30 days net)" },
      { key: "startDate", label: "Commencement Date", type: "date", required: true },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "jurisdiction", label: "Jurisdiction City" },
    ],
  },
  rental: {
    label: "Rental / Lease Agreement",
    icon: "🏠",
    fields: [
      { key: "landlordName", label: "Landlord Full Name", required: true },
      { key: "landlordAddress", label: "Landlord Address", required: true },
      { key: "tenantName", label: "Tenant Full Name", required: true },
      { key: "tenantAddress", label: "Tenant Permanent Address", required: true },
      { key: "propertyAddress", label: "Property Address (Demised Premises)", required: true },
      { key: "monthlyRent", label: "Monthly Rent (₹)", required: true },
      { key: "securityDeposit", label: "Security Deposit (₹)", required: true },
      { key: "leaseStartDate", label: "Lease Start Date", type: "date", required: true },
      { key: "leaseDuration", label: "Lease Duration (months)", required: true },
      { key: "lockInPeriod", label: "Lock-in Period (months)" },
      { key: "maintenanceCharges", label: "Monthly Maintenance (₹)" },
    ],
  },
  sale: {
    label: "Sale of Goods Agreement",
    icon: "📦",
    fields: [
      { key: "sellerName", label: "Seller Name / Company", required: true },
      { key: "sellerAddress", label: "Seller Address", required: true },
      { key: "buyerName", label: "Buyer Name / Company", required: true },
      { key: "buyerAddress", label: "Buyer Address", required: true },
      { key: "goodsDescription", label: "Description of Goods", required: true, multiline: true },
      { key: "totalPrice", label: "Total Sale Price (₹)", required: true },
      { key: "deliveryDate", label: "Delivery Date", type: "date", required: true },
      { key: "deliveryLocation", label: "Delivery Location", required: true },
      { key: "paymentTerms", label: "Payment Terms" },
      { key: "warrantyPeriod", label: "Warranty Period (months)" },
    ],
  },
  partnership: {
    label: "Partnership Agreement",
    icon: "🏢",
    fields: [
      { key: "firmName", label: "Partnership Firm Name", required: true },
      { key: "businessNature", label: "Nature of Business", required: true },
      { key: "partner1Name", label: "Partner 1 Full Name", required: true },
      { key: "partner1Share", label: "Partner 1 Profit Share (%)", required: true },
      { key: "partner2Name", label: "Partner 2 Full Name", required: true },
      { key: "partner2Share", label: "Partner 2 Profit Share (%)", required: true },
      { key: "capitalContribution", label: "Total Capital Contribution (₹)", required: true },
      { key: "commencementDate", label: "Commencement Date", type: "date", required: true },
      { key: "firmAddress", label: "Firm's Registered Address", required: true },
      { key: "bankName", label: "Bank Name for Firm Account" },
    ],
  },
  freelance: {
    label: "Freelance / Consulting Agreement",
    icon: "💻",
    fields: [
      { key: "clientName", label: "Client / Company Name", required: true },
      { key: "clientAddress", label: "Client Address", required: true },
      { key: "freelancerName", label: "Freelancer / Consultant Name", required: true },
      { key: "freelancerAddress", label: "Freelancer Address", required: true },
      { key: "projectDescription", label: "Project / Scope of Work", required: true, multiline: true },
      { key: "fees", label: "Total Project Fees (₹)", required: true },
      { key: "paymentSchedule", label: "Payment Schedule (e.g., 50% upfront, 50% on delivery)" },
      { key: "startDate", label: "Start Date", type: "date", required: true },
      { key: "deliveryDate", label: "Expected Delivery Date", type: "date" },
      { key: "revisions", label: "Number of Revisions Included" },
      { key: "ipOwnership", label: "IP Ownership (Client / Freelancer / Shared)" },
    ],
  },
  loan: {
    label: "Loan Agreement",
    icon: "💰",
    fields: [
      { key: "lenderName", label: "Lender Full Name / Company", required: true },
      { key: "lenderAddress", label: "Lender Address", required: true },
      { key: "borrowerName", label: "Borrower Full Name", required: true },
      { key: "borrowerAddress", label: "Borrower Address", required: true },
      { key: "loanAmount", label: "Loan Amount (₹)", required: true },
      { key: "interestRate", label: "Annual Interest Rate (%)", required: true },
      { key: "repaymentSchedule", label: "Repayment Schedule (e.g., monthly EMI)" },
      { key: "loanStartDate", label: "Loan Disbursement Date", type: "date", required: true },
      { key: "repaymentDueDate", label: "Final Repayment Date", type: "date", required: true },
      { key: "collateral", label: "Collateral / Security (if any)" },
      { key: "purpose", label: "Purpose of Loan" },
    ],
  },
};

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
    fontFamily: "'Georgia', serif",
    color: "#e8e0d0",
    padding: "0",
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
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#c9a84c",
    letterSpacing: "1px",
  },
  logoSub: { fontSize: "12px", color: "#888", marginTop: "2px", fontFamily: "sans-serif" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#c9a84c",
    marginBottom: "6px",
    letterSpacing: "0.5px",
  },
  pageSubtitle: { color: "#a0917a", fontSize: "15px", marginBottom: "36px", fontFamily: "sans-serif" },
  stepRow: { display: "flex", gap: "8px", marginBottom: "36px", flexWrap: "wrap" },
  step: (active, done) => ({
    padding: "8px 18px",
    borderRadius: "20px",
    fontSize: "13px",
    fontFamily: "sans-serif",
    border: done ? "1px solid #c9a84c" : active ? "1px solid #c9a84c" : "1px solid #333",
    background: done ? "#c9a84c22" : active ? "#c9a84c18" : "transparent",
    color: done ? "#c9a84c" : active ? "#c9a84c" : "#666",
    cursor: done ? "pointer" : "default",
    transition: "all 0.2s",
  }),
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: "16px",
    padding: "32px",
    backdropFilter: "blur(8px)",
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "14px",
    marginTop: "8px",
  },
  typeCard: (selected) => ({
    padding: "20px 16px",
    borderRadius: "12px",
    border: selected ? "1px solid #c9a84c" : "1px solid rgba(255,255,255,0.1)",
    background: selected ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  }),
  typeIcon: { fontSize: "28px", marginBottom: "8px" },
  typeLabel: { fontSize: "13px", color: "#d4c5a9", fontFamily: "sans-serif", fontWeight: "500" },
  sectionTitle: { fontSize: "18px", color: "#c9a84c", marginBottom: "20px", fontWeight: "600" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  fieldFull: { gridColumn: "1 / -1" },
  label: { display: "block", fontSize: "12px", color: "#a0917a", marginBottom: "6px", fontFamily: "sans-serif", letterSpacing: "0.5px", textTransform: "uppercase" },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
    color: "#e8e0d0", fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border 0.2s",
  },
  textarea: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
    color: "#e8e0d0", fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: "90px",
  },
  btnPrimary: {
    padding: "13px 32px", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg, #c9a84c, #a67c2e)",
    color: "#1a1a2e", fontWeight: "700", fontSize: "15px",
    cursor: "pointer", fontFamily: "sans-serif", letterSpacing: "0.3px",
    transition: "opacity 0.2s",
  },
  btnSecondary: {
    padding: "13px 24px", borderRadius: "8px",
    border: "1px solid rgba(201,168,76,0.5)", background: "transparent",
    color: "#c9a84c", fontWeight: "600", fontSize: "14px",
    cursor: "pointer", fontFamily: "sans-serif",
  },
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
  historyItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    gap: "12px",
  },
  badge: (type) => ({
    padding: "3px 10px", borderRadius: "12px", fontSize: "11px",
    fontFamily: "sans-serif", fontWeight: "600",
    background: "rgba(201,168,76,0.15)", color: "#c9a84c",
    border: "1px solid rgba(201,168,76,0.3)",
    textTransform: "uppercase",
  }),
  alert: (type) => ({
    padding: "12px 16px", borderRadius: "8px", marginBottom: "16px",
    fontFamily: "sans-serif", fontSize: "14px",
    background: type === "error" ? "rgba(127,29,29,0.4)" : "rgba(45,106,79,0.4)",
    border: `1px solid ${type === "error" ? "#7f1d1d" : "#2d6a4f"}`,
    color: type === "error" ? "#fca5a5" : "#86efac",
  }),
  spinner: {
    display: "inline-block", width: "18px", height: "18px",
    border: "2px solid #c9a84c44", borderTop: "2px solid #c9a84c",
    borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "8px",
  },
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

// ── Main Component ───────────────────────────────────────────────────────────
export default function ContractGenerator() {
  const [tab, setTab] = useState("generate"); // generate | history
  const [step, setStep] = useState(1); // 1=type, 2=form, 3=preview
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null); // { contractId, title, content }
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const previewRef = useRef(null);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get("/api/contracts", authHeaders());
      setHistory(data);
    } catch { setHistory([]); }
    setHistoryLoading(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({});
    setError("");
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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
      const { data } = await axios.post("/api/contracts/generate", {
        type: selectedType,
        formData,
      }, authHeaders());
      setContract(data);
      setStep(3);
      setSuccess("Contract generated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Generation failed. Please try again.";
      const isUpgrade = err.response?.data?.upgradeRequired;
      setError(isUpgrade ? `⭐ ${msg}` : msg);
    }
    setLoading(false);
  };

  const handleExport = (format) => {
    if (!contract?.contractId) return;
    const token = localStorage.getItem("token");
    window.open(
      `/api/contracts/${contract.contractId}/export/${format}?token=${token}`,
      "_blank"
    );
  };

  const handleViewHistory = async (id) => {
    try {
      const { data } = await axios.get(`/api/contracts/${id}`, authHeaders());
      setContract({ contractId: data._id, title: data.title, content: data.content });
      setSelectedType(data.type);
      setFormData(data.formData);
      setTab("generate");
      setStep(3);
    } catch { setError("Failed to load contract."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contract permanently?")) return;
    try {
      await axios.delete(`/api/contracts/${id}`, authHeaders());
      setHistory((prev) => prev.filter((c) => c._id !== id));
    } catch { setError("Delete failed."); }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedType("");
    setFormData({});
    setContract(null);
    setError("");
  };

  const currentTypeCfg = CONTRACT_TYPES[selectedType] || null;

  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { border-color: #c9a84c !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 3px; }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.logo}>⚖ NyayaAI</div>
          <div style={styles.logoSub}>AI-Powered Indian Legal Assistant</div>
        </div>
        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#666" }}>
          Indian Contract Act, 1872 Compliant
        </div>
      </div>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Contract Generator</h1>
        <p style={styles.pageSubtitle}>
          Generate legally compliant contracts under Indian law — powered by Groq AI
        </p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={styles.tab(tab === "generate")} onClick={() => setTab("generate")}>
            ✍ Generate Contract
          </button>
          <button style={styles.tab(tab === "history")} onClick={() => setTab("history")}>
            📁 My Contracts
          </button>
        </div>

        {/* ── GENERATE TAB ── */}
        {tab === "generate" && (
          <>
            {/* Step Indicators */}
            <div style={styles.stepRow}>
              {["Select Type", "Fill Details", "Review & Export"].map((s, i) => (
                <div
                  key={i}
                  style={styles.step(step === i + 1, step > i + 1)}
                  onClick={() => step > i + 1 && setStep(i + 1)}
                >
                  {step > i + 1 ? "✓ " : `${i + 1}. `}{s}
                </div>
              ))}
            </div>

            {error && <div style={styles.alert("error")}>⚠ {error}</div>}
            {success && <div style={styles.alert("success")}>✓ {success}</div>}

            {/* STEP 1: Type Selection */}
            {step === 1 && (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>Select Contract Type</div>
                <div style={styles.typeGrid}>
                  {Object.entries(CONTRACT_TYPES).map(([key, cfg]) => (
                    <div
                      key={key}
                      style={styles.typeCard(selectedType === key)}
                      onClick={() => handleTypeSelect(key)}
                    >
                      <div style={styles.typeIcon}>{cfg.icon}</div>
                      <div style={styles.typeLabel}>{cfg.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "28px" }}>
                  <button
                    style={{ ...styles.btnPrimary, opacity: selectedType ? 1 : 0.4 }}
                    disabled={!selectedType}
                    onClick={() => selectedType && setStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Form */}
            {step === 2 && currentTypeCfg && (
              <div style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "28px" }}>{currentTypeCfg.icon}</span>
                  <div style={{...styles.sectionTitle, margin: 0 }}>
                    {currentTypeCfg.label} — Party Details
                  </div>
                </div>

                <div style={styles.fieldGrid}>
                  {currentTypeCfg.fields.map((f) => (
                    <div key={f.key} style={f.multiline ? styles.fieldFull : {}}>
                      <label style={styles.label}>
                        {f.label} {f.required && <span style={{ color: "#c9a84c" }}>*</span>}
                      </label>
                      {f.multiline ? (
                        <textarea
                          style={styles.textarea}
                          value={formData[f.key] || ""}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          placeholder={`Enter ${f.label.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          style={styles.input}
                          type={f.type || "text"}
                          value={formData[f.key] || ""}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          placeholder={f.type === "date" ? "" : `Enter ${f.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
                  <button style={styles.btnSecondary} onClick={() => setStep(1)}>← Back</button>
                  <button
                    style={{ ...styles.btnPrimary, display: "flex", alignItems: "center" }}
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading && <span style={styles.spinner} />}
                    {loading ? "Generating with AI..." : "⚡ Generate Contract"}
                  </button>
                </div>

                <p style={{ marginTop: "16px", fontSize: "12px", color: "#555", fontFamily: "sans-serif" }}>
                  🔒 Indian Contract Act 1872 · Arbitration & Conciliation Act 1996 · Stamp duty notice included
                </p>
              </div>
            )}

            {/* STEP 3: Preview & Export */}
            {step === 3 && contract && (
              <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ ...styles.sectionTitle, margin: 0 }}>{contract.title}</div>
                    <p style={{ color: "#666", fontSize: "13px", fontFamily: "sans-serif", marginTop: "4px" }}>
                      Review carefully before signing. Consult a qualified advocate.
                    </p>
                  </div>
                  <button style={styles.btnSecondary} onClick={resetFlow}>+ New Contract</button>
                </div>

                <div style={styles.contractPreview} ref={previewRef}>
                  {contract.content}
                </div>

                <div style={styles.exportRow}>
                  <button style={styles.btnPrimary} onClick={() => handleExport("pdf")}>
                    📄 Export PDF
                  </button>
                  <button style={{ ...styles.btnPrimary, background: "linear-gradient(135deg, #1e5c99, #1a4a7a)" }}
                    onClick={() => handleExport("docx")}>
                    📝 Export DOCX
                  </button>
                  <button style={styles.btnSecondary} onClick={() => { setStep(2); setContract(null); }}>
                    ✏ Edit Details
                  </button>
                </div>

                <p style={{ marginTop: "14px", fontSize: "11px", color: "#444", fontFamily: "sans-serif" }}>
                  ⚠ This document is AI-generated for informational purposes. Please have it reviewed by a qualified Indian advocate before execution. Stamp duty may be applicable as per state laws.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>My Generated Contracts</div>
            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666", fontFamily: "sans-serif" }}>
                <span style={styles.spinner} /> Loading contracts...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "sans-serif" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p>No contracts generated yet.</p>
                <button style={{ ...styles.btnPrimary, marginTop: "16px" }} onClick={() => setTab("generate")}>
                  Generate Your First Contract
                </button>
              </div>
            ) : (
              <div>
                {history.map((c) => (
                  <div key={c._id} style={styles.historyItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "4px" }}>{c.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={styles.badge(c.type)}>{c.type}</span>
                        <span style={{ fontSize: "12px", color: "#666", fontFamily: "sans-serif" }}>
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={styles.btnSuccess} onClick={() => handleViewHistory(c._id)}>
                        👁 View
                      </button>
                      <button
                        style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #333", background: "transparent", color: "#c9a84c", cursor: "pointer", fontSize: "13px" }}
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          window.open(`/api/contracts/${c._id}/export/pdf?token=${token}`, "_blank");
                        }}
                      >
                        PDF
                      </button>
                      <button
                        style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #333", background: "transparent", color: "#6ea8d4", cursor: "pointer", fontSize: "13px" }}
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          window.open(`/api/contracts/${c._id}/export/docx?token=${token}`, "_blank");
                        }}
                      >
                        DOCX
                      </button>
                      <button style={styles.btnDanger} onClick={() => handleDelete(c._id)}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}