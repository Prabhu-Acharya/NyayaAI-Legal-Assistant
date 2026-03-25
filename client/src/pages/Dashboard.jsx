import React, { useState } from "react";

function Dashboard() {
  // 🧠 Store user input
  const [question, setQuestion] = useState("");

  // 💬 Store chat messages (user + AI)
  const [messages, setMessages] = useState([]);

  // ⏳ Loading state
  const [loading, setLoading] = useState(false);

  // 🔐 Get token
  const token = localStorage.getItem("token");

  // 🚀 Ask Question Function
  const handleAsk = async () => {
    // ❌ Empty check
    if (!question.trim()) return;

    // ❌ Not logged in
    if (!token) {
      alert("Please login first ❌");
      return;
    }

    // 👤 Add user message
    const userMessage = {
      role: "user",
      text: question
    };

    setMessages((prev) => [...prev, userMessage]);

    // ⏳ Start loading
    setLoading(true);

    try {
      // 📡 API CALL (FIXED ENDPOINT ✅)
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      console.log("API RESPONSE:", data); // 🔍 DEBUG

      // 🤖 AI response
      const aiMessage = {
        role: "ai",
        text: data.answer || "No response from AI ❌"
      };

      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Server error ❌" }
      ]);
    }

    // 🧹 Clear input
    setQuestion("");

    // ⏳ Stop loading
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 🏷️ Heading */}
      <h2>⚖️ Nyaya AI Chat</h2>

      {/* 💬 CHAT BOX */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px"
        }}
      >
        {/* 🔁 Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "10px 0"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                background: msg.role === "user" ? "#4CAF50" : "#eee",
                color: msg.role === "user" ? "#fff" : "#000",
                maxWidth: "70%"
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {/* ⏳ Loading */}
        {loading && <p>🤖 Thinking...</p>}
      </div>

      {/* ✏️ INPUT */}
      <input
        type="text"
        placeholder="Ask your legal question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "70%", padding: "10px" }}
      />

      {/* 🚀 BUTTON */}
      <button onClick={handleAsk} style={{ marginLeft: "10px" }}>
        Ask
      </button>

      <br /><br />

      {/* 🔓 LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;