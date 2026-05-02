/**
 * server/middleware/ragMiddleware.js — CommonJS version
 */

const BNS_MAP = require("../data/bns-map.json");

const ALL_SECTIONS = Object.entries(BNS_MAP).flatMap(([contractType, entries]) =>
  entries.map((e) => ({ ...e, contractType }))
);

function scoreSection(section, queryLower) {
  let score = 0;
  for (const kw of section.trigger) {
    if (queryLower.includes(kw.toLowerCase())) score += 1;
  }
  if (queryLower.includes(section.topic.toLowerCase())) score += 2;
  return score;
}

function retrieveSections(query, contractType = null, topK = 5) {
  const queryLower = query.toLowerCase();
  let pool = ALL_SECTIONS;

  if (contractType && BNS_MAP[contractType]) {
    pool = ALL_SECTIONS.filter((s) => s.contractType === contractType);
  }

  const scored = pool
    .map((s) => ({ ...s, score: scoreSection(s, queryLower) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!scored.length && contractType && BNS_MAP[contractType]) {
    return BNS_MAP[contractType].slice(0, topK).map((s) => ({ ...s, contractType, score: 0 }));
  }

  return scored;
}

function buildRAGSystemPrompt(sections) {
  if (!sections.length) {
    return `You are NyayaAI, an expert Indian legal assistant. Answer accurately based on Indian law.`;
  }

  const context = sections
    .map((s, i) => `[${i + 1}] ${s.section}\n    Topic: ${s.topic}\n    Contract type: ${s.contractType}`)
    .join("\n\n");

  return `You are NyayaAI, an expert Indian legal assistant.

RELEVANT LEGAL SECTIONS (cite these in your answer):
${context}

INSTRUCTIONS:
- Cite section references above when relevant (e.g. "Under ${sections[0]?.section}...").
- Answer in the same language the user wrote in (Hindi or English).
- Be accurate, concise, and practical.
- Do NOT invent section numbers beyond what is listed above.
- If none apply, answer from general Indian legal knowledge and say so.`;
}

const ragMiddleware = async (req, res, next) => {
  try {
    const userMessage =
      req.body?.text ||
      req.body?.message ||
      (Array.isArray(req.body?.messages) ? req.body.messages.at(-1)?.content : "") ||
      "";

    const contractType = req.body?.contractType || null;
    const sections = retrieveSections(userMessage, contractType);

    req.ragContext = {
      sections,
      systemPrompt: buildRAGSystemPrompt(sections),
      citations: sections.map((s) => ({
        section:      s.section,
        topic:        s.topic,
        contractType: s.contractType,
        score:        s.score,
      })),
    };

    next();
  } catch (err) {
    console.error("RAG middleware error:", err.message);
    req.ragContext = { sections: [], systemPrompt: buildRAGSystemPrompt([]), citations: [] };
    next();
  }
};

module.exports = { ragMiddleware, buildRAGSystemPrompt };