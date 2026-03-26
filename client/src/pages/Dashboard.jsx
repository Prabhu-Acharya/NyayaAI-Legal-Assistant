import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* =========================================================
   🔥 TypingText Component
   - Shows AI response character-by-character
   - Improves UX (feels like real AI thinking)
========================================================= */
const TypingText = ({ text, speed = 15 }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed(""); // reset when new text comes

    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {displayed}
    </ReactMarkdown>
  );
};

function Dashboard() {
  // 🔹 User input state
  const [question, setQuestion] = useState("");

  // 🔹 Chat messages (user + AI)
  const [messages, setMessages] = useState([]);

  // 🔹 Loading state (AI typing indicator)
  const [loading, setLoading] = useState(false);

  // 🔹 Ref for auto-scroll
  const chatEndRef = useRef(null);

  // 🔹 JWT token from localStorage
  const token = localStorage.getItem("token");

  /* =========================================================
     🔽 Auto Scroll to latest message
     - Runs whenever messages or loading changes
  ========================================================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* =========================================================
     🔥 Handle Ask (Send Question to Backend)
     - Adds user message
     - Calls API
     - Adds AI response
  ========================================================= */
  const handleAsk = async () => {
    if (!question.trim()) return; // prevent empty input

    // ✅ Add user message instantly
    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true); // start typing indicator

    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // JWT auth
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      // ✅ Add AI response
      const aiMessage = {
        role: "ai",
        text: data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("API Error:", error);
    }

    setQuestion(""); // clear input
    setLoading(false); // stop loader
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* =========================================================
          🔝 HEADER
      ========================================================= */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 text-xl font-bold text-center shadow">
        ⚖️ NyayaAI Legal Assistant
      </div>

      {/* =========================================================
          💬 CHAT AREA
      ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 🔁 Render all messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user"
              ? "justify-end"   // user on right
              : "justify-start" // AI on left
              }`}
          >
            <div
              className={`relative px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow ${msg.role === "user"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-800"
                }`}
            >
              {/* =========================================================
                  📋 Copy Button (AI only)
              ========================================================= */}
              {msg.role === "ai" && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.text)}
                  className="absolute top-1 right-2 text-xs text-gray-400 hover:text-black"
                >
                  Copy
                </button>
              )}

              {/* =========================================================
                  ✨ AI Message Rendering
                  - Latest message → typing animation
                  - Old messages → normal markdown
              ========================================================= */}
              {msg.role === "ai" && i === messages.length - 1 ? (
                <TypingText text={msg.text} />
              ) : msg.role === "ai" ? (
                <div className="bg-gray-50 border-l-4 border-black p-3 rounded">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {/* =========================================================
            ⏳ AI Typing Loader (Animated dots)
        ========================================================= */}
        {loading && (
          <div className="flex items-center gap-1 text-gray-500 text-lg">
            <span className="animate-bounce">•</span>
            <span className="animate-bounce delay-100">•</span>
            <span className="animate-bounce delay-200">•</span>
          </div>
        )}

        {/* 🔽 Auto-scroll anchor */}
        <div ref={chatEndRef}></div>
      </div>

      {/* =========================================================
          ✏️ INPUT AREA
      ========================================================= */}
      <div className="p-3 bg-white flex items-center gap-2 border-t shadow">

        {/* 🔤 Input Box */}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your legal question..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-black"

          // ✅ Enter → send
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />

        {/* 🚀 Send Button */}
        <button
          onClick={handleAsk}
          disabled={!question.trim()} // disable empty
          className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
        >
          Send
        </button>

        {/* 🔓 Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.reload();
          }}
          className="text-red-500 text-sm ml-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;