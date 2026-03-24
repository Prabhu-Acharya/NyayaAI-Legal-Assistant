import React, { useState } from "react";

function Dashboard() {

  // 🧠 User input (question)
  const [question, setQuestion] = useState("");

  // 💬 Chat messages store (user + AI)
  const [messages, setMessages] = useState([]);

  // ⏳ Loading state (AI thinking...)
  const [loading, setLoading] = useState(false);

  // 🔐 JWT token from localStorage
  const token = localStorage.getItem("token");


  // 🚀 Function: send question to backend
  const handleAsk = async () => {

    // ❌ Empty question check
    if (!question.trim()) return;

    // ❌ If user not logged in
    if (!token) {
      alert("Please login first ❌");
      return;
    }

    // 👤 Step 1: Add user message to chat
    const userMessage = {
      role: "user",   // user message
      text: question  // actual text
    };

    // 📌 Update messages state
    setMessages((prev) => [...prev, userMessage]);

    // ⏳ Start loading
    setLoading(true);

    try {
      // 📡 API call to backend
      const res = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔐 send JWT
        },
        body: JSON.stringify({ question }) // 📤 send question
      });

      // 📥 Get response
      const data = await res.json();

      // 🤖 Step 2: Add AI response to chat
      const aiMessage = {
        role: "ai", // AI message
        text: data.answer || "No response"
      };

      // 📌 Update messages again
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error(error);
    }

    // 🧹 Clear input field
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
          overflowY: "auto",   // scroll enable
          padding: "10px",
          marginBottom: "10px"
        }}
      >

        {/* 🔁 Loop through messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              // 👉 Right for user, Left for AI
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "10px 0"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",

                // 🎨 Different colors
                background:
                  msg.role === "user" ? "#4CAF50" : "#eee",

                color: msg.role === "user" ? "#fff" : "#000",

                maxWidth: "70%" // message width limit
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {/* ⏳ Loading indicator */}
        {loading && <p>🤖 Thinking...</p>}

      </div>


      {/* ✏️ INPUT FIELD */}
      <input
        type="text"
        placeholder="Ask your legal question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)} // update state
        style={{ width: "70%", padding: "10px" }}
      />


      {/* 🚀 ASK BUTTON */}
      <button onClick={handleAsk} style={{ marginLeft: "10px" }}>
        Ask
      </button>


      <br /><br />


      {/* 🔓 LOGOUT BUTTON */}
      <button
        onClick={() => {
          localStorage.removeItem("token"); // remove token
          window.location.reload();         // refresh app
        }}
      >
        Logout
      </button>

    </div>
  );
}

export default Dashboard;