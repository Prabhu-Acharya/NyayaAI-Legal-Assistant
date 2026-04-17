// ─────────────────────────────────────────────────────────────────────────────
// PremiumModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import API from "../services/api";
import { styles } from "./ContractForm";

export default function PremiumModal({ isOpen, onClose, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  if (!isOpen) return null;

  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleDateString("en-IN", { day: "numeric", month: "long" });

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id  = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleUpgrade = async () => {
    setError("");
    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Failed to load payment gateway. Check your internet connection.");
      setLoading(false);
      return;
    }

    let orderData;
    try {
      const { data } = await API.post("/api/payment/create-order", {});
      orderData = data;
    } catch (err) {
      setError(err.response?.data?.message || "Could not initiate payment. Try again.");
      setLoading(false);
      return;
    }

    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        "NyayaAI",
      description: "Pro Plan — Unlimited Contract Generations",
      order_id:    orderData.orderId,

      handler: async (response) => {
        try {
          await API.post("/api/payment/verify", {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          onUpgradeSuccess();
          onClose();
        } catch {
          setError("Payment verification failed. Contact support.");
        }
        setLoading(false);
      },

      modal: {
        ondismiss: () => setLoading(false),
      },

      prefill: {
        name:  localStorage.getItem("userName")  || "",
        email: localStorage.getItem("userEmail") || "",
      },

      theme: { color: "#c9a84c" },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1a1a2e",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "16px",
          padding: "32px",
          width: "380px",
          maxWidth: "calc(100vw - 32px)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⭐</div>

        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#c9a84c", marginBottom: "10px" }}>
          Free plan limit reached
        </h2>
        <p style={{ fontSize: "14px", color: "#a0917a", lineHeight: "1.6", marginBottom: "24px" }}>
          You've used all <strong style={{ color: "#e8e0d0" }}>3 free contract generations</strong> this month.
          Upgrade to Pro for unlimited access, or wait until your limit resets on{" "}
          <strong style={{ color: "#e8e0d0" }}>{resetDate}</strong>.
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {/* Free */}
          <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "14px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Free</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#e8e0d0" }}>₹0</div>
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "10px" }}>/month</div>
            <div style={{ fontSize: "12px", color: "#888", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span>✓ 3 generations / mo</span>
              <span>✓ 5 contract types</span>
              <span style={{ opacity: 0.4 }}>— E-sign</span>
            </div>
          </div>

          {/* Pro */}
          <div style={{ flex: 1, border: "1px solid #c9a84c", borderRadius: "10px", padding: "14px", background: "rgba(201,168,76,0.08)" }}>
            <div style={{ fontSize: "12px", color: "#c9a84c", marginBottom: "4px" }}>Pro</div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "#e8e0d0" }}>₹499</div>
            <div style={{ fontSize: "11px", color: "#555", marginBottom: "10px" }}>/month</div>
            <div style={{ fontSize: "12px", color: "#a0917a", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ color: "#c9a84c" }}>✓ Unlimited generations</span>
              <span style={{ color: "#c9a84c" }}>✓ All contract types</span>
              <span style={{ color: "#c9a84c" }}>✓ E-sign included</span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: "13px", color: "#E24B4A", marginBottom: "12px", padding: "10px", background: "rgba(226,75,74,0.1)", borderRadius: "8px" }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            ...styles.btnPrimary,
            width: "100%",
            marginBottom: "10px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Opening payment..." : "Upgrade to Pro — ₹499/mo"}
        </button>
        <button
          onClick={onClose}
          style={{ ...styles.btnSecondary, width: "100%" }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}