import { useState } from "react";
import API from "../services/api";

export function useChatSession() {
  const [sessionId,       setSessionId]       = useState(null);
  const [sessions,        setSessions]        = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messages,        setMessages]        = useState([]);

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
      setMessages(data.messages.map((m) => ({ role: m.role, text: m.text, citations: [], cases: [] })));
    } catch {
      console.error("Failed to load session.");
    }
  };

  const createSession = async () => {
    const { data } = await API.post("/api/chat", {});
    setSessionId(data._id);
    setMessages([]);
    setSessions((prev) => [data, ...prev]);
    return data._id;
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/api/chat/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (sessionId === id) { setSessionId(null); setMessages([]); }
    } catch {
      console.error("Failed to delete session.");
    }
  };

  return {
    sessionId, setSessionId,
    sessions,  setSessions,
    sessionsLoading,
    messages,  setMessages,
    fetchSessions, loadSession, createSession, deleteSession,
  };
}