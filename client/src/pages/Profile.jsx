// client/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, usageRes] = await Promise.all([
          api.get("/api/users/profile"),
          api.get("/api/users/usage"),
        ]);
        setProfile(profileRes.data);
        setUsage(usageRes.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={s.center}>Loading…</div>;
  if (error)   return <div style={s.center}>{error}</div>;

  const usedPct = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0;

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.avatar}>{profile?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <div style={s.name}>{profile?.name}</div>
            <div style={s.email}>{profile?.userId || profile?.message}</div>
          </div>
          <span style={{ ...s.badge, ...(usage?.isPremium ? s.badgePro : s.badgeFree) }}>
            {usage?.isPremium ? "⚡ Pro" : "Free"}
          </span>
        </div>

        {/* Plan */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Plan</div>
          <div style={s.planBox}>
            <div>
              <div style={s.planName}>{usage?.isPremium ? "Pro Plan" : "Free Plan"}</div>
              <div style={s.planSub}>
                {usage?.isPremium
                  ? "Unlimited contracts · All features"
                  : `${usage?.used ?? 0} / ${usage?.limit} contracts used this month`}
              </div>
            </div>
            {!usage?.isPremium && (
              <button style={s.upgradeBtn}>Upgrade to Pro</button>
            )}
          </div>

          {/* Usage bar — free only */}
          {!usage?.isPremium && (
            <div style={s.barTrack}>
              <div style={{ ...s.barFill, width: `${usedPct}%`, background: usedPct >= 100 ? "#e05a5a" : "#f59e0b" }} />
            </div>
          )}

          {usage?.resetDate && !usage?.isPremium && (
            <div style={s.resetNote}>
              Resets on {new Date(usage.resetDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          )}
        </div>

        {/* Logout */}
        <div style={s.section}>
          <button style={s.logoutBtn} onClick={onLogout}>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2.5rem 1rem" },
  card:       { background: "#1e293b", borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
  center:     { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", background: "#0f172a" },
  header:     { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", paddingBottom: "1.5rem", borderBottom: "1px solid #334155" },
  avatar:     { width: 48, height: 48, borderRadius: "50%", background: "#f59e0b", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", flexShrink: 0 },
  name:       { fontWeight: 700, fontSize: "1rem", color: "#f1f5f9" },
  email:      { fontSize: "0.8rem", color: "#64748b", marginTop: 2 },
  badge:      { marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "6px", flexShrink: 0 },
  badgePro:   { background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" },
  badgeFree:  { background: "rgba(100,116,139,0.2)", color: "#94a3b8", border: "1px solid #334155" },
  section:    { marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: "#475569", textTransform: "uppercase", marginBottom: "0.75rem" },
  planBox:    { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" },
  planName:   { fontSize: "0.95rem", fontWeight: 600, color: "#f1f5f9" },
  planSub:    { fontSize: "0.8rem", color: "#64748b", marginTop: 2 },
  upgradeBtn: { flexShrink: 0, padding: "0.4rem 0.9rem", background: "#f59e0b", color: "#000", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" },
  barTrack:   { height: 6, background: "#334155", borderRadius: 3, marginTop: "0.75rem", overflow: "hidden" },
  barFill:    { height: "100%", borderRadius: 3, transition: "width 0.4s ease" },
  resetNote:  { fontSize: "0.75rem", color: "#475569", marginTop: "0.5rem" },
  logoutBtn:  { width: "100%", padding: "0.7rem", background: "transparent", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8", fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s" },
};