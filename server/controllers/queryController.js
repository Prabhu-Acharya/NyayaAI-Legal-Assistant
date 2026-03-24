// 📦 Import Groq SDK (AI service)
const Groq = require("groq-sdk");

// 🔐 Initialize Groq with API key from .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🧠 Controller function: handle user query
const askQuery = async (req, res) => {
  try {
    // 📥 Get question from frontend
    const { question } = req.body;

    // ❌ Validation: if question is empty
    if (!question) {
      return res.status(400).json({
        message: "Question is required ❌"
      });
    }

    // 🤖 Send request to Groq AI
    const response = await groq.chat.completions.create({

      // 💬 Conversation messages (AI + user)
      messages: [
        {
          role: "system",

          // 🧠 SYSTEM PROMPT (controls AI behavior)
          content: `
You are an Indian legal assistant.

# 📌 RULES:
- Answer in simple Hinglish (easy to understand)
- Keep answers short and practical
- Avoid complex legal jargon

# 🧾 FIR / COMPLAINT QUESTIONS:
If user asks about FIR, police complaint, cyber fraud:
- Answer in STEP-BY-STEP format
- Use:
  Step 1:
  Step 2:
  Step 3:
- Give practical real-world guidance

# 🧠 CASE SUMMARY:
If user pastes long legal text or judgment:
- Summarize in short points
- Highlight key facts and decision

# 💬 NORMAL QUESTIONS:
- Answer normally in simple language

# 🎯 GOAL:
Make Indian legal knowledge easy for common people
`
        },
        {
          role: "user",   // 👤 User message
          content: question
        }
      ],

      // 🔥 Latest working model (Groq)
      model: "llama-3.3-70b-versatile"
    });

    // 📤 Extract AI response
    const answer = response.choices[0].message.content;

    // ✅ Send response back to frontend
    res.status(200).json({
      message: "AI Answer generated ✅",
      answer
    });

  } catch (error) {
    // ❌ Error handling
    console.error("AI Error:", error);

    res.status(500).json({
      message: "AI Error ❌",
      error: error.message
    });
  }
};

// 📤 Export controller (for routes)
module.exports = { askQuery };