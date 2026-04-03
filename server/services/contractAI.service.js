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

// ── Contract type display names ───────────────────────────────────────────────
const CONTRACT_TEMPLATES = {
  employment:  "Employment Agreement",
  service:     "Service Agreement",
  nda:         "Non-Disclosure Agreement",
  rental:      "Rental / Lease Agreement",
  sale:        "Sale of Goods Agreement",
  partnership: "Partnership Agreement",
  freelance:   "Freelance / Consulting Agreement",
  loan:        "Loan Agreement",
};

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildPrompt(type, formData) {
  return `You are an expert Indian corporate lawyer. Draft a comprehensive, legally sound ${CONTRACT_TEMPLATES[type]} that is fully compliant with Indian law (Indian Contract Act 1872, and all applicable statutes).

Contract Details:
${JSON.stringify(formData, null, 2)}

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

Return ONLY the contract text, no commentary.`;
}

// ── Groq AI generation ────────────────────────────────────────────────────────
async function generateContractText(type, formData) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: buildPrompt(type, formData) }],
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
function streamContractPDF(contract, res) {
  // bufferPages: true is REQUIRED to use switchToPage() and bufferedPageRange()
  const doc = new PDFDocument({ margin: 72, size: "A4", bufferPages: true });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sanitizeFilename(contract.title)}.pdf"`
  );
  doc.pipe(res);

  // ── Header block
  doc
    .font("Helvetica-Bold").fontSize(18).fillColor("#1a1a2e")
    .text("NyayaAI — Legal Document", { align: "center" });
  doc.moveDown(0.3);
  doc
    .font("Helvetica-Bold").fontSize(14).fillColor("#16213e")
    .text(contract.title, { align: "center" });
  doc.moveDown(0.3);
  doc
    .font("Helvetica").fontSize(9).fillColor("#666")
    .text(
      `Generated: ${contract.createdAt.toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })}  |  Governed by Indian Law`,
      { align: "center" }
    );
  doc.moveDown(0.5);
  doc.moveTo(72, doc.y).lineTo(523, doc.y).strokeColor("#c9a84c").lineWidth(1).stroke();
  doc.moveDown(1);

  // ── Body
  doc.font("Helvetica").fontSize(10).fillColor("#111");
  contract.content.split("\n").forEach((line) => {
    const t = line.trim();
    if (!t) { doc.moveDown(0.4); return; }

    if (/^\d+\.\s/.test(t) && !/^\d+\.\d+/.test(t)) {
      doc.moveDown(0.5)
        .font("Helvetica-Bold").fontSize(11).fillColor("#1a1a2e")
        .text(t, { paragraphGap: 4 });
      doc.font("Helvetica").fontSize(10).fillColor("#111");
    } else if (/^\d+\.\d+/.test(t)) {
      doc.font("Helvetica").fontSize(10).fillColor("#333")
        .text(t, { indent: 20, paragraphGap: 3 });
    } else {
      doc.font("Helvetica").fontSize(10).fillColor("#111")
        .text(t, { paragraphGap: 3 });
    }
  });

  // ── Per-page footer
  // flushPages() moves all pages into the buffer so switchToPage() works
  doc.flushPages();
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(8).fillColor("#999")
      .text(
        `NyayaAI — Page ${i + 1} | AI-generated. Review with a qualified advocate before execution.`,
        72,
        doc.page.height - 40,
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

module.exports = {
  CONTRACT_TEMPLATES,
  generateContractText,
  streamContractPDF,
  buildContractDOCX,
  sanitizeFilename,
};