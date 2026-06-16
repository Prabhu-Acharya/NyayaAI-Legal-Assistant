import React, { useState } from 'react';
import API from '../services/api';
import ESignature from '../components/ESignature';
import PremiumModal from '../components/PremiumModal';

const CUSTOM_TYPES = {
  cofounder: {
    label: 'Co-founder Agreement', icon: '🤝',
    fields: [
      { name: 'founder1Name',     label: 'Founder 1 Name',          required: true },
      { name: 'founder2Name',     label: 'Founder 2 Name',          required: true },
      { name: 'companyName',      label: 'Company / Startup Name',  required: true },
      { name: 'equity1',          label: 'Founder 1 Equity %',      required: true },
      { name: 'equity2',          label: 'Founder 2 Equity %',      required: true },
      { name: 'vestingMonths',    label: 'Vesting Period (months)'                 },
      { name: 'roles',            label: 'Roles & Responsibilities'               },
      { name: 'disputeCity',      label: 'Dispute City'                           },
    ],
  },
  terms: {
    label: 'Terms & Conditions', icon: '📋',
    fields: [
      { name: 'companyName',   label: 'Company Name',      required: true },
      { name: 'websiteUrl',    label: 'Website / App URL', required: true },
      { name: 'services',      label: 'Services Offered',  required: true },
      { name: 'refundPolicy',  label: 'Refund Policy'                    },
      { name: 'governingState',label: 'Governing State'                  },
    ],
  },
  privacy: {
    label: 'Privacy Policy', icon: '🔏',
    fields: [
      { name: 'companyName',   label: 'Company Name',      required: true },
      { name: 'websiteUrl',    label: 'Website / App URL', required: true },
      { name: 'dataCollected', label: 'Data Collected',    required: true },
      { name: 'dataPurpose',   label: 'Purpose of Data Use'              },
      { name: 'contactEmail',  label: 'Privacy Contact Email', required: true },
    ],
  },
  legal_notice: {
    label: 'Legal Notice', icon: '⚖️',
    fields: [
      { name: 'senderName',       label: 'Sender Name',             required: true },
      { name: 'senderAddress',    label: 'Sender Address',          required: true },
      { name: 'recipientName',    label: 'Recipient Name',          required: true },
      { name: 'recipientAddress', label: 'Recipient Address',       required: true },
      { name: 'grievance',        label: 'Grievance / Demand',      required: true },
      { name: 'deadline',         label: 'Response Deadline (days)'               },
      { name: 'lawyerName',       label: 'Advocate Name (optional)'               },
    ],
  },
};

