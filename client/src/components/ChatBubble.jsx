import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingText from "./TypingText";
import CitationCards from "./CitationCards";

const ChatBubble = ({ msg, isLast }) => {
  const isUser = msg.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`relative px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow ${
          isUser ? "bg-green-500 text-white" : "bg-white text-gray-800"
        }`}
      >
        {!isUser && (
          <button
            onClick={() => navigator.clipboard.writeText(msg.text)}
            className="absolute top-1 right-2 text-xs text-gray-400 hover:text-black"
          >
            Copy
          </button>
        )}

        {!isUser ? (
          isLast ? (
            <TypingText text={msg.text} />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          )
        ) : (
          <p>{msg.text}</p>
        )}
      </div>

      {/* Citation cards — AI only, when citations/cases exist */}
      {!isUser && (msg.citations?.length > 0 || msg.cases?.length > 0) && (
        <div className="max-w-[75%] w-full mt-1">
          <CitationCards citations={msg.citations || []} cases={msg.cases || []} />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;