import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const strength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) { setError("Please fill in all fields."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      const { data } = await API.post("/api/users/register", formData);
      if (data.token) localStorage.setItem("token", data.token);
      navigate("/login");
    } catch (err) { setError(err.response?.data?.message || "Registration failed."); }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logoRow}>
          <span style={S.logoIcon}>⚖️</span>
          <span style={S.logoText}>NyayaAI</span>
        </div>

        <h1 style={S.heading}>Create your account</h1>
        <p style={S.sub}>Start with 3 free contracts — no card required</p>

        {/* Google */}
        <button style={S.googleBtn} onClick={() => alert("Google Auth — coming soon")}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={S.dividerRow}>
          <div style={S.dividerLine} />
          <span style={S.dividerText}>or</span>
          <div style={S.dividerLine} />
        </div>

        {/* Fields */}
        <div style={S.field}>
          <label style={S.label}>Full name</label>
          <input name="name" autoComplete="name" style={S.input}
            value={formData.name} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder="Priya Sharma" />
        </div>

        <div style={S.field}>
          <label style={S.label}>Email address</label>
          <input name="email" type="email" autoComplete="email" style={S.input}
            value={formData.email} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder="you@example.com" />
        </div>

        <div style={S.field}>
          <label style={S.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input name="password" type={showPw ? "text" : "password"} autoComplete="new-password"
              style={{ ...S.input, paddingRight: 44 }}
              value={formData.password} onChange={handleChange} onKeyDown={handleKeyDown}
              placeholder="Min. 6 characters" />
            <button style={S.eyeBtn} onClick={() => setShowPw(p => !p)} tabIndex={-1}>
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
          {/* Password strength */}
          {formData.password.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 99,
                    background: i <= strength ? strengthColor : "#e5e5e5",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "11px", color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        {error && (
          <div style={S.errorBox}>
            <span style={{ marginRight: 6 }}>⚠️</span>{error}
          </div>
        )}

        <button style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <span style={S.spinnerRow}><span style={S.spinner} />Creating account…</span>
          ) : "Create account"}
        </button>

        <p style={S.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={S.switchLink}>Sign in</Link>
        </p>

        <p style={S.legalText}>
          By creating an account, you agree to NyayaAI's{" "}
          <span style={S.legalLink}>Terms of Service</span> and{" "}
          <span style={S.legalLink}>Privacy Policy</span>.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh", background: "#f7f7f8",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px 16px",
  },
  card: {
    background: "#ffffff", borderRadius: "16px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    padding: "40px 40px 32px",
    width: "100%", maxWidth: "420px",
  },
  logoRow:   { display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" },
  logoIcon:  { fontSize: "22px" },
  logoText:  { fontSize: "17px", fontWeight: "700", color: "#111", letterSpacing: "-0.3px" },
  heading:   { fontSize: "22px", fontWeight: "700", color: "#111", margin: "0 0 6px", letterSpacing: "-0.4px" },
  sub:       { fontSize: "14px", color: "#888", margin: "0 0 24px" },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "10px 16px", borderRadius: "10px",
    border: "1px solid #e5e5e5", background: "#fff",
    fontSize: "14px", fontWeight: "500", color: "#333",
    cursor: "pointer", fontFamily: "inherit",
  },
  dividerRow:  { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
  dividerLine: { flex: 1, height: "1px", background: "#e5e5e5" },
  dividerText: { fontSize: "12px", color: "#aaa", fontWeight: "500" },
  field:       { marginBottom: "16px" },
  label:       { fontSize: "13px", fontWeight: "500", color: "#444", display: "block", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 12px",
    border: "1px solid #e0e0e0", borderRadius: "10px",
    fontSize: "14px", color: "#111", background: "#fafafa",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: 0,
  },
  errorBox: {
    background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "8px",
    padding: "10px 12px", fontSize: "13px", color: "#dc2626",
    display: "flex", alignItems: "center", marginBottom: "16px",
  },
  submitBtn: {
    width: "100%", padding: "11px", borderRadius: "10px",
    background: "#111", color: "#fff", border: "none",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    fontFamily: "inherit", marginBottom: "20px",
  },
  spinnerRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: {
    width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  switchText:  { fontSize: "13px", color: "#888", textAlign: "center", margin: "0 0 20px" },
  switchLink:  { color: "#6366f1", fontWeight: "600", textDecoration: "none" },
  legalText:   { fontSize: "11px", color: "#bbb", textAlign: "center", lineHeight: "1.6", margin: 0 },
  legalLink:   { color: "#999", cursor: "pointer", textDecoration: "underline" },
};

export default Register;