// ─────────────────────────────────────────────────────────────────────────────
// ContractForm.jsx
// Responsibilities:
//   • CONTRACT_TYPES config (all 8 types with their dynamic fields)
//   • Step 1: Contract type selection grid
//   • Step 2: Dynamic form fields + "Generate" trigger
//   • Shared styles object (consumed by ContractPreview.jsx too via named export)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

// ── CONTRACT_TYPES ─────────────────────────────────────────────────────────────
export const CONTRACT_TYPES = {
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

// Add after CONTRACT_TYPES object, before styles export
export const LANGUAGES = [
  { value: "english", label: "English", nativeLabel: "English" },
  { value: "hindi", label: "Hindi", nativeLabel: "हिंदी" },
  { value: "marathi", label: "Marathi", nativeLabel: "मराठी" },
  { value: "tamil", label: "Tamil", nativeLabel: "தமிழ்" },
  { value: "telugu", label: "Telugu", nativeLabel: "తెలుగు" },
  { value: "bengali", label: "Bengali", nativeLabel: "বাংলা" },
  { value: "gujarati", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { value: "kannada", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
];

// ── Shared styles (exported so ContractPreview.jsx can reuse them) ─────────────
export const styles = {

  // Inside styles object, add:
  languageSelect: {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid rgba(201,168,76,0.4)", background: "rgba(255,255,255,0.06)",
    color: "#e8e0d0", fontSize: "14px", fontFamily: "sans-serif",
    outline: "none", boxSizing: "border-box", cursor: "pointer",
  },
  languageBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 10px", borderRadius: "20px",
    background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
    fontSize: "12px", color: "#c9a84c", fontFamily: "sans-serif",
  },
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
  label: {
    display: "block",
    fontSize: "12px",
    color: "#a0917a",
    marginBottom: "6px",
    fontFamily: "sans-serif",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
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
};

// ── Step 1: Type selection grid ───────────────────────────────────────────────
export function ContractTypeSelector({ selectedType, onSelect, onContinue }) {
  return (
    <div style={styles.card}>
      <div style={styles.sectionTitle}>Select Contract Type</div>
      <div style={styles.typeGrid}>
        {Object.entries(CONTRACT_TYPES).map(([key, cfg]) => (
          <div
            key={key}
            style={styles.typeCard(selectedType === key)}
            onClick={() => onSelect(key)}
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
          onClick={() => selectedType && onContinue()}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Dynamic field form ────────────────────────────────────────────────
export function ContractFieldForm({
  selectedType,
  formData,
  onChange,
  onBack,
  onGenerate,
  loading,
  atLimit,
  language,           // ← add
  onLanguageChange,   // ← add
}) {
  const cfg = CONTRACT_TYPES[selectedType];
  if (!cfg) return null;

  return (
    <div style={styles.card}>
      {/* Form header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <span style={{ fontSize: "28px" }}>{cfg.icon}</span>
        <div style={{ ...styles.sectionTitle, margin: 0 }}>
          {cfg.label} — Party Details
        </div>
      </div>

      {/* Language Picker */}
      <div style={{ marginBottom: "20px" }}>
        <label style={styles.label}>
          Contract Language / अनुबंध भाषा
        </label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            style={styles.languageSelect}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.nativeLabel} — {l.label}
              </option>
            ))}
          </select>
          {language !== "english" && (
            <span style={styles.languageBadge}>
              🇮🇳 Regional
            </span>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={styles.fieldGrid}>
        {cfg.fields.map((f) => (
          <div key={f.key} style={f.multiline ? styles.fieldFull : {}}>
            <label style={styles.label}>
              {f.label}{" "}
              {f.required && <span style={{ color: "#c9a84c" }}>*</span>}
            </label>
            {f.multiline ? (
              <textarea
                style={styles.textarea}
                value={formData[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={`Enter ${f.label.toLowerCase()}...`}
              />
            ) : (
              <input
                style={styles.input}
                type={f.type || "text"}
                value={formData[f.key] || ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.type === "date" ? "" : `Enter ${f.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button style={styles.btnSecondary} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{
            ...styles.btnPrimary,
            display: "flex", alignItems: "center",
            opacity: (loading || atLimit) ? 0.5 : 1,
            cursor: (loading || atLimit) ? "not-allowed" : "pointer",
          }}
          onClick={onGenerate}
          disabled={loading || atLimit}
        >
          {loading && <span style={styles.spinner} />}
          {loading ? "Generating with AI..." : atLimit ? "Limit reached — upgrade to continue" : "⚡ Generate Contract"}
        </button>
      </div>


      <p style={{ marginTop: "16px", fontSize: "12px", color: "#555", fontFamily: "sans-serif" }}>
        🔒 Indian Contract Act 1872 · Arbitration & Conciliation Act 1996 · Stamp duty notice included
        {language !== "english" && (
          <span style={{ color: "#c9a84c", marginLeft: "8px" }}>
            · {LANGUAGES.find(l => l.value === language)?.nativeLabel} contract
          </span>
        )}
      </p>
    </div>
  );
}