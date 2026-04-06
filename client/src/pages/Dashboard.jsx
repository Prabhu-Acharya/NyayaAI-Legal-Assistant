import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);

  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/query/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || "No response from AI" },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Server error ❌ Please try again." },
      ]);
    }

    setQuestion("");
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            isLast={i === messages.length - 1}
          />
        ))}
        {loading && <Loader />}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input area */}
      <div className="p-3 bg-white flex items-center gap-2 border-t shadow">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAsk(); }}
          placeholder="Ask your legal question..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim()}
          className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default Dashboard;