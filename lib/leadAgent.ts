/**
 * Solo-Operator AI Automation Layer: Lead Agent Interface & Multi-Provider Pipeline
 *
 * ARCHITECTURE & FUTURE MAYA INTEGRATION:
 * This layer sits behind a single clean interface: `LeadAgent`.
 * When "Project Maya" (MSR Next Gen's next-generation autonomous AI system) is ready,
 * simply implement `MayaLeadAgent implements LeadAgent` and swap the default export.
 * No changes will be needed to the admin UI, Firestore schema, or lead routes!
 */

export interface LeadInput {
  name: string;
  businessName: string;
  phone: string;
}

export interface LeadAnalysisResult {
  score: 'hot' | 'warm' | 'cold';
  summary: string;
  reply: string;
  autoSend: boolean;
  providerUsed: 'groq' | 'openrouter' | 'gemini' | 'rules';
}

export interface LeadAgent {
  handleNewLead(lead: LeadInput): Promise<LeadAnalysisResult>;
}

const SYSTEM_PROMPT = `You are the AI Lead Intelligence Agent for "MSR Next Gen" — a premier growth marketing and AI agency for local businesses and D2C brands in India.
Your job is to analyze incoming inquiries, score lead intent, and draft an authentic, polite, personalized first WhatsApp reply.

Given a lead with { name, businessName, phone }:
1. score: "hot" (clear commercial business name, high potential for ads/AI bot), "warm" (general business, moderate intent), or "cold" (vague/suspicious/spam name).
2. summary: A 1-sentence executive summary for the agency owner (e.g. "Restaurant owner in need of local footfall & online ordering ads").
3. reply: A polite, natural, high-converting WhatsApp message in English/Hinglish addressed to the client by name. Mention their business name and offer a 15-minute quick strategy audit.
4. autoSend: boolean. Return true if score is "hot" or "warm" and reply is safe/confident to send automatically. Return false if "cold" or ambiguous.

Respond ONLY with valid JSON in this exact structure:
{
  "score": "hot" | "warm" | "cold",
  "summary": "...",
  "reply": "...",
  "autoSend": true | false
}`;

// Provider 1: Groq (Ultra-fast, sub-second reasoning)
async function callGroq(lead: LeadInput, apiKey: string): Promise<LeadAnalysisResult | null> {
  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  
  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Lead Details:\nName: ${lead.name}\nBusiness Name: ${lead.businessName}\nPhone: ${lead.phone}`,
            },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      return {
        score: ['hot', 'warm', 'cold'].includes(parsed.score) ? parsed.score : 'warm',
        summary: parsed.summary || `${lead.businessName} lead inquiry`,
        reply: parsed.reply || getFallbackReply(lead),
        autoSend: parsed.autoSend !== false,
        providerUsed: 'groq',
      };
    } catch {
      // Continue to next model or fallback
    }
  }
  return null;
}

// Provider 2: OpenRouter (Secondary fallback)
async function callOpenRouter(lead: LeadInput, apiKey: string): Promise<LeadAnalysisResult | null> {
  const models = [
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
  ];

  for (const model of models) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://msrnextgen.com',
          'X-Title': 'MSR Next Gen Lead Agent',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\nReturn ONLY pure JSON.` },
            {
              role: 'user',
              content: `Lead Details:\nName: ${lead.name}\nBusiness Name: ${lead.businessName}\nPhone: ${lead.phone}`,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) continue;

      // Extract JSON block
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: ['hot', 'warm', 'cold'].includes(parsed.score) ? parsed.score : 'warm',
        summary: parsed.summary || `${lead.businessName} lead inquiry`,
        reply: parsed.reply || getFallbackReply(lead),
        autoSend: parsed.autoSend !== false,
        providerUsed: 'openrouter',
      };
    } catch {
      // Continue to next model or fallback
    }
  }
  return null;
}

// Provider 3: Gemini (Tertiary / Multimodal fallback)
async function callGemini(lead: LeadInput, apiKey: string): Promise<LeadAnalysisResult | null> {
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT },
                  {
                    text: `Lead Details:\nName: ${lead.name}\nBusiness Name: ${lead.businessName}\nPhone: ${lead.phone}\nOutput valid JSON only.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text);
      return {
        score: ['hot', 'warm', 'cold'].includes(parsed.score) ? parsed.score : 'warm',
        summary: parsed.summary || `${lead.businessName} lead inquiry`,
        reply: parsed.reply || getFallbackReply(lead),
        autoSend: parsed.autoSend !== false,
        providerUsed: 'gemini',
      };
    } catch {
      // Try next model
    }
  }
  return null;
}

// Provider 4: Local Deterministic Rule-Engine (Failsafe backup)
function deterministicRulesLeadScorer(lead: LeadInput): LeadAnalysisResult {
  const name = lead.name.trim();
  const business = lead.businessName.trim();

  // Basic heuristic: check if business name contains commercial words
  const commercialKeywords = [
    'sweets',
    'cafe',
    'restaurant',
    'store',
    'shop',
    'd2c',
    'clothing',
    'salon',
    'school',
    'jewel',
    'hotel',
    'agency',
    'mart',
    'bazaar',
    'pvt',
    'ltd',
    'msr',
  ];

  const lowerBiz = business.toLowerCase();
  const hasCommercialKeyword = commercialKeywords.some((kw) => lowerBiz.includes(kw));

  const score: 'hot' | 'warm' | 'cold' = hasCommercialKeyword
    ? 'hot'
    : business.length >= 2 && name.length >= 2
    ? 'warm'
    : 'cold';

  return {
    score,
    summary: `${business} — Inbound customer inquiry via landing page`,
    reply: getFallbackReply(lead),
    autoSend: score !== 'cold',
    providerUsed: 'rules',
  };
}

function getFallbackReply(lead: LeadInput): string {
  return `Hi ${lead.name}! 👋 Thank you for reaching out to MSR Next Gen regarding ${lead.businessName}. We help Indian businesses scale with high-converting Meta/Google Ads and 24/7 AI WhatsApp Agents. Would you have 10 minutes today for a quick chat to discuss your growth plan?`;
}

/**
 * Default Solo-Operator Multi-Provider Lead Agent
 * Executes fallback chain: Groq -> OpenRouter -> Gemini -> Rules
 */
export class SoloOperatorLeadAgent implements LeadAgent {
  async handleNewLead(lead: LeadInput): Promise<LeadAnalysisResult> {
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try Groq (Fastest)
    if (groqKey) {
      const result = await callGroq(lead, groqKey);
      if (result) return result;
    }

    // 2. Try OpenRouter (Secondary)
    if (openRouterKey) {
      const result = await callOpenRouter(lead, openRouterKey);
      if (result) return result;
    }

    // 3. Try Gemini (Tertiary)
    if (geminiKey) {
      const result = await callGemini(lead, geminiKey);
      if (result) return result;
    }

    // 4. Local Deterministic Rule Engine (Zero-failure safety net)
    return deterministicRulesLeadScorer(lead);
  }
}

// Single active agent export (Ready for Project Maya swap)
export const leadAgent: LeadAgent = new SoloOperatorLeadAgent();
