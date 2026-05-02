import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── constants ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⚖",
    title: "BNS / IPC Citation Engine",
    desc: "Every answer grounded in Bharatiya Nyaya Sanhita 2023 sections. Real citations, not hallucinations.",
    tag: "RAG-powered",
    tagColor: "#1D4ED8",
  },
  {
    icon: "📄",
    title: "Contract Generator",
    desc: "8 contract types — rent, NDA, employment, service & more. Hindi + regional language output with strength score 0–100.",
    tag: "PDF + DOCX",
    tagColor: "#059669",
  },
  {
    icon: "🔍",
    title: "Document Analyser",
    desc: "Upload any legal PDF. AI extracts risk clauses, flags red flags, gives risk score before you sign.",
    tag: "Risk score",
    tagColor: "#D97706",
  },
  {
    icon: "⚡",
    title: "IndianKanoon Cases",
    desc: "Top 5 real case precedents pulled live for every legal query. Court judgments at your fingertips.",
    tag: "Live search",
    tagColor: "#7C3AED",
  },
  {
    icon: "🗣",
    title: "Voice Input",
    desc: "Speak your legal question in Hindi or English. No typing needed — powered by Web Speech API.",
    tag: "Hindi ready",
    tagColor: "#DC2626",
  },
  {
    icon: "📱",
    title: "WhatsApp Share",
    desc: "Share contracts and legal summaries directly to WhatsApp with one tap. Built for Bharat.",
    tag: "Share",
    tagColor: "#16A34A",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Try NyayaAI risk-free",
    features: ["5 AI queries/day", "2 contract generations", "Document upload (1 file)", "BNS citations"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    desc: "For individuals & small businesses",
    features: [
      "Unlimited AI queries",
      "Unlimited contracts (all 8 types)",
      "Hindi + regional languages",
      "Document analyser (unlimited)",
      "IndianKanoon case lookup",
      "Voice input",
      "WhatsApp share",
      "Priority support",
    ],
    cta: "Get Pro — ₹499/mo",
    highlight: true,
  },
];

const FAQS = [
  {
    q: "Is NyayaAI a substitute for a lawyer?",
    a: "No. NyayaAI provides legal information grounded in BNS 2023 and real case law to help you understand your situation. For court proceedings or complex matters, always consult a qualified advocate.",
  },
  {
    q: "Which laws does the AI know?",
    a: "Currently Bharatiya Nyaya Sanhita 2023 (replacing IPC). Constitution of India and other statutes are coming soon via our RAG expansion roadmap.",
  },
  {
    q: "Are my documents stored?",
    a: "Uploaded documents are processed transiently and not stored beyond your session. Your data stays private.",
  },
  {
    q: "Can I get contracts in Hindi?",
    a: "Yes. All 8 contract types can be generated in Hindi and select regional languages. PDF and DOCX download included.",
  },
];

