// 📦 Import Groq SDK (AI service)
const Groq = require("groq-sdk");

// 🔐 Initialize Groq with API key from .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const askQuery = async (req, res) => {
  try {
    console.log("API HIT 🔥");

    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required ❌"
      });
    }

    console.log("Question:", question);

    // 🧠 Detect long text
    const isLongText = question.length > 200;

    // 🤖 AI CALL
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: isLongText
            ? `Summarize the legal text in simple Hinglish in 4 points`
            : `Answer legal questions in simple Hinglish`
        },
        {
          role: "user",
          content: question
        }
      ],
      model: "llama-3.3-70b-versatile"
    });
    console.log("AI MESSAGE:", response.choices[0].message);
    console.log("AI RESPONSE:", response);

    const answer =
      response &&
        response.choices &&
        response.choices[0] &&
        response.choices[0].message &&
        response.choices[0].message.content
        ? response.choices[0].message.content
        : "No response from AI";

    res.status(200).json({
      message: "AI Answer generated ✅",
      answer
    });

  } catch (error) {
    console.error("🔥 AI ERROR:", error);

    res.status(500).json({
      message: "AI Error ❌",
      error: error.message
    });
  }
};

module.exports = { askQuery };