// server/services/documentAI.service.js
import Groq from "groq-sdk";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Text Extraction ──────────────────────────────────────────────────────────

export async function extractText(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text?.trim() || "";
  }

  // DOCX / DOC
  const { value } = await mammoth.extractRawText({ buffer });
  return value?.trim() || "";
}

// ─── Groq Analysis ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are NyayaAI — an expert Indian legal document analyst.
Analyse the provided legal document text and respond ONLY with valid JSON matching this schema exactly:

{
  "summary": "2-3 sentence overview of the document",
  "keyFindings": ["finding1", "finding2", ...],       // 3-6 items
  "riskFlags": ["risk1", "risk2", ...],               // 0-8 items, concrete legal risks
  "recommendations": ["rec1", "rec2", ...],           // 2-5 actionable items
  "riskScore": 42,                                    // integer 0-100
  "riskRationale": "One sentence explaining score"
}

Risk score guide: 0-24 low, 25-49 medium, 50-74 high, 75-100 critical.
Focus on Indian law context: IPC, CPC, Contract Act 1872, Consumer Protection Act, labour laws.
Return ONLY the JSON object. No markdown, no preamble.`;

export async function analyseDocument(extractedText) {
  const truncated = extractedText.slice(0, 12000); // ~3k tokens, stay under limit

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyse this legal document:\n\n${truncated}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "";

  let parsed;
  try {
    // strip possible accidental backtick fences
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