// ─── component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scales tilt: 0 = balanced, positive = right heavy, negative = left heavy
  const scaleTilt = Math.sin(scrollY * 0.005) * 12;

  return (
    <div style={styles.root}>
      {/* ── NAV ── */}
      <nav style={{ ...styles.nav, backdropFilter: scrollY > 40 ? "blur(12px)" : "none", background: scrollY > 40 ? "rgba(10,10,20,0.88)" : "transparent" }}>
        <div style={styles.navInner}>
          <span style={styles.logo}>
            <span style={styles.logoGlyph}>⚖</span>
            <span>NyayaAI</span>
          </span>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#pricing" style={styles.navLink}>Pricing</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
          </div>
          <div style={styles.navActions}>
            <button style={styles.btnGhost} onClick={() => navigate("/login")}>Log in</button>
            <button style={styles.btnAccent} onClick={() => navigate("/register")}>Start free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={styles.hero}>
        {/* animated mesh bg */}
        <div style={styles.meshBg} aria-hidden="true">
          <div style={{ ...styles.meshBlob, top: "10%", left: "15%", background: "radial-gradient(circle, rgba(180,140,60,0.18) 0%, transparent 70%)" }} />
          <div style={{ ...styles.meshBlob, top: "50%", right: "10%", background: "radial-gradient(circle, rgba(80,60,160,0.15) 0%, transparent 70%)", width: 500, height: 500 }} />
        </div>

        {/* Scales SVG — hero centrepiece */}
        <div style={styles.scalesWrap} aria-hidden="true">
          <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
            {/* pillar */}
            <rect x="107" y="40" width="6" height="110" fill="#B8922A" opacity="0.9" />
            {/* base */}
            <rect x="75" y="148" width="70" height="8" rx="4" fill="#B8922A" opacity="0.9" />
            {/* beam */}
            <g transform={`rotate(${scaleTilt}, 110, 42)`}>
              <rect x="30" y="39" width="160" height="5" rx="2.5" fill="#C9A84C" />
              {/* left chain */}
              <line x1="40" y1="44" x2="40" y2="80" stroke="#C9A84C" strokeWidth="1.5" />
              {/* right chain */}
              <line x1="180" y1="44" x2="180" y2="80" stroke="#C9A84C" strokeWidth="1.5" />
              {/* left pan */}
              <ellipse cx="40" cy="82" rx="22" ry="7" fill="#1a1a2e" stroke="#C9A84C" strokeWidth="1.5" />
              {/* right pan */}
              <ellipse cx="180" cy="82" rx="22" ry="7" fill="#1a1a2e" stroke="#C9A84C" strokeWidth="1.5" />
            </g>
            {/* top ornament */}
            <circle cx="110" cy="40" r="6" fill="#C9A84C" />
          </svg>
        </div>

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>India's AI Legal Assistant · BNS 2023</div>
          <h1 style={styles.heroHeading}>
            Legal clarity,<br />
            <em style={styles.heroEm}>without the brief.</em>
          </h1>
          <p style={styles.heroSub}>
            Ask any legal question in Hindi or English. Get answers grounded in Bharatiya Nyaya Sanhita 2023, real IndianKanoon cases, and AI-generated contracts — in seconds, not days.
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.btnHero} onClick={() => navigate("/register")}>
              Start free — no credit card
            </button>
            <button style={styles.btnGhostHero} onClick={() => navigate("/chat")}>
              Try a question →
            </button>
          </div>
          <p style={styles.heroNote}>₹499/mo for Pro · Trusted by 1,000+ users</p>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={styles.trustBar}>
        {["Bharatiya Nyaya Sanhita 2023", "IPC Legacy Citations", "IndianKanoon Cases", "Hindi Contracts", "Risk Score Analysis"].map((t) => (
          <span key={t} style={styles.trustItem}>
            <span style={styles.trustDot} />
            {t}
          </span>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>What NyayaAI does</p>
          <h2 style={styles.sectionHeading}>Everything a solo litigant needs</h2>
          <div style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={styles.howSection}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>How it works</p>
          <h2 style={styles.sectionHeading}>From question to answer in 3 steps</h2>
          <div style={styles.stepsRow}>
            {[
              { n: "01", title: "Ask in plain language", body: "Type or speak your legal question in Hindi or English. No legal jargon required." },
              { n: "02", title: "AI grounds the answer", body: "RAG pipeline searches BNS 2023 vectors + IndianKanoon cases. Answer cites real sections." },
              { n: "03", title: "Get document / share", body: "Download contract as PDF or DOCX, or share summary to WhatsApp instantly." },
            ].map((s, i) => (
              <div key={s.n} style={styles.step}>
                <span style={styles.stepNum}>{s.n}</span>
                {i < 2 && <div style={styles.stepLine} />}
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>Pricing</p>
          <h2 style={styles.sectionHeading}>Simple. Transparent. Built for Bharat.</h2>
          <div style={styles.pricingRow}>
            {PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                hovered={hoveredPlan === plan.name}
                onHover={() => setHoveredPlan(plan.name)}
                onLeave={() => setHoveredPlan(null)}
                onCta={() => navigate(plan.highlight ? "/register?plan=pro" : "/register")}
              />
            ))}
          </div>
          <p style={styles.pricingNote}>Payments via Razorpay · UPI, cards, net banking accepted · Cancel anytime</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={styles.section}>
        <div style={{ ...styles.sectionInner, maxWidth: 720 }}>
          <p style={styles.sectionEyebrow}>FAQ</p>
          <h2 style={styles.sectionHeading}>Common questions</h2>
          <div style={styles.faqList}>
            {FAQS.map((item, i) => (
              <FaqItem key={i} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={styles.ctaBanner}>
        <div style={styles.sectionInner}>
          <h2 style={styles.ctaHeading}>Justice shouldn't require a law degree.</h2>
          <p style={styles.ctaSub}>Start free. Ask your first legal question in 30 seconds.</p>
          <button style={styles.btnHero} onClick={() => navigate("/register")}>
            Get started — it's free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.logo}>
            <span style={styles.logoGlyph}>⚖</span>
            <span>NyayaAI</span>
          </span>
          <p style={styles.footerDisclaimer}>
            NyayaAI provides legal information, not legal advice. Not a substitute for a qualified advocate. Powered by Llama 3.3 70B via Groq.
          </p>
          <div style={styles.footerLinks}>
            <a href="/privacy" style={styles.footerLink}>Privacy</a>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <a href="mailto:support@nyayaai.in" style={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc, tag, tagColor }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...styles.featureCard, ...(hov ? styles.featureCardHov : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={styles.featureIcon}>{icon}</span>
      <span style={{ ...styles.featureTag, color: tagColor, borderColor: tagColor + "44", background: tagColor + "14" }}>{tag}</span>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{desc}</p>
    </div>
  );
}

function PricingCard({ plan, hovered, onHover, onLeave, onCta }) {
  return (
    <div
      style={{
        ...styles.pricingCard,
        ...(plan.highlight ? styles.pricingCardHL : {}),
        transform: hovered ? "translateY(-6px)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: plan.highlight
          ? hovered ? "0 20px 60px rgba(185,146,42,0.3)" : "0 8px 32px rgba(185,146,42,0.18)"
          : "none",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {plan.highlight && <div style={styles.popularBadge}>Most popular</div>}
      <p style={styles.planName}>{plan.name}</p>
      <div style={styles.planPriceRow}>
        <span style={styles.planPrice}>{plan.price}</span>
        <span style={styles.planPeriod}>{plan.period}</span>
      </div>
      <p style={styles.planDesc}>{plan.desc}</p>
      <ul style={styles.planFeatures}>
        {plan.features.map((f) => (
          <li key={f} style={styles.planFeatureItem}>
            <span style={{ ...styles.checkmark, color: plan.highlight ? "#C9A84C" : "#6b7280" }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        style={plan.highlight ? styles.btnHero : styles.btnGhostPlan}
        onClick={onCta}
      >
        {plan.cta}
      </button>
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div style={styles.faqItem}>
      <button style={styles.faqQ} onClick={onToggle}>
        <span>{item.q}</span>
        <span style={{ ...styles.faqChevron, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open && <p style={styles.faqA}>{item.a}</p>}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const GOLD_DARK = "#B8922A";
const INK = "#0a0a14";
const INK2 = "#12121e";
const PARCHMENT = "#f5f0e8";
const MUTED = "#9ca3af";

const styles = {
  root: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: INK,
    color: PARCHMENT,
    minHeight: "100vh",
    overflowX: "hidden",
  },

  // nav
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: "background 0.3s ease, backdrop-filter 0.3s ease",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: "0.02em",
    textDecoration: "none",
    flexShrink: 0,
  },
  logoGlyph: { fontSize: 22 },
  navLinks: {
    display: "flex",
    gap: 28,
    marginLeft: "auto",
  },
  navLink: {
    color: PARCHMENT,
    opacity: 0.7,
    textDecoration: "none",
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
    transition: "opacity 0.15s",
  },
  navActions: {
    display: "flex",
    gap: 12,
    marginLeft: 16,
  },

  // buttons
  btnGhost: {
    background: "transparent",
    border: "1px solid rgba(201,168,76,0.35)",
    color: GOLD,
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 14,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  btnAccent: {
    background: GOLD,
    border: "none",
    color: INK,
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  btnHero: {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
    border: "none",
    color: INK,
    borderRadius: 10,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    letterSpacing: "0.01em",
    transition: "opacity 0.15s, transform 0.15s",
  },
  btnGhostHero: {
    background: "transparent",
    border: "1px solid rgba(201,168,76,0.4)",
    color: GOLD,
    borderRadius: 10,
    padding: "14px 28px",
    fontSize: 16,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  btnGhostPlan: {
    background: "transparent",
    border: `1px solid rgba(245,240,232,0.25)`,
    color: PARCHMENT,
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 15,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    width: "100%",
    marginTop: "auto",
    transition: "border-color 0.15s",
  },

  // hero
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "100px 24px 80px",
    overflow: "hidden",
  },
  meshBg: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
  meshBlob: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    filter: "blur(80px)",
    animation: "pulse 8s ease-in-out infinite alternate",
  },
  scalesWrap: {
    marginBottom: 32,
    opacity: 0.85,
    filter: "drop-shadow(0 0 18px rgba(201,168,76,0.22))",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 760,
  },
  heroBadge: {
    display: "inline-block",
    background: "rgba(201,168,76,0.12)",
    border: "1px solid rgba(201,168,76,0.35)",
    color: GOLD,
    borderRadius: 100,
    padding: "6px 18px",
    fontSize: 13,
    fontFamily: "system-ui, sans-serif",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 28,
  },
  heroHeading: {
    fontSize: "clamp(42px, 7vw, 80px)",
    fontWeight: 700,
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    color: PARCHMENT,
    margin: "0 0 24px",
  },
  heroEm: {
    fontStyle: "italic",
    color: GOLD,
  },
  heroSub: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    color: "rgba(245,240,232,0.72)",
    lineHeight: 1.65,
    maxWidth: 600,
    margin: "0 auto 40px",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 400,
  },
  heroCtas: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  heroNote: {
    marginTop: 20,
    fontSize: 13,
    color: "rgba(245,240,232,0.4)",
    fontFamily: "system-ui, sans-serif",
  },

  // trust bar
  trustBar: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px 32px",
    padding: "20px 24px",
    borderTop: "1px solid rgba(201,168,76,0.12)",
    borderBottom: "1px solid rgba(201,168,76,0.12)",
    background: "rgba(201,168,76,0.04)",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "rgba(245,240,232,0.55)",
    fontFamily: "system-ui, sans-serif",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  trustDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: GOLD,
    opacity: 0.7,
    flexShrink: 0,
  },

  // sections
  section: {
    padding: "100px 24px",
  },
  sectionInner: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  sectionEyebrow: {
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: GOLD,
    fontFamily: "system-ui, sans-serif",
    marginBottom: 12,
    fontWeight: 600,
  },
  sectionHeading: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: PARCHMENT,
    marginBottom: 56,
    maxWidth: 560,
  },

  // features
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
  },
  featureCard: {
    background: INK2,
    border: "1px solid rgba(245,240,232,0.08)",
    borderRadius: 14,
    padding: "28px 28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    cursor: "default",
    transition: "border-color 0.2s ease, background 0.2s ease",
  },
  featureCardHov: {
    borderColor: "rgba(201,168,76,0.3)",
    background: "rgba(201,168,76,0.04)",
  },
  featureIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  featureTag: {
    display: "inline-block",
    fontSize: 11,
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid",
    width: "fit-content",
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: PARCHMENT,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  featureDesc: {
    fontSize: 15,
    color: "rgba(245,240,232,0.62)",
    lineHeight: 1.65,
    fontFamily: "system-ui, sans-serif",
    margin: 0,
  },

  // how it works
  howSection: {
    padding: "100px 24px",
    background: "rgba(201,168,76,0.04)",
    borderTop: "1px solid rgba(201,168,76,0.1)",
    borderBottom: "1px solid rgba(201,168,76,0.1)",
  },
  stepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 48,
    position: "relative",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    position: "relative",
  },
  stepNum: {
    fontSize: 52,
    fontWeight: 700,
    color: "rgba(201,168,76,0.18)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    fontFamily: "system-ui, sans-serif",
  },
  stepLine: {
    display: "none", // mobile-hidden; desktop handled via grid
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: PARCHMENT,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  stepBody: {
    fontSize: 15,
    color: "rgba(245,240,232,0.62)",
    lineHeight: 1.65,
    fontFamily: "system-ui, sans-serif",
    margin: 0,
  },

  // pricing
  pricingRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
    maxWidth: 800,
    margin: "0 auto",
  },
  pricingCard: {
    background: INK2,
    border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 16,
    padding: "36px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "relative",
  },
  pricingCardHL: {
    border: `2px solid ${GOLD}`,
    background: "rgba(201,168,76,0.06)",
  },
  popularBadge: {
    position: "absolute",
    top: -14,
    left: "50%",
    transform: "translateX(-50%)",
    background: GOLD,
    color: INK,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "4px 16px",
    borderRadius: 100,
    whiteSpace: "nowrap",
  },
  planName: {
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: GOLD,
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
    margin: 0,
  },
  planPriceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  planPrice: {
    fontSize: 48,
    fontWeight: 700,
    color: PARCHMENT,
    letterSpacing: "-0.03em",
  },
  planPeriod: {
    fontSize: 16,
    color: MUTED,
    fontFamily: "system-ui, sans-serif",
  },
  planDesc: {
    fontSize: 14,
    color: MUTED,
    fontFamily: "system-ui, sans-serif",
    margin: 0,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(245,240,232,0.08)",
  },
  planFeatures: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  planFeatureItem: {
    display: "flex",
    gap: 10,
    fontSize: 14,
    color: "rgba(245,240,232,0.8)",
    fontFamily: "system-ui, sans-serif",
    alignItems: "flex-start",
    lineHeight: 1.5,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  pricingNote: {
    textAlign: "center",
    fontSize: 13,
    color: MUTED,
    fontFamily: "system-ui, sans-serif",
    marginTop: 28,
  },

  // faq
  faqList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  faqItem: {
    borderBottom: "1px solid rgba(245,240,232,0.1)",
  },
  faqQ: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: PARCHMENT,
    textAlign: "left",
    padding: "20px 0",
    fontSize: 17,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    lineHeight: 1.45,
  },
  faqChevron: {
    fontSize: 18,
    color: GOLD,
    flexShrink: 0,
    transition: "transform 0.2s ease",
  },
  faqA: {
    fontSize: 15,
    color: "rgba(245,240,232,0.65)",
    lineHeight: 1.7,
    fontFamily: "system-ui, sans-serif",
    paddingBottom: 20,
    margin: 0,
    maxWidth: 640,
  },

  // cta banner
  ctaBanner: {
    padding: "100px 24px",
    textAlign: "center",
    borderTop: "1px solid rgba(201,168,76,0.15)",
    background: `radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)`,
  },
  ctaHeading: {
    fontSize: "clamp(28px, 4.5vw, 52px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: PARCHMENT,
    margin: "0 auto 20px",
    maxWidth: 680,
    lineHeight: 1.15,
  },
  ctaSub: {
    fontSize: 18,
    color: "rgba(245,240,232,0.6)",
    fontFamily: "system-ui, sans-serif",
    marginBottom: 40,
    lineHeight: 1.6,
  },

  // footer
  footer: {
    borderTop: "1px solid rgba(245,240,232,0.08)",
    padding: "40px 24px",
  },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 16,
    justifyContent: "space-between",
  },
  footerDisclaimer: {
    fontSize: 12,
    color: "rgba(245,240,232,0.35)",
    fontFamily: "system-ui, sans-serif",
    maxWidth: 520,
    lineHeight: 1.6,
    margin: 0,
    flex: "1 1 300px",
    textAlign: "center",
  },
  footerLinks: {
    display: "flex",
    gap: 20,
  },
  footerLink: {
    fontSize: 13,
    color: "rgba(245,240,232,0.45)",
    textDecoration: "none",
    fontFamily: "system-ui, sans-serif",
    transition: "color 0.15s",
  },
};