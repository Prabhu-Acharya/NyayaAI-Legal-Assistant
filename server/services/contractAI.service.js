// ─────────────────────────────────────────────────────────────────────────────
// contractAI.service.js
// Responsibilities:
//   • Groq AI contract text generation
//   • PDF export stream
//   • DOCX buffer generation
// ─────────────────────────────────────────────────────────────────────────────

const Groq = require("groq-sdk");
const PDFDocument = require("pdfkit");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} = require("docx");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const fs = require("fs");
const path = require("path");
const https = require("https");
const BNS_MAP = require("../data/bns-map.json");

const FONT_PATH = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");
const FONT_URL = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf";

async function ensureFont() {
  if (fs.existsSync(FONT_PATH)) return;
  fs.mkdirSync(path.dirname(FONT_PATH), { recursive: true });
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(FONT_PATH);
    https.get(FONT_URL, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

// ── Contract type display names ───────────────────────────────────────────────
const CONTRACT_TEMPLATES = {
  employment: "Employment Agreement",
  service: "Service Agreement",
  nda: "Non-Disclosure Agreement",
  rental: "Rental / Lease Agreement",
  sale: "Sale of Goods Agreement",
  partnership: "Partnership Agreement",
  freelance: "Freelance / Consulting Agreement",
  loan: "Loan Agreement",
};

// Add after CONTRACT_TEMPLATES object:
const LANGUAGE_INSTRUCTIONS = {
  english: "Draft the entire contract in formal English.",
  hindi: "सम्पूर्ण अनुबंध औपचारिक हिंदी में लिखें। कानूनी शब्दावली हिंदी में रखें। धाराओं के नंबर अंग्रेजी अंकों में रखें (1., 1.1 आदि)।",
  marathi: "संपूर्ण करार औपचारिक मराठीत लिहा. कायदेशीर शब्दावली मराठीत वापरा. कलम क्रमांक इंग्रजी अंकांत ठेवा.",
  tamil: "ஒப்பந்தம் முழுவதையும் முறையான தமிழில் எழுதுங்கள். சட்ட வார்த்தைகளை தமிழில் பயன்படுத்துங்கள். பிரிவு எண்கள் ஆங்கில இலக்கங்களில் வைக்கவும்.",
  telugu: "మొత్తం ఒప్పందాన్ని అధికారిక తెలుగులో రాయండి. చట్టపరమైన పదజాలం తెలుగులో ఉపయోగించండి. విభాగ సంఖ్యలు ఆంగ్ల అంకెలలో ఉంచండి.",
  bengali: "সম্পূর্ণ চুক্তি আনুষ্ঠানিক বাংলায় লিখুন। আইনি পরিভাষা বাংলায় ব্যবহার করুন। ধারা সংখ্যা ইংরেজি সংখ্যায় রাখুন।",
  gujarati: "સંપૂર્ણ કરાર ઔપચારિક ગુજરાતીમાં લખો. કાનૂની શબ્દાવલી ગુજરાતીમાં વાપરો. કલમ નંબર અંગ્રેજી અંકોમાં રાખો.",
  kannada: "ಸಂಪೂರ್ಣ ಒಪ್ಪಂದವನ್ನು ಔಪಚಾರಿಕ ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ. ಕಾನೂನು ಪರಿಭಾಷೆ ಕನ್ನಡದಲ್ಲಿ ಬಳಸಿ. ವಿಭಾಗ ಸಂಖ್ಯೆಗಳನ್ನು ಇಂಗ್ಲಿಷ್ ಅಂಕಿಗಳಲ್ಲಿ ಇರಿಸಿ.",
};

// ── Input sanitiser — strips prompt injection attempts ────────────────────
function sanitizeFormData(formData) {
  const MAX_FIELD_LENGTH = 500;
  const DANGEROUS_CHARS = /[`<>{}\\]/g;

  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value !== "string") continue;
    sanitized[key] = value
      .replace(DANGEROUS_CHARS, "")   // strip injection chars
      .slice(0, MAX_FIELD_LENGTH)      // cap field length
      .trim();
  }
  return sanitized;
}

// ── BNS/IPC citation injector ─────────────────────────────────────────────────
function getRelevantCitations(type, formData) {
  const citations = BNS_MAP[type] || [];
  const haystack = JSON.stringify(formData).toLowerCase();

  // Score each citation by how many triggers match formData
  const scored = citations.map((c) => ({
    ...c,
    score: c.trigger.filter((t) => haystack.includes(t.toLowerCase())).length,
  }));

  // Sort by score desc — always return all, top 3 flagged for prompt injection
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function buildCitationBlock(citations) {
  return citations
    .map((c) => `  • ${c.section} — ${c.topic}`)
    .join("\n");
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(type, formData, language = "english") {
  const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.english;
  const citations = getRelevantCitations(type, formData);
  const top3 = citations.slice(0, 3);
  const allCitations = buildCitationBlock(citations);

  return `You are an expert Indian corporate lawyer. Draft a comprehensive, legally sound ${CONTRACT_TEMPLATES[type]} that is fully compliant with Indian law (Indian Contract Act 1872, and all applicable statutes).

LANGUAGE INSTRUCTION: ${langInstruction}

Contract Details:
${JSON.stringify(formData, null, 2)}

RELEVANT STATUTES — weave these citations naturally into the appropriate clauses:
${buildCitationBlock(top3)}

REQUIREMENTS:
1. Use formal legal language appropriate for Indian courts.
2. Include all standard clauses for this contract type.
3. Add Indian-law-specific clauses: governing law as India, jurisdiction clause, stamp duty notice, dispute resolution via Indian Arbitration and Conciliation Act 1996.
4. Format with clearly numbered sections and sub-sections.
5. Include: parties section, recitals, definitions, operative clauses, representations & warranties, indemnification, termination, force majeure, governing law, dispute resolution, signature block.
6. Add boilerplate: entire agreement clause, severability, waiver, notices.
7. Do NOT include markdown — plain text only with numbered sections like "1.", "1.1", etc.
8. Add "IN WITNESS WHEREOF" signature block at the end.
9. Flag any blanks that need to be filled with [PLACEHOLDER] notation.
10. Do NOT translate party names, monetary amounts, or dates — keep as provided.
11. End the contract with an "APPLICABLE STATUTES" section listing all relevant laws.

APPLICABLE STATUTES TO INCLUDE AT END:
${allCitations}

Return ONLY the contract text, no commentary.`;
}
// ── Groq AI generation ────────────────────────────────────────────────────────
async function generateContractText(type, formData, language = "english") {
  const clean = sanitizeFormData(formData);
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: buildPrompt(type, clean, language) }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const contractText = completion.choices[0]?.message?.content?.trim();
  if (!contractText) throw new Error("No content returned from Groq.");
  return contractText;
}

// ── Shared filename sanitiser ─────────────────────────────────────────────────
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9 _\-]/gi, "_").replace(/\s+/g, "_");
}

// ── PDF export — pipes directly to res ───────────────────────────────────────
async function streamContractPDF(contract, res) {
  const isLatin = !contract.language || contract.language === "english";

  const doc = new PDFDocument({ margin: 72, size: "A4", bufferPages: true });

  const bodyFont = isLatin ? "Helvetica" : "NotoSans";
  const boldFont = isLatin ? "Helvetica-Bold" : "NotoSans";

  if (!isLatin && fs.existsSync(FONT_PATH)) {
    doc.registerFont("NotoSans", FONT_PATH);
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition",
    `attachment; filename="${sanitizeFilename(contract.title)}.pdf"`);
  doc.pipe(res);

  // Header
  doc.font(boldFont).fontSize(18).fillColor("#1a1a2e")
    .text("NyayaAI — Legal Document", { align: "center" });
  doc.moveDown(0.3);
  doc.font(boldFont).fontSize(14).fillColor("#16213e")
    .text(contract.title, { align: "center" });
  doc.moveDown(0.3);
  doc.font(bodyFont).fontSize(9).fillColor("#666")
    .text(
      `Generated: ${contract.createdAt.toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })}  |  Governed by Indian Law`,
      { align: "center" }
    );
  doc.moveDown(0.5);
  doc.moveTo(72, doc.y).lineTo(523, doc.y).strokeColor("#c9a84c").lineWidth(1).stroke();
  doc.moveDown(1);

  // Body
  doc.font(bodyFont).fontSize(10).fillColor("#111");
  contract.content.split("\n").forEach((line) => {
    const t = line.trim();
    if (!t) { doc.moveDown(0.4); return; }

    if (/^\d+\.\s/.test(t) && !/^\d+\.\d+/.test(t)) {
      doc.moveDown(0.5)
        .font(boldFont).fontSize(11).fillColor("#1a1a2e")
        .text(t, { paragraphGap: 4 });
      doc.font(bodyFont).fontSize(10).fillColor("#111");
    } else if (/^\d+\.\d+/.test(t)) {
      doc.font(bodyFont).fontSize(10).fillColor("#333")
        .text(t, { indent: 20, paragraphGap: 3 });
    } else {
      doc.font(bodyFont).fontSize(10).fillColor("#111")
        .text(t, { paragraphGap: 3 });
    }
  });

  // Footer
  doc.flushPages();
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.font(bodyFont).fontSize(8).fillColor("#999")
      .text(
        `NyayaAI — Page ${i + 1} | AI-generated. Review with a qualified advocate before execution.`,
        72, doc.page.height - 40,
        { align: "center", width: doc.page.width - 144 }
      );
  }

  doc.end();
}
// ── DOCX export — returns a Buffer ───────────────────────────────────────────
async function buildContractDOCX(contract) {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "NyayaAI — Legal Document", bold: true, size: 36, color: "1a1a2e" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: contract.title, bold: true, size: 28, color: "16213e" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Generated: ${contract.createdAt.toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
          })}  |  Governed by Indian Law`,
          size: 18, color: "777777", italics: true,
        }),
      ],
    }),
  ];

  contract.content.split("\n").forEach((line) => {
    const t = line.trim();
    if (!t) {
      children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
      return;
    }
    if (/^\d+\.\s/.test(t) && !/^\d+\.\d+/.test(t)) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 160 },
        children: [new TextRun({ text: t, bold: true, size: 22, color: "1a1a2e" })],
      }));
    } else if (/^\d+\.\d+/.test(t)) {
      children.push(new Paragraph({
        indent: { left: 360 },
        spacing: { after: 120 },
        children: [new TextRun({ text: t, size: 20, color: "222222" })],
      }));
    } else {
      children.push(new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: t, size: 20 })],
      }));
    }
  });

  children.push(
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "AI-generated by NyayaAI. Please review with a qualified advocate before execution.",
          size: 16, color: "999999", italics: true,
        }),
      ],
    })
  );

  const wordDoc = new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 20 } } },
      paragraphStyles: [{
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal",
        run: { size: 22, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(wordDoc);
}

// ── Contract strength scorer ──────────────────────────────────────────────────
async function scoreContract(contractText) {
  const prompt = `You are an expert Indian contract law reviewer. Score this contract on 5 axes.

Each axis scored 0–20 where 20 = perfect, 0 = critically deficient.

AXES:
1. Enforceability (0-20): Valid consideration, identified parties, lawful object, free consent per ICA 1872
2. Clarity (0-20): Defined terms, unambiguous language, no contradictions
3. Balance (0-20): Fair obligations on both sides, no grossly one-sided penalties
4. Completeness (0-20): All standard clauses present — termination, force majeure, dispute resolution, notices
5. Compliance (0-20): Indian law citations, governing law, jurisdiction, stamp duty notice, arbitration clause

CONTRACT TEXT:
${contractText.slice(0, 6000)}

Respond ONLY with valid JSON — no commentary, no markdown:
{
  "enforceability": <0-20>,
  "clarity": <0-20>,
  "balance": <0-20>,
  "completeness": <0-20>,
  "compliance": <0-20>,
  "summary": "<one sentence — biggest strength or weakness>"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 256,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  const clean = raw.replace(/```json|```/g, "").trim();
  const axes = JSON.parse(clean);

  const total = axes.enforceability + axes.clarity + axes.balance
    + axes.completeness + axes.compliance;

  return { total, ...axes };
}

module.exports = {
  CONTRACT_TEMPLATES,
  generateContractText,
  scoreContract, 
  streamContractPDF,
  buildContractDOCX,
  sanitizeFilename,
  sanitizeFormData,
};