const S = {
  wrapper:      { minHeight: '100%', background: 'linear-gradient(135deg,#0f0c29 0%,#1a1a2e 50%,#16213e 100%)', fontFamily: "'Georgia', serif", color: '#e8e0d0' },
  container:    { maxWidth: '960px', margin: '0 auto', padding: '40px 24px' },
  title:        { fontSize: '30px', fontWeight: '700', color: '#c9a84c', marginBottom: '6px' },
  subtitle:     { color: '#a0917a', fontSize: '14px', marginBottom: '36px', fontFamily: 'sans-serif' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '36px' },
  typeCard:     (a) => ({ padding: '20px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', border: a ? '2px solid #c9a84c' : '1px solid rgba(201,168,76,0.2)', background: a ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }),
  typeIcon:     { fontSize: '28px', display: 'block', marginBottom: '8px' },
  typeLabel:    (a) => ({ fontSize: '13px', fontFamily: 'sans-serif', color: a ? '#c9a84c' : '#a0917a', fontWeight: a ? '600' : '400' }),
  fieldBox:     { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  label:        { display: 'block', fontSize: '13px', color: '#a0917a', marginBottom: '6px', fontFamily: 'sans-serif' },
  input:        { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '8px', color: '#e8e0d0', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  btn:          { padding: '12px 28px', background: '#c9a84c', color: '#0f0c29', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'sans-serif' },
  btnSm:        { padding: '8px 18px', background: 'transparent', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif', textDecoration: 'none', display: 'inline-block' },
  btnGreen:     { padding: '8px 18px', background: '#166534', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'sans-serif' },
  preview:      { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '20px', fontFamily: 'sans-serif', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.7', color: '#ccc', maxHeight: '400px', overflowY: 'auto' },
  clauseBox:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '20px', marginBottom: '20px' },
  error:        { color: '#f87171', fontSize: '13px', fontFamily: 'sans-serif', marginBottom: '12px' },
  row:          { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' },
  sectionTitle: { color: '#c9a84c', fontFamily: 'sans-serif', fontSize: '16px', margin: '28px 0 12px' },
};

export default function CustomContractBuilder() {
  const [step, setStep]             = useState(1);
  const [selectedType, setType]     = useState(null);
  const [formData, setFormData]     = useState({});
  const [language, setLanguage]     = useState('english');
  const [content, setContent]       = useState('');
  const [contractId, setContractId] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [polishText, setPolishText]   = useState('');
  const [polishInstr, setPolishInstr] = useState('');
  const [polishedResult, setPolished] = useState('');
  const [polishing, setPolishing]     = useState(false);

  const [sigUrl, setSigUrl]           = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const cfg = selectedType ? CUSTOM_TYPES[selectedType] : null;
  const API_BASE = import.meta.env.VITE_API_URL || 'https://nyayaai-backend-qvih.onrender.com';

  const handleGenerate = async () => {
    const missing = cfg.fields.filter(f => f.required && !formData[f.name]?.trim());
    if (missing.length) { setError(`Required: ${missing.map(f => f.label).join(', ')}`); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await API.post('/api/contracts/generate-custom', { type: selectedType, formData, language });
      setContent(data.content); setContractId(data.contractId); setStep(3);
    } catch (err) {
      if (err.response?.data?.upgradeRequired) { setShowPremium(true); return; }
      setError(err.response?.data?.message || 'Generation failed');
    } finally { setLoading(false); }
  };

  const handlePolish = async () => {
    if (!polishText.trim()) return;
    setPolishing(true); setPolished('');
    try {
      const { data } = await API.post('/api/contracts/polish-clause', { clauseText: polishText, instruction: polishInstr || undefined });
      setPolished(data.improved);
    } catch (err) { setPolished('❌ ' + (err.response?.data?.message || 'Polish failed')); }
    finally { setPolishing(false); }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${cfg.label.replace(/\s+/g, '_')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSignedPDF = async () => {
    if (!contractId) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/contracts/${contractId}/export/pdf-signed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ signatureDataUrl: sigUrl || null }),
      });
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${cfg.label.replace(/\s+/g, '_')}-signed.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { setError('PDF download failed: ' + err.message); }
    finally { setDownloading(false); }
  };

  return (
    <div style={S.wrapper}>
      <div style={S.container}>
        <h1 style={S.title}>⚖️ Custom Contract Builder</h1>
        <p style={S.subtitle}>Co-founder agreements, T&C, Privacy Policies, Legal Notices — Indian law compliant</p>

        {/* Step 1 — Type */}
        {step === 1 && (
          <>
            <div style={S.grid}>
              {Object.entries(CUSTOM_TYPES).map(([key, val]) => (
                <div key={key} style={S.typeCard(selectedType === key)} onClick={() => setType(key)}>
                  <span style={S.typeIcon}>{val.icon}</span>
                  <span style={S.typeLabel(selectedType === key)}>{val.label}</span>
                </div>
              ))}
            </div>
            <button style={S.btn} disabled={!selectedType} onClick={() => setStep(2)}>Continue →</button>
          </>
        )}

        {/* Step 2 — Form */}
        {step === 2 && cfg && (
          <>
            <div style={S.row}>
              <span style={{ color: '#c9a84c', fontFamily: 'sans-serif', fontSize: '18px' }}>{cfg.icon} {cfg.label}</span>
              <button style={S.btnSm} onClick={() => { setStep(1); setFormData({}); setError(''); }}>← Back</button>
            </div>
            <div style={S.fieldBox}>
              {cfg.fields.map(f => (
                <div key={f.name} style={{ marginBottom: '16px' }}>
                  <label style={S.label}>{f.label}{f.required && ' *'}</label>
                  <input style={S.input} value={formData[f.name] || ''} onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))} placeholder={f.label} />
                </div>
              ))}
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Language</label>
                <select style={{ ...S.input, cursor: 'pointer' }} value={language} onChange={e => setLanguage(e.target.value)}>
                  {['english','hindi','marathi','tamil','telugu','bengali','gujarati','kannada'].map(l =>
                    <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>
                  )}
                </select>
              </div>
            </div>
            {error && <p style={S.error}>{error}</p>}
            <button style={S.btn} onClick={handleGenerate} disabled={loading}>
              {loading ? '⏳ Generating…' : '✨ Generate Contract'}
            </button>
          </>
        )}

        {/* Step 3 — Preview + E-sign + Polish */}
        {step === 3 && (
          <>
            <div style={S.row}>
              <span style={{ color: '#c9a84c', fontFamily: 'sans-serif', fontSize: '18px' }}>{cfg?.icon} {cfg?.label}</span>
              <button style={S.btnSm} onClick={() => setStep(2)}>← Edit</button>
              <button style={S.btnSm} onClick={handleDownloadTxt}>⬇ .txt</button>
              <button
                style={sigUrl ? S.btnGreen : S.btnSm}
                onClick={handleDownloadSignedPDF}
                disabled={downloading}
              >
                {downloading ? '⏳ Generating…' : sigUrl ? '📄 Download Signed PDF ✅' : '📄 Download PDF'}
              </button>
            </div>

            {error && <p style={S.error}>{error}</p>}
            <div style={S.preview}>{content}</div>

            {/* E-sign */}
            <h3 style={S.sectionTitle}>✍️ E-Signature</h3>
            <p style={{ ...S.label, marginBottom: '12px' }}>
              {sigUrl ? '✅ Signature captured — click Download Signed PDF above.' : 'Sign below, then download PDF to embed it.'}
            </p>
            <ESignature onSign={(url) => setSigUrl(url)} onClear={() => setSigUrl(null)} />
            {sigUrl && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ ...S.label, marginBottom: '6px' }}>Preview:</p>
                <img src={sigUrl} alt="signature" style={{ background: '#fff', borderRadius: '6px', padding: '4px', maxWidth: '260px' }} />
              </div>
            )}

            {/* Polish Clause */}
            <h3 style={S.sectionTitle}>🪄 Polish a Clause</h3>
            <div style={S.clauseBox}>
              <label style={S.label}>Paste clause text to improve</label>
              <textarea style={{ ...S.input, height: '100px', resize: 'vertical', marginBottom: '10px' }} value={polishText} onChange={e => setPolishText(e.target.value)} placeholder="Paste any clause from the contract above…" />
              <label style={S.label}>Instruction (optional)</label>
              <input style={{ ...S.input, marginBottom: '12px' }} value={polishInstr} onChange={e => setPolishInstr(e.target.value)} placeholder="e.g. Make more enforceable, simplify language…" />
              <button style={S.btnSm} onClick={handlePolish} disabled={polishing || !polishText.trim()}>
                {polishing ? '⏳ Polishing…' : '✨ Polish with AI'}
              </button>
              {polishedResult && (
                <div style={{ marginTop: '14px' }}>
                  <p style={{ ...S.label, marginBottom: '6px', color: '#4ade80' }}>✅ Improved clause:</p>
                  <div style={{ ...S.preview, maxHeight: '200px', marginBottom: 0 }}>{polishedResult}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </div>
  );
}