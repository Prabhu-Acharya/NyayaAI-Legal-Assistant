/**
 * server/services/contractAI.week9.js
 * Week 9 additions — drop-in patch for contractAI.service.js
 *
 * HOW TO USE:
 *   In contractAI.service.js, add these 4 keys to CONTRACT_TEMPLATES,
 *   add the enum values to Contract.js, then require this file in
 *   contractController.js for polishClause.
 */

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── 4 new CONTRACT_TEMPLATES entries (merge into existing object) ─────────────
const NEW_CONTRACT_TYPES = {
  cofounder:      'Co-founder Agreement',
  terms:          'Terms & Conditions',
  privacy:        'Privacy Policy',
  legal_notice:   'Legal Notice',
};

// ── Form field definitions for ContractForm.jsx ──────────────────────────────
// Each key matches a CONTRACT_TYPES entry on the frontend.
const NEW_CONTRACT_FIELDS = {
  cofounder: [
    { name: 'founder1Name',    label: 'Founder 1 Name',          required: true },
    { name: 'founder2Name',    label: 'Founder 2 Name',          required: true },
    { name: 'companyName',     label: 'Company / Startup Name',  required: true },
    { name: 'equity1',         label: 'Founder 1 Equity %',      required: true },
    { name: 'equity2',         label: 'Founder 2 Equity %',      required: true },
    { name: 'vestingMonths',   label: 'Vesting Period (months)',  required: false },
    { name: 'roles',           label: 'Roles & Responsibilities', required: false },
    { name: 'disputeCity',     label: 'Dispute Resolution City', required: false },
  ],
  terms: [
    { name: 'companyName',     label: 'Company Name',            required: true },
    { name: 'websiteUrl',      label: 'Website / App URL',       required: true },
    { name: 'services',        label: 'Services Offered',        required: true },
    { name: 'refundPolicy',    label: 'Refund Policy',           required: false },
    { name: 'governingState',  label: 'Governing State (India)', required: false },
  ],
  privacy: [
    { name: 'companyName',     label: 'Company Name',            required: true },
    { name: 'websiteUrl',      label: 'Website / App URL',       required: true },
    { name: 'dataCollected',   label: 'Data Collected',          required: true },
    { name: 'dataPurpose',     label: 'Purpose of Data Use',     required: false },
    { name: 'contactEmail',    label: 'Privacy Contact Email',   required: true },
  ],
  legal_notice: [
    { name: 'senderName',      label: 'Sender Name',             required: true },
    { name: 'senderAddress',   label: 'Sender Address',          required: true },
    { name: 'recipientName',   label: 'Recipient Name',          required: true },
    { name: 'recipientAddress',label: 'Recipient Address',       required: true },
    { name: 'grievance',       label: 'Grievance / Demand',      required: true },
    { name: 'deadline',        label: 'Response Deadline (days)',required: false },
    { name: 'lawyerName',      label: 'Advocate Name (optional)',required: false },
  ],
};

// ── Prompts for new types ─────────────────────────────────────────────────────
function buildPromptForNewType(type, formData, language = 'english') {
  const langNote = language !== 'english'
    ? `Draft the entire document in formal ${language}, keeping section numbers in English digits.`
    : 'Draft the entire document in formal English.';

  const baseInstructions = `
${langNote}
Contract Details:
${JSON.stringify(formData, null, 2)}

REQUIREMENTS:
- Formal legal language suitable for Indian courts / Indian regulators.
- Numbered sections and sub-sections (1., 1.1 etc.).
- No markdown, plain text only.
- End with signature block or effective-date block as appropriate.
- Flag unfilled fields with [PLACEHOLDER].
- Return ONLY the document text, no commentary.
`;

  const typePrompts = {
    cofounder: `You are an expert Indian startup lawyer. Draft a comprehensive Co-founder Agreement compliant with the Indian Contract Act 1872, Companies Act 2013, and SEBI regulations where applicable.
Include: equity split, vesting schedule (cliff + linear), IP assignment, non-compete (12 months post-exit), roles & responsibilities, decision-making authority, deadlock resolution, exit/buyout provisions, governing law India.
${baseInstructions}`,

    terms: `You are an expert Indian technology lawyer. Draft a Terms & Conditions document for an Indian website/app compliant with the IT Act 2000, Consumer Protection Act 2019, and applicable RBI guidelines.
Include: acceptance of terms, user obligations, prohibited conduct, IP ownership, disclaimer of warranties, limitation of liability, dispute resolution (Indian Arbitration Act 1996), governing law India, GDPR-equivalent data notice.
${baseInstructions}`,

    privacy: `You are an expert Indian data-privacy lawyer. Draft a Privacy Policy compliant with India's Digital Personal Data Protection Act 2023 (DPDPA), IT Act 2000 Section 43A, and SPDI Rules 2011.
Include: data controller details, data collected, purpose of processing, lawful basis, data retention, user rights (access/correction/erasure/consent withdrawal), third-party sharing, cookies, security measures, grievance officer details, updates policy.
${baseInstructions}`,

    legal_notice: `You are an Indian advocate drafting a formal Legal Notice. Format as an official legal notice under Indian law.
Include: advocate's letterhead block, date, addressee, subject line, facts of grievance, legal basis (cite applicable sections), demand / relief sought, deadline for compliance, consequence of non-compliance, closing.
${baseInstructions}`,
  };

  return typePrompts[type] || `Draft a legal document for: ${type}\n${baseInstructions}`;
}

async function generateNewTypeContract(type, formData, language = 'english') {
  const prompt = buildPromptForNewType(type, formData, language);
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error('No content from Groq');
  return text;
}

// ── Week 9: Polish-Clause (POST /api/contracts/polish-clause) ────────────────
// Takes a single clause text + instruction and returns improved version.
async function polishClause(clauseText, instruction = 'Make more enforceable and clear') {
  const prompt = `You are an expert Indian corporate lawyer.

ORIGINAL CLAUSE:
"""
${clauseText.slice(0, 2000)}
"""

INSTRUCTION: ${instruction}

Rewrite the clause to be more legally robust, enforceable under Indian law, and clear.
Return ONLY the improved clause text. No commentary, no preamble.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1024,
  });
  const improved = completion.choices[0]?.message?.content?.trim();
  if (!improved) throw new Error('No content from Groq');
  return improved;
}

module.exports = {
  NEW_CONTRACT_TYPES,
  NEW_CONTRACT_FIELDS,
  generateNewTypeContract,
  polishClause,
};
