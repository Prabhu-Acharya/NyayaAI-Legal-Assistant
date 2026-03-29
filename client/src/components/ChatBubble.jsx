import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingText from "./TypingText";

const ChatBubble = ({ msg, isLast }) => {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow ${
          isUser ? "bg-green-500 text-white" : "bg-white text-gray-800"
        }`}
      >
        {/* Copy button for AI */}
        {!isUser && (
          <button
            onClick={() => navigator.clipboard.writeText(msg.text)}
            className="absolute top-1 right-2 text-xs text-gray-400 hover:text-black"
          >
            Copy
          </button>
        )}

        {/* AI Message */}
        {!isUser ? (
          isLast ? (
            <TypingText text={msg.text} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.text}
            </ReactMarkdown>
          )
        ) : (
          <p>{msg.text}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;