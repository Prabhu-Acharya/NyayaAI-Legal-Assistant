import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import Loader from "../components/Loader";
import API from "../services/api";

const Dashboard = () => {
  const [question,        setQuestion]        = useState("");
  const [messages,        setMessages]        = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [sessionId,       setSessionId]       = useState(null);
  const [sessions,        setSessions]        = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarOpen,     setSidebarOpen]     = useState(true);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await API.get("/api/chat");
      setSessions(data);
    } catch {
      setSessions([]);
    }
    setSessionsLoading(false);
  };

  const loadSession = async (id) => {
    try {
      const { data } = await API.get(`/api/chat/${id}`);
      setSessionId(data._id);
      setMessages(data.messages.map((m) => ({ role: m.role, text: m.text })));
    } catch {
      console.error("Failed to load session.");
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await API.post("/api/chat", {});
      setSessionId(data._id);
      setMessages([]);
      setSessions((prev) => [data, ...prev]);
    } catch {
      console.error("Failed to create session.");
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/api/chat/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
      }
    } catch {
      console.error("Failed to delete session.");
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const { data } = await API.post("/api/chat", {});
        currentSessionId = data._id;
        setSessionId(data._id);
        setSessions((prev) => [data, ...prev]);
      } catch {
        console.error("Failed to create session.");
        return;
      }
    }

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setQuestion("");

    // Save user message to DB
    try {
      await API.post(`/api/chat/${currentSessionId}/message`, {
        role: "user",
        text: question,
      });
    } catch {
      console.error("Failed to save user message.");
    }

    // Call AI
    try {
      const { data } = await API.post("/api/query/ask", { question });
      const aiText = data.answer || "No response from AI";
      const aiMessage = { role: "ai", text: aiText };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to DB
      await API.post(`/api/chat/${currentSessionId}/message`, {
        role: "ai",
        text: aiText,
      });

      fetchSessions();
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Server error ❌ Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-full flex">

      {/* ── Chat History Sidebar ── */}
      {sidebarOpen && (
        <div style={{
          width: "240px",
          background: "#111827",
          borderRight: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "12px",
            borderBottom: "1px solid #1f2937",
            display: "flex",
            gap: "8px",
          }}>
            <button
              onClick={handleNewChat}
              style={{
                flex: 1, padding: "8px", borderRadius: "8px",
                background: "#c9a84c", color: "#000",
                border: "none", fontWeight: "600",
                fontSize: "13px", cursor: "pointer",
              }}
            >
              + New Chat
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                padding: "8px 10px", borderRadius: "8px",
                background: "#1f2937", color: "#9ca3af",
                border: "none", cursor: "pointer", fontSize: "13px",
              }}
            >
              ←
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {sessionsLoading ? (
              <div style={{ color: "#6b7280", fontSize: "12px", padding: "12px", textAlign: "center" }}>
                Loading…
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: "12px", padding: "12px", textAlign: "center" }}>
                No chats yet
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => loadSession(s._id)}
                  style={{
                    padding: "10px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginBottom: "2px",
                    background: sessionId === s._id ? "#1f2937" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "6px",
                  }}
                >
                  <span style={{
                    fontSize: "13px", color: "#d1d5db",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", flex: 1,
                  }}>
                    💬 {s.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(e, s._id)}
                    style={{
                      background: "none", border: "none",
                      color: "#6b7280", cursor: "pointer",
                      fontSize: "12px", padding: "2px 4px",
                      borderRadius: "4px", flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col bg-gray-100" style={{ minWidth: 0 }}>

        <div style={{
          padding: "10px 16px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: "6px 10px", borderRadius: "8px",
                background: "#f3f4f6", border: "none",
                cursor: "pointer", fontSize: "13px", color: "#374151",
              }}
            >
              → History
            </button>
          )}
          <span style={{ fontSize: "14px", color: "#6b7280", fontFamily: "sans-serif" }}>
            ⚖️ NyayaAI Legal Assistant
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div style={{
              textAlign: "center", padding: "60px 0",
              color: "#9ca3af", fontFamily: "sans-serif",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚖️</div>
              <p style={{ fontSize: "16px", marginBottom: "6px", color: "#6b7280" }}>
                Ask any legal question
              </p>
              <p style={{ fontSize: "13px" }}>
                Indian law · Contracts · Rights · Compliance
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} isLast={i === messages.length - 1} />
          ))}
          {loading && <Loader />}
          <div ref={chatEndRef} />
        </div>

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
            disabled={!question.trim() || loading}
            className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;