import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble"; // 💬 Chat UI component
import Loader from "../components/Loader"; // ⏳ Typing loader

const Dashboard = () => {
  // =========================================================
  // 🔹 STATE MANAGEMENT
  // =========================================================

  const [question, setQuestion] = useState(""); // user input
  const [messages, setMessages] = useState([]); // chat history
  const [loading, setLoading] = useState(false); // AI typing state

  const chatEndRef = useRef(null); // for auto-scroll

  // 🔐 JWT token (for protected API)
  const token = localStorage.getItem("token");

  // =========================================================
  // 🔽 AUTO SCROLL TO LATEST MESSAGE
  // Runs whenever messages or loading changes
  // =========================================================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // =========================================================
  // 🚀 HANDLE ASK FUNCTION
  // - Sends question to backend
  // - Adds user message
  // - Receives AI response
  // =========================================================
  const handleAsk = async () => {
    // ❌ Prevent empty input
    if (!question.trim()) return;

    // ✅ Add user message instantly
    const userMessage = {
      role: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true); // show typing loader

    try {
      // 🔗 API call to backend
      const res = await fetch("http://localhost:5000/api/query/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // JWT auth
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      // 🤖 AI response message
      const aiMessage = {
        role: "ai",
        text: data.answer || "No response from AI",
      };

      // ✅ Add AI response
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("API Error:", error);

      // ❌ Error fallback message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Server error ❌ Please try again.",
        },
      ]);
    }

    // 🧹 Clear input + stop loader
    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* =========================================================
          🔝 HEADER SECTION
      ========================================================= */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 text-xl font-bold text-center shadow">
        ⚖️ NyayaAI Legal Assistant
      </div>

      {/* =========================================================
          💬 CHAT AREA
      ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 🔁 Loop through messages */}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            isLast={i === messages.length - 1} // for typing effect
          />
        ))}

        {/* ⏳ Loader while AI is responding */}
        {loading && <Loader />}

        {/* 🔽 Auto-scroll anchor */}
        <div ref={chatEndRef}></div>
      </div>

      {/* =========================================================
          ✏️ INPUT AREA
      ========================================================= */}
      <div className="p-3 bg-white flex items-center gap-2 border-t shadow">

        {/* 🔤 Input box */}
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your legal question..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-black"

          // ⌨️ Press Enter to send
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />

        {/* 🚀 Send button */}
        <button
          onClick={handleAsk}
          disabled={!question.trim()} // disable empty input
          className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
        >
          Send
        </button>

        {/* 🔓 Logout button */}
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
};

export default Dashboard;