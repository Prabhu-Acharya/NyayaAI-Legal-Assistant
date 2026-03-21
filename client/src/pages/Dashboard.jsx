import React, { useState } from "react";

function Dashboard() {
  // 🧠 question + answer store karenge
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // 🔐 token localStorage se
  const token = localStorage.getItem("token");

  // 🧠 function to send query
  const handleAsk = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔥 IMPORTANT
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      console.log(data);

      // ❌ error handle
      if (!res.ok) {
        alert(data.message);
        return;
      }

      // ✅ answer set
      setAnswer(data.answer);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Dashboard ⚖️</h2>

      {/* 📝 input for question */}
      <input
        placeholder="Ask your legal question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <br /><br />

      {/* 🔘 button */}
      <button onClick={handleAsk}>Ask</button>

      <br /><br />

      {/* 📤 show answer */}
      {answer && (
        <div>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;