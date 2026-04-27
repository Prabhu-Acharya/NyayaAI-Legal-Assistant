const ChatSidebar = ({ sessions, sessionsLoading, sessionId, onNew, onLoad, onDelete, onClose }) => (
  <div style={{
    width: "240px", background: "#111827",
    borderRight: "1px solid #1f2937",
    display: "flex", flexDirection: "column", flexShrink: 0,
  }}>
    <div style={{ padding: "12px", borderBottom: "1px solid #1f2937", display: "flex", gap: "8px" }}>
      <button onClick={onNew} style={{
        flex: 1, padding: "8px", borderRadius: "8px",
        background: "#c9a84c", color: "#000",
        border: "none", fontWeight: "600", fontSize: "13px", cursor: "pointer",
      }}>
        + New Chat
      </button>
      <button onClick={onClose} style={{
        padding: "8px 10px", borderRadius: "8px",
        background: "#1f2937", color: "#9ca3af",
        border: "none", cursor: "pointer", fontSize: "13px",
      }}>
        ←
      </button>
    </div>

    <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
      {sessionsLoading ? (
        <div style={{ color: "#6b7280", fontSize: "12px", padding: "12px", textAlign: "center" }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div style={{ color: "#6b7280", fontSize: "12px", padding: "12px", textAlign: "center" }}>No chats yet</div>
      ) : sessions.map((s) => (
        <div key={s._id} onClick={() => onLoad(s._id)} style={{
          padding: "10px", borderRadius: "8px", cursor: "pointer",
          marginBottom: "2px",
          background: sessionId === s._id ? "#1f2937" : "transparent",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "6px",
        }}>
          <span style={{
            fontSize: "13px", color: "#d1d5db",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", flex: 1,
          }}>
            💬 {s.title}
          </span>
          <button onClick={(e) => onDelete(e, s._id)} style={{
            background: "none", border: "none", color: "#6b7280",
            cursor: "pointer", fontSize: "12px",
            padding: "2px 4px", borderRadius: "4px", flexShrink: 0,
          }}>✕</button>
        </div>
      ))}
    </div>
  </div>
);

export default ChatSidebar;