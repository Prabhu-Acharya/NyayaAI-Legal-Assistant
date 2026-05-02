import { useState, useRef, useEffect } from "react";
import ChatBubble from "../components/ChatBubble";
import ChatSidebar from "../components/ChatSidebar";
import ChatInput from "../components/ChatInput";
import Loader from "../components/Loader";
import API from "../services/api";
import { useChatSession } from "../hooks/useChatSession";

const Dashboard = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef(null);

  const {
    sessionId, setSessionId,
    sessions, setSessions,
    sessionsLoading,
    messages, setMessages,
    fetchSessions, loadSession, createSession, deleteSession,
  } = useChatSession();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { fetchSessions(); }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;

    let sid = sessionId;
    if (!sid) {
      try { sid = await createSession(); }
      catch { return; }
    }

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);
    setQuestion("");

    try {
      // single call — saves msg, runs RAG, calls Groq, returns reply+citations+cases
      const { data } = await API.post(`/api/chat/${sid}/message`, {
        role: "user",
        text: question,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "No response.",
          citations: data.citations || [],
          cases: data.cases || [],
        },
      ]);

      fetchSessions();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Server error ❌ Please try again.", citations: [], cases: [] },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-full flex">
      {sidebarOpen && (
        <ChatSidebar
          sessions={sessions}
          sessionsLoading={sessionsLoading}
          sessionId={sessionId}
          onNew={createSession}
          onLoad={loadSession}
          onDelete={deleteSession}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col bg-gray-100" style={{ minWidth: 0 }}>
        <div style={{
          padding: "10px 16px", background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{
              padding: "6px 10px", borderRadius: "8px",
              background: "#f3f4f6", border: "none",
              cursor: "pointer", fontSize: "13px", color: "#374151",
            }}>
              → History
            </button>
          )}
          <span style={{ fontSize: "14px", color: "#6b7280", fontFamily: "sans-serif" }}>
            ⚖️ NyayaAI Legal Assistant
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚖️</div>
              <p style={{ fontSize: "16px", marginBottom: "6px", color: "#6b7280" }}>Ask any legal question</p>
              <p style={{ fontSize: "13px" }}>Indian law · Contracts · Rights · Compliance</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} isLast={i === messages.length - 1} />
          ))}
          {loading && <Loader />}
          <div ref={chatEndRef} />
        </div>

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSend={handleAsk}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;