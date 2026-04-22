// server/services/documentAI.service.js
const Groq = require("groq-sdk");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const mammoth = require("mammoth");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Text Extraction ──────────────────────────────────────────────────────────
async function extractText(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  }

  const { value } = await mammoth.extractRawText({ buffer });
  return value?.trim() || "";
}

// ─── Groq Analysis ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are NyayaAI — an expert Indian legal document analyst.
Analyse the provided legal document text and respond ONLY with valid JSON matching this schema exactly:

{
  "summary": "2-3 sentence overview of the document",
  "keyFindings": ["finding1", "finding2", ...],
  "riskFlags": ["risk1", "risk2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "riskScore": 42,
  "riskRationale": "One sentence explaining score"
}

Risk score guide: 0-24 low, 25-49 medium, 50-74 high, 75-100 critical.
Focus on Indian law context: IPC, CPC, Contract Act 1872, Consumer Protection Act, labour laws.
Return ONLY the JSON object. No markdown, no preamble.`;

async function analyseDocument(extractedText) {
  const truncated = extractedText.slice(0, 12000);

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyse this legal document:\n\n${truncated}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "";

  let parsed;
  try {
    const clean = raw.replace(/```json|```/gi, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Groq returned non-JSON: ${raw.slice(0, 200)}`);
  }

  return {
    summary:         parsed.summary         || "",
    keyFindings:     parsed.keyFindings      || [],
    riskFlags:       parsed.riskFlags        || [],
    recommendations: parsed.recommendations  || [],
    riskScore:       Number(parsed.riskScore) || 0,
    riskRationale:   parsed.riskRationale    || "",
    rawResponse:     raw,
  };
}

module.exports = { extractText, analyseDocument };