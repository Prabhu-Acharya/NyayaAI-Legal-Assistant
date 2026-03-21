// 🧠 Controller for handling legal queries

// 🟢 FUNCTION: handle user query
const askQuery = async (req, res) => {
  try {
    // 📥 frontend se question aa raha hai
    const { question } = req.body;

    // ❌ agar question empty hai
    if (!question) {
      return res.status(400).json({
        message: "Question is required ❌"
      });
    }

    // 🧠 ABHI HUM STATIC RESPONSE DE RAHE HAIN (AI baad me add karenge)
    const answer = `You asked: "${question}".
    
Under Indian law, you can take legal action by filing a complaint or consulting a lawyer.`;

    // ✅ response bhej rahe hain
    res.status(200).json({
      message: "Answer generated ✅",
      answer
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error
    });
  }
};

module.exports = { askQuery };