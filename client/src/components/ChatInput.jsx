import { useMicInput } from "../hooks/useMicInput";

const ChatInput = ({ question, setQuestion, onSend, loading }) => {
  const { listening, toggle: toggleMic } = useMicInput((transcript, isFinal) => {
    setQuestion(transcript);
  });

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div className="p-3 bg-white flex items-center gap-2 border-t shadow">
        <button
          onClick={toggleMic}
          title={listening ? "Stop recording" : "Voice input (Hindi/English)"}
          style={{
            width: "40px", height: "40px", borderRadius: "50%",
            border: "none", cursor: "pointer", flexShrink: 0,
            background: listening ? "#E24B4A" : "#f3f4f6",
            color: listening ? "#fff" : "#374151",
            fontSize: "18px", transition: "all 0.2s",
            animation: listening ? "pulse 1s infinite" : "none",
          }}
        >
          🎤
        </button>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          placeholder={listening ? "🎤 Listening… speak now" : "Ask your legal question..."}
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          style={{ borderColor: listening ? "#E24B4A" : undefined }}
        />
        <button
          onClick={onSend}
          disabled={!question.trim() || loading}
          className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </>
  );
};

export default ChatInput;