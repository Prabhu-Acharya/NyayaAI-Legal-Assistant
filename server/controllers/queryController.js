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
          content: `
You are NyayaAI, a professional legal assistant.

🔹 Language Rules:
1. Default: English
2. If user uses Hindi → reply in Hindi
3. If user uses Hinglish → reply in Hinglish

🔹 Output Rules:
- Always structured
- Use simple, clear language
- No unnecessary emojis
- Highlight important legal terms using **bold**

🔹 STRICT FORMAT:

📜 Section / Law:
(mention relevant law or concept)

⚖️ Explanation:
(clear explanation in 2–4 points)

🧾 Punishment / Outcome:
(if applicable, in bullet points)

📌 Example:
(real-life simple example)

🔹 Extra Rules:
- Use bullet points (-)
- Keep answer concise but informative
- Never return unstructured text
- Always follow the format strictly

Always respond properly.
`
        },
        {
          role: "user",
          content: question
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });
    console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));
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