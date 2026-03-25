import { useState } from "react";
import { askQuestion } from "../services/api";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // user message
    const userMsg = { text: input, sender: "user" };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await askQuestion(input);

      console.log("API RESPONSE:", res.data); // 🔍 debug

      const botMsg = {
        text: res.data.answer || "No response",
        sender: "bot"
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        { text: "Server error ❌", sender: "bot" }
      ]);
    }

    setInput("");
  };

  return (
    <div className="p-4">
      <div className="h-[400px] overflow-y-auto border p-3 mb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span className="bg-gray-200 px-3 py-1 rounded">
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="border p-2 w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your legal question..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4">
          Ask
        </button>
      </div>
    </div>
  );
};

export default ChatBox;