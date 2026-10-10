import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CRM_FILE = path.resolve(__dirname, '../data/whatsapp_sales_crm.json');

// =============================================================================
// MSR NEXT GEN — MULTI-AGENT CONSULTATIVE SALES MIND & CRM ENGINE
// =============================================================================

function loadLocalEnv() {
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {}
    }
  }
}
loadLocalEnv();

export const MUKUL_PRIMARY_ALERT_PHONE = '918887521156'; // User's requested WhatsApp for lead summaries
export const MUKUL_BACKUP_ALERT_PHONE = '919519342440';

// In-memory CRM cache
let crmDatabase = {};

// Load CRM from disk on startup
function loadCrmDatabase() {
  try {
    if (fs.existsSync(CRM_FILE)) {
      const raw = fs.readFileSync(CRM_FILE, 'utf-8');
      crmDatabase = JSON.parse(raw);
    } else {
      crmDatabase = {};
      saveCrmDatabase();
    }
  } catch (err) {
    console.error('[CRM Load Error]:', err);
    crmDatabase = {};
  }
}

// Persist CRM to disk
function saveCrmDatabase() {
  try {
    const dir = path.dirname(CRM_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CRM_FILE, JSON.stringify(crmDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CRM Save Error]:', err);
  }
}

loadCrmDatabase();

// Check if phone belongs to Mukul (Owner)
export function isOwnerNumber(phone) {
  const clean = String(phone || '').replace(/[^0-9]/g, '');
  return (
    clean === MUKUL_PRIMARY_ALERT_PHONE ||
    clean === MUKUL_BACKUP_ALERT_PHONE ||
    clean.endsWith('8887521156') ||
    clean.endsWith('9519342440') ||
    clean === '33032778027137'
  );
}

// Clean phone helper
export function cleanPhoneNumber(phone) {
  let clean = String(phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  return clean;
}

// Resolve WhatsApp LID to real phone number using Baileys auth reverse mapping
const ADMIN_AUTH_DIR = path.join(process.cwd(), '.whatsapp_auth');
export function resolveLidToPhone(lidOrPhone, authDir = ADMIN_AUTH_DIR) {
  const clean = String(lidOrPhone || '').replace(/[^0-9]/g, '');
  if (!clean) return clean;
  if (clean === '33032778027137') return MUKUL_PRIMARY_ALERT_PHONE;
  if (clean.length === 10) return '91' + clean;
  if (clean.length >= 11 && clean.length <= 13) return clean;

  if (clean.length > 13) {
    try {
      const reverseFile = path.join(authDir, `lid-mapping-${clean}_reverse.json`);
      if (fs.existsSync(reverseFile)) {
        const mapped = JSON.parse(fs.readFileSync(reverseFile, 'utf8'));
        const mappedClean = String(mapped || '').replace(/[^0-9]/g, '');
        if (mappedClean) {
          if (mappedClean.length === 10) return '91' + mappedClean;
          return mappedClean;
        }
      }
    } catch {}
  }
  return clean;
}

// Get or initialize customer record
export function getOrCreateCustomerRecord(phone, pushName = '') {
  const cleanPhone = cleanPhoneNumber(phone);
  if (isOwnerNumber(cleanPhone)) {
    return {
      phone: cleanPhone,
      name: 'Mukul Mishra (Owner)',
      isOwner: true,
      history: [],
    };
  }

  if (!crmDatabase[cleanPhone]) {
    crmDatabase[cleanPhone] = {
      phone: cleanPhone,
      name: pushName || '',
      businessName: '',
      category: 'Unclassified',
      budget: '',
      painPoint: '',
      websiteUrl: '',
      auditFindings: '',
      stage: 'discovery',
      meetingState: 'none',
      psychologyNotes: 'New inbound lead. Needs discovery.',
      history: [],
      lastActive: Date.now(),
      alertSentToOwner: false,
      notes: '',
    };
    saveCrmDatabase();
  } else if (pushName && !crmDatabase[cleanPhone].name) {
    crmDatabase[cleanPhone].name = pushName;
    saveCrmDatabase();
  }
  return crmDatabase[cleanPhone];
}

// Export all records for Admin CRM table
export function getAllCrmLeads() {
  loadCrmDatabase();
  return Object.values(crmDatabase)
    .filter((l) => !isOwnerNumber(l.phone))
    .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
}

// Update specific lead from Admin Dashboard
export function updateLeadRecord(phone, updates) {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!crmDatabase[cleanPhone]) return null;
  crmDatabase[cleanPhone] = {
    ...crmDatabase[cleanPhone],
    ...updates,
    lastActive: Date.now(),
  };
  saveCrmDatabase();
  return crmDatabase[cleanPhone];
}

// Delete specific lead from CRM (e.g. spam or bogus LID leads)
export function deleteLeadRecord(phone) {
  loadCrmDatabase();
  const cleanPhone = cleanPhoneNumber(phone);
  const rawPhone = String(phone || '').replace(/[^0-9]/g, '');

  let deleted = false;
  if (crmDatabase[cleanPhone]) {
    delete crmDatabase[cleanPhone];
    deleted = true;
  }
  if (rawPhone && crmDatabase[rawPhone]) {
    delete crmDatabase[rawPhone];
    deleted = true;
  }

  if (deleted) {
    saveCrmDatabase();
    return true;
  }
  return false;
}

// =============================================================================
// AGENT 1: LINK & PROFILE AUDITOR
// =============================================================================
export function extractUrlOrHandle(text) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|in|shop|store|co|io|org|net)[^\s]*)/i;
  const igRegex = /(?:instagram\.com\/|@)([a-zA-Z0-9_.]+)/i;

  const urlMatch = text.match(urlRegex);
  if (urlMatch) return { type: 'website', value: urlMatch[0] };

  const igMatch = text.match(igRegex);
  if (igMatch) return { type: 'instagram', value: igMatch[1] };

  return null;
}

export function performInstantAudit(linkInfo, category = 'General') {
  if (!linkInfo) return null;

  if (linkInfo.type === 'instagram') {
    return `🔍 *Instagram Profile Quick Audit (@${linkInfo.value})*:
1. Bio me direct WhatsApp Click-to-Chat CTA missing hai — profile visitors order ya book karne ke bajaye drop ho rahe hain.
2. Reels me visual problem/solution hook aur regional voiceover add karne se organic reach 2x-3x ho sakti hai (jaise humne Amparo aur Nacho G ke liye kiya).`;
  }

  return `🔍 *Website/Store Quick Audit (${linkInfo.value})*:
1. Mobile landing page par direct 1-tap WhatsApp chat button missing hai — mobile shoppers direct baat karke order place karna chahte hain.
2. Checkout drop-off rokne ke liye automated WhatsApp abandoned cart recovery & COD confirmation zaroori hai.`;
}

// Robust financial budget extractor (prevents false positives like "3", "2" from single digit text)
export function extractBudget(text) {
  if (!text) return null;
  // 1. Explicit keyword with amount: "budget 25k", "spend around 50,000", "monthly spend ₹40000"
  const keywordMatch = text.match(/(?:budget|spend|kharch|mahine ka|investment)\s*(?:hai|h|rehta hai|approx|around|is|of)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\s*(?:k|lakh|thousand|cr|crore))?)/i);
  if (keywordMatch && keywordMatch[1]) {
    const rawVal = keywordMatch[1].trim();
    if (!/^\d{1,2}$/.test(rawVal)) {
      return keywordMatch[0].trim();
    }
  }

  // 2. Explicit currency symbol: "₹50,000", "Rs 20k", "INR 35000"
  const currencyMatch = text.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\s*(?:k|lakh|thousand|cr|crore))?)/i);
  if (currencyMatch && currencyMatch[1]) {
    const rawVal = currencyMatch[1].trim();
    if (!/^\d{1,2}$/.test(rawVal)) {
      return currencyMatch[0].trim();
    }
  }

  // 3. Obvious amount with unit: "25k", "1.5 lakh", "50k"
  const unitMatch = text.match(/\b(\d+(?:\.\d+)?\s*(?:k|lakh|thousand|cr|crore))\b/i);
  if (unitMatch && unitMatch[1]) {
    return unitMatch[1].trim();
  }

  // 4. Large number alone (>= 4 digits): e.g. "50000", "20,000"
  const largeNumMatch = text.match(/\b([1-9]\d{3,}[\d,]*)\b/);
  if (largeNumMatch && largeNumMatch[1]) {
    return `₹${largeNumMatch[1]}`;
  }

  return null;
}

// Meeting Intent Detector (Comprehensive Indian Hindi & English)
export function isMeetingIntent(text) {
  if (!text) return false;
  const t = text.toLowerCase().trim();

  // 1. Explicit Direct Keywords
  if (/(?:book call|book meeting|schedule call|schedule meeting|need call|need meeting)/i.test(t)) return true;
  if (/(?:call me|call karo|call kijiye|call karlo|call kar|call karni|call karna|call par baat|call pe baat)/i.test(t)) return true;
  if (/(?:baat karni|baat karna|baat karni thi|baat karni h|baat ho sakti|baat karni hai|baat karein)/i.test(t)) return true;
  if (/(?:meeting chahiye|meeting karni|meeting karna|meeting karlo|meeting fix|meeting schedule|meeting kar do)/i.test(t)) return true;
  if (/(?:slot chahiye|slot de do|slot do|slot book|slot fix|slot confirm|slot milega|slot de|slot bhej)/i.test(t)) return true;
  if (/(?:appointment chahiye|appointment book|appointment fix|appointment schedule)/i.test(t)) return true;
  if (/(?:zoom|google meet|1-on-1|growth audit|audit call|voice call|phone call|strategy call)/i.test(t)) return true;

  // 2. Combination of Action + Topic
  const hasTopic = /(?:call|meeting|baat|connect|audit|slot|appointment|phone|discuss)/i.test(t);
  const hasAction = /(?:karo|karein|karna|karni|karlo|kar|sakta|sakte|sakti|chahiye|schedule|book|fix|arrange|do|de do|bhejo|kab|time|hoga|milega|thi|h)/i.test(t);
  if (hasTopic && hasAction) return true;

  // 3. Short colloquial Hindi
  if (/(?:kab baat|kab call|call par|phone par|call pe|phone pe|call kab)/i.test(t)) return true;

  return false;
}

// Name & Business Name Intelligent Extractor
export function extractNameAndBusiness(text, customer = {}) {
  if (!text) return { name: customer?.name || '', businessName: customer?.businessName || '' };

  let extractedName = customer?.name || '';
  let extractedBiz = customer?.businessName || '';

  const cleanText = text.trim();

  // Pattern A: "Name: Rahul, Business: Cafe Mocha" or "Naam: Rahul, Brand: Nacho G"
  const labelMatch = cleanText.match(/(?:naam|name)\s*[:\-]?\s*([A-Za-z\s]{2,25})[,\n\s]+(?:business|brand|company|shop|cafe|store|clinic|gym)\s*(?:name|ka naam)?\s*[:\-]?\s*([A-Za-z0-9\s&]{2,30})/i);
  if (labelMatch) {
    extractedName = labelMatch[1].trim();
    extractedBiz = labelMatch[2].trim();
  }

  // Pattern B: "Mera naam Rahul hai aur business Cafe Mocha" or "Mera naam Amit Sharma hai from FitZone Gym"
  const meraNaamMatch = cleanText.match(/mera\s*naam\s+([A-Za-z\s]{2,25}?)(?:\s+hai|\s+h|\s+from|\s+aur|\s+and|\s*,|\.|$)/i);
  if (meraNaamMatch && meraNaamMatch[1]) {
    const candidate = meraNaamMatch[1].trim();
    if (!['kya', 'hai', 'h', 'nhi', 'nahi'].includes(candidate.toLowerCase())) {
      extractedName = candidate;
    }
  }

  // Pattern C: "I am Rahul from Cafe Mocha" or "Rahul from FitZone" (only at start or with prefix)
  const fromMatch = cleanText.match(/(?:(?:i am|myself|this is)\s+([A-Za-z\s]{2,20})|^([A-Za-z\s]{2,20}))\s+from\s+([A-Za-z0-9\s&]{2,30})/i);
  if (fromMatch) {
    const candidateName = (fromMatch[1] || fromMatch[2] || '').trim();
    const candidateBiz = (fromMatch[3] || '').trim();
    if (candidateName && !['hai', 'h', 'hu', 'ho', 'kya', 'aur', 'and'].includes(candidateName.toLowerCase())) {
      if (!extractedName) extractedName = candidateName;
      if (!extractedBiz) extractedBiz = candidateBiz;
    }
  }

  // Pattern D: "Rahul, Cafe Mocha" or "Rahul - Cafe Mocha" (common comma / hyphen separated replies)
  const commaMatch = cleanText.match(/^([A-Za-z]{2,20})\s*[,|\-]\s*([A-Za-z0-9\s&]{2,30})$/);
  if (commaMatch) {
    const part1 = commaMatch[1].trim();
    const part2 = commaMatch[2].trim();
    if (!['hello', 'namaste', 'hi', 'hey', 'yes', 'no'].includes(part1.toLowerCase())) {
      extractedName = part1;
      extractedBiz = part2;
    }
  }

  // Pattern E: Explicit single name: "Rahul", "Aman Sharma", "Dr. Verma"
  if (!extractedName || /^(client|customer|user|inbound|business owner)$/i.test(extractedName)) {
    const singleName = cleanText.match(/^(?:my name is|naam|name)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/i);
    if (singleName && !['hello', 'namaste', 'hi', 'hey', 'yes', 'no', 'call', 'meeting', 'audit', 'slot', 'theek', 'karo', 'karlo'].includes(singleName[1].toLowerCase())) {
      extractedName = singleName[1].trim();
    }
  }

  // Pattern F: Explicit business name mention
  if (!extractedBiz || /^(business|business owner)$/i.test(extractedBiz)) {
    const fromBiz = cleanText.match(/\bfrom\s+([A-Za-z0-9&]{2,25}(?:\s+[A-Za-z0-9&]{2,25})?)/i);
    if (fromBiz) {
      extractedBiz = fromBiz[1].trim().replace(/\.$/, '');
    } else {
      const bizMatch = cleanText.match(/(?:brand|business|company|clinic|cafe|restaurant|store|shop|gym|salon|institute)\s*(?:ka\s*naam\s*|name\s*is\s*|is\s*|hai\s*)?[:\-]?\s*([A-Za-z0-9\s&]{2,30})/i);
      if (bizMatch) {
        const candidate = bizMatch[1].trim();
        if (!['kya', 'hai', 'nhi', 'nahi', 'yes', 'no', 'aur', 'karna', 'hoga'].includes(candidate.toLowerCase())) {
          extractedBiz = candidate;
        }
      } else {
        const keywordBiz = cleanText.match(/([A-Za-z0-9&]{2,20}\s+(?:cafe|restaurant|gym|fitness|clinic|hospital|salon|spa|bakery|brand|store|shop|institute|coaching|foods))/i);
        if (keywordBiz) {
          extractedBiz = keywordBiz[1].trim();
        } else if (cleanText.length <= 30 && /(?:cafe|restaurant|gym|fitness|clinic|hospital|salon|spa|bakery|brand|store|shop|institute|coaching|foods)/i.test(cleanText)) {
          extractedBiz = cleanText;
          if (extractedName === cleanText) extractedName = customer?.name || '';
        }
      }
    }
  }

  return { name: extractedName, businessName: extractedBiz };
}

// =============================================================================
// AGENT 2: SALES PSYCHOLOGIST & INTENT ANALYZER
// =============================================================================
export function analyzeCustomerIntent(customer, incomingText) {
  const text = incomingText.toLowerCase();

  // Detect Category
  if (text.includes('d2c') || text.includes('shopify') || text.includes('ecommerce') || text.includes('product') || text.includes('clothing') || text.includes('skincare')) {
    customer.category = 'D2C & E-Commerce';
  } else if (text.includes('restaurant') || text.includes('cafe') || text.includes('food') || text.includes('bakery') || text.includes('dining') || text.includes('table')) {
    customer.category = 'Restaurant & Cafe';
  } else if (text.includes('clinic') || text.includes('hospital') || text.includes('doctor') || text.includes('patient') || text.includes('appointment')) {
    customer.category = 'Clinic & Healthcare';
  } else if (text.includes('school') || text.includes('coaching') || text.includes('admission') || text.includes('institute') || text.includes('course')) {
    customer.category = 'Education & Coaching';
  } else if (text.includes('flat') || text.includes('property') || text.includes('real estate') || text.includes('builder') || text.includes('plot')) {
    customer.category = 'Real Estate';
  }

  // Detect Business Name if explicitly stated
  const bizNameMatch = incomingText.match(/(?:brand|business|company|clinic|cafe|restaurant|store|shop)\s*(?:ka\s*naam\s*|name\s*is\s*|is\s*|hai\s*)?[:\-]?\s*([A-Za-z0-9\s&]{3,25})/i);
  if (bizNameMatch && !customer.businessName) {
    const candidate = bizNameMatch[1].trim();
    if (!['kya', 'hai', 'nhi', 'nahi', 'yes', 'no', 'aur'].includes(candidate.toLowerCase())) {
      customer.businessName = candidate;
    }
  }

  // Detect Budget / Spend with hardened extractor
  const parsedBudget = extractBudget(incomingText);
  if (parsedBudget && !customer.budget) {
    customer.budget = parsedBudget;
  }

  // Detect Core Pain Points
  if (text.includes('cpl') || text.includes('leads mehangi') || text.includes('mehenga') || text.includes('high cost')) {
    customer.painPoint = 'High CPL / Cost Per Lead in current ads';
  } else if (text.includes('reply') || text.includes('time nahi') || text.includes('miss ho') || text.includes('late')) {
    customer.painPoint = 'Customer WhatsApp inquiries receiving slow replies during rush hours';
  } else if (text.includes('sales nahi') || text.includes('orders nahi') || text.includes('roas') || text.includes('convert nahi')) {
    customer.painPoint = 'Low conversion rate / Low ROAS on Meta ads';
  } else if (text.includes('fake') || text.includes('bekar lead') || text.includes('timepass')) {
    customer.painPoint = 'Low quality / Junk leads that do not pick up calls';
  }

  // Detect Link / Instagram Handle
  const link = extractUrlOrHandle(incomingText);
  if (link && !customer.websiteUrl) {
    customer.websiteUrl = link.value;
    customer.auditFindings = performInstantAudit(link, customer.category);
    customer.stage = 'audited';
  }

  // Advance Funnel Stage
  if (isMeetingIntent(incomingText)) {
    customer.stage = 'meeting_requested';
  } else if (customer.budget) {
    customer.stage = 'hot_ready_to_close';
  } else if (customer.businessName && customer.category && customer.category !== 'Unclassified') {
    if (customer.stage === 'discovery') customer.stage = 'qualifying';
  }

  customer.lastActive = Date.now();
  saveCrmDatabase();
}

// =============================================================================
// MULTI-PROVIDER REAL CLOUD LLM ENGINE (OpenRouter, Groq, Gemini, Pollinations)
// =============================================================================

// 1. OpenRouter Provider
async function callOpenRouter(systemPrompt, incomingText, recentHistory, apiKey) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const messages = [{ role: 'system', content: systemPrompt }];
    if (recentHistory) {
      messages.push({ role: 'system', content: `Recent Conversation Context:\n${recentHistory}` });
    }
    messages.push({ role: 'user', content: incomingText });

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://msrnextgen.com',
        'X-Title': 'MSR Next Gen WhatsApp Bot',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages,
        temperature: 0.35,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply && reply.trim().length > 5) return reply.trim();
    }
  } catch {}
  return null;
}

// 2. Groq Provider
async function callGroqChat(systemPrompt, incomingText, recentHistory, apiKey) {
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const messages = [{ role: 'system', content: systemPrompt }];
      if (recentHistory) {
        messages.push({ role: 'system', content: `Recent Conversation Context:\n${recentHistory}` });
      }
      messages.push({ role: 'user', content: incomingText });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.35,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim().length > 5 && (reply.match(/\uFFFD/g) || []).length <= 2) {
          return reply.trim();
        }
      }
    } catch {}
  }
  return null;
}

// 3. Gemini Provider
async function callGeminiChat(systemPrompt, incomingText, recentHistory, apiKey) {
  const models = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];
  for (const model of models) {
    try {
      const promptText = `Instructions:\n${systemPrompt}\n\nRecent History:\n${recentHistory || 'No previous history'}\n\nClient message: "${incomingText}"\n\nReply as Maya (MSR Next Gen AI Growth Assistant) in natural, conversational Hinglish (2-3 sentences max):`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim().length > 5) return reply.trim();
      }
    } catch {}
  }
  return null;
}

// 4. Pollinations AI (Keyless GPT-4o-mini Engine)
async function callPollinationsAI(systemPrompt, incomingText, recentHistory) {
  try {
    const promptToSend = encodeURIComponent(
      `Conversation History:\n${recentHistory}\n\nClient's Message: "${incomingText}"\n\nReply as Maya (MSR Next Gen AI Growth Assistant) in warm, natural Hinglish (2-3 sentences max, consultative, human-like):`
    );
    const encodedSystem = encodeURIComponent(systemPrompt);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const url = `https://text.pollinations.ai/${promptToSend}?system=${encodedSystem}&model=openai`;
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10 && !text.trim().startsWith('{')) {
        return text.trim().replace(/^"|"$/g, '');
      }
    }
  } catch {}
  return null;
}

// =============================================================================
// AGENT 3: CONSULTATIVE SALES CLOSER (OPEN-ENDED HUMAN-LIKE HINGLISH)
// =============================================================================
export async function generateConsultativeSalesReply(customer, incomingText) {
  const historyLen = customer.history.length;
  const recentHistory = customer.history
    .slice(-6)
    .map((m) => `${m.sender === 'customer' ? 'Client' : 'Maya (AI)'}: "${m.text}"`)
    .join('\n');

  const systemPrompt = `You are Maya, the 24/7 AI Growth Partner for "MSR Next Gen", founded by Mukul Mishra (India's premier Performance Marketing & 24/7 AI WhatsApp Automation Agency).
You are speaking directly with a business owner on WhatsApp representing Mukul and MSR Next Gen.
CRITICAL SALES PERSONA & HIGH-CONVERSION PSYCHOLOGY:
1. NEVER claim to be Mukul Mishra himself. NEVER say "Main Mukul hu" or "Mera naam Mukul hai". Introduce yourself as Maya (AI Growth Assistant at MSR Next Gen).
2. META ADS INBOUND CONVERSION PSYCHOLOGY:
   • Leads arriving from Meta Ads (Instagram/FB) seek fast clarity, high trust, and measurable ROI.
   • Acknowledge their ad curiosity immediately and validate their pain point with deep empathy (e.g., "Ad spend ho raha hai par quality leads nahi aa rahi ya fake inquiries aa rahi hain").
   • Micro-Diagnose: Ask 1 sharp diagnostic question before pitching (e.g., "Aap abhi Meta ads run kar rahe hain ya fresh campaign start karna chahte hain?").
   • Share concrete Indian case study proof:
     - D2C / E-Commerce: Amparo (₹2.4L in 30 days, 3.8x ROAS, 28% fake COD eliminated via automated WhatsApp verification).
     - Restaurants & Cafes: Nacho G & Grand Bistro (Smart QR menu, automated WhatsApp bookings, 40% repeat diners).
     - Clinics & Salons: 100% automated appointment bookings on WhatsApp without receptionist payroll.
     - Gyms & Coaching: High-intent local leads with 60% trial conversion rate.
3. OUR 3 TRANSPARENT HIGH-ROI PACKAGES:
   • STARTER (Local Visibility): Setup ₹2,999 + ₹6,999/month (Google Maps SEO, 4 Reels, WhatsApp Review Booster QR, Monthly Report)
   • GROWTH (Customer Magnet - Most Popular): Setup ₹4,999 + ₹14,999/month (Starter + Meta/Google Local Ads + 8 Reels + 24/7 AI WhatsApp Inquiry & Booking Bot + Birthday/Anniversary Auto-Offers + Win-Back CRM)
   • PREMIUM (Full Automation VIP): Setup ₹9,999 + ₹24,999/month (Growth + 12 Reels + Professional Video Shoot + Custom Landing Page + AI Calling Agent + Dedicated Manager)
4. SMART PDF BROCHURE SHARING:
   • Share ONLY when asked for packages/pricing/brochure/services list: https://msrnextgen.com/MSR_Next_Gen_Restaurant_Growth_Pitch.pdf
5. CONCISE & CONVERSATIONAL:
   • 2 to 3 sentences maximum. Warm, consultative Hinglish. Always complete your thoughts.
   • End with an engaging micro-discovery question (e.g., "Aapka business kahan located hai?", "Aapka monthly ad budget approx kitna rehta hai?").
6. AUDIT CALL INVITATION:
   • Guide smoothly towards a Complimentary 15-Minute Business Growth & Ads Audit Call with Founder Mukul Mishra.`;

  // 1. OpenRouter (Primary High-Intelligence Router)
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    const reply = await callOpenRouter(systemPrompt, incomingText, recentHistory, openrouterKey);
    if (reply) return reply;
  }

  // 2. Groq (Ultra-fast Qwen / Llama)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const reply = await callGroqChat(systemPrompt, incomingText, recentHistory, groqKey);
    if (reply) return reply;
  }

  // 3. Gemini Flash
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && (geminiKey.startsWith('AIzaSy') || geminiKey.startsWith('AQ.'))) {
    const reply = await callGeminiChat(systemPrompt, incomingText, recentHistory, geminiKey);
    if (reply) return reply;
  }

  // 4. Pollinations Keyless GPT-4o-mini
  const pollReply = await callPollinationsAI(systemPrompt, incomingText, recentHistory);
  if (pollReply) return pollReply;

  // 5. Dynamic Contextual Fallback (Offline emergency only)
  if (isMeetingIntent(incomingText)) {
    return `Bilkul! Main Mukul sir ke calendar se next available slot verify karke aapko agle 5-10 minute me confirm karti hu. 😊 Aapke liye morning ka time convenient rahega ya shaam ka?`;
  } else if (historyLen > 4) {
    return `Aapka requirement samajh aa gaya hai. Isko live discuss karne aur exact ads strategy finalize karne ke liye kya hum Mukul ke sath aaj 10 minute ki quick call schedule karein?`;
  } else if (historyLen > 2) {
    return `Bilkul! Hum aapke specific business goals ke hisab se customized campaign structure design karte hain. Kya aap apna business name aur monthly estimated budget share karenge taaki main ek clear roadmap share kar saku?`;
  }

  return `Namaste! Main Maya hu, MSR Next Gen se (founded by Mukul Mishra). Hum Meta & Google Ads aur 24/7 AI WhatsApp bots se aapke sales scale karte hain. Aap kis business ke liye marketing ya AI automation explore kar rahe hain?`;
}

// Qualification Gate: Ensures only genuine, qualified leads trigger dossiers to Mukul
export function isQualifiedForDossier(customer) {
  if (!customer) return false;
  if (customer.alertSentToOwner) return false;
  if (isOwnerNumber(customer.phone)) return false;

  // If lead is in meeting approval flow, that has its own specific meeting alert
  if (customer.meetingState === 'pending_owner_approval') return false;

  // Qualification 1: Explicit financial budget provided
  if (customer.budget && customer.budget.length > 2) return true;

  // Qualification 2: Website or Instagram link provided for audit
  if (customer.websiteUrl) return true;

  // Qualification 3: Business name + category known with at least 2 customer conversation turns
  const customerTurns = (customer.history || []).filter((m) => m.sender === 'customer').length;
  if (customer.businessName && customer.category && customer.category !== 'Unclassified' && customerTurns >= 2) {
    return true;
  }

  return false;
}

// Dispatch Meeting Request Alert to Mukul
export async function sendMeetingRequestToOwner(customer, incomingText, sock) {
  if (!sock) return;
  const isLid = !customer.phone || customer.phone.length > 13 || customer.isLid;
  const displayPhone = isLid ? 'WhatsApp Direct Chat (LID)' : `+${customer.phone}`;

  const alertMessage = `📅 *MEETING REQUEST FROM CLIENT!*
━━━━━━━━━━━━━━━━━━━━
👤 *Client*: ${customer.name || 'Inbound Client'}
📱 *Phone*: ${displayPhone}
🏢 *Business*: ${customer.businessName || 'Business Owner'} (${customer.category || 'Inbound'})
💰 *Budget*: ${customer.budget || 'To be discussed on audit call'}
💬 *Client Message*: "${incomingText}"

Mukul sir, kya time slot confirm karna hai?
👉 *Reply karein*:
*!slot ${customer.phone} <Date & Time>*
(Example: *!slot ${customer.phone} Kal shaam 5:00 PM*)
━━━━━━━━━━━━━━━━━━━━
_Dispatched via MSR Sales Mind_`;

  try {
    const primaryJid = `${MUKUL_PRIMARY_ALERT_PHONE}@s.whatsapp.net`;
    const backupJid = `${MUKUL_BACKUP_ALERT_PHONE}@s.whatsapp.net`;

    if (sock && typeof sock.sendMessage === 'function') {
      try { await sock.sendMessage(primaryJid, { text: alertMessage }); } catch {}
      if (MUKUL_BACKUP_ALERT_PHONE !== MUKUL_PRIMARY_ALERT_PHONE) {
        try { await sock.sendMessage(backupJid, { text: alertMessage }); } catch {}
      }
    }

    // Secondary Cloud Delivery Fallback via Render Worker to guarantee delivery
    try {
      await fetch('https://msr-whatsapp-bot.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: MUKUL_PRIMARY_ALERT_PHONE, message: alertMessage }),
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
  } catch (err) {
    console.error('[Meeting Alert to Mukul failed]:', err);
  }
}

// =============================================================================
// NATURAL LANGUAGE SLOT PARSER & CALENDAR TIME ENGINE
// =============================================================================
export function parseSlotToTimestamp(slotText, baseTime = Date.now()) {
  if (!slotText || typeof slotText !== 'string') return null;

  const text = slotText.toLowerCase().trim();

  // Get current date components in IST
  const now = new Date(baseTime);
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  const getPart = (type) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);

  const curYear = getPart('year');
  const curMonth = getPart('month') - 1; // 0-indexed
  const curDay = getPart('day');

  let dayOffset = 0; // 0 = today, 1 = tomorrow, 2 = day after tomorrow

  if (text.includes('parso') || text.includes('day after tomorrow')) {
    dayOffset = 2;
  } else if (text.includes('kal') || text.includes('tomorrow')) {
    dayOffset = 1;
  } else if (text.includes('aaj') || text.includes('today')) {
    dayOffset = 0;
  }

  // Check specific day of week
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hindiDays = ['ravivar', 'somvar', 'mangalvar', 'budhvar', 'guruvar', 'shukravar', 'shanivar'];
  for (let i = 0; i < 7; i++) {
    if (text.includes(dayNames[i]) || text.includes(hindiDays[i])) {
      const curDayOfWeek = new Date(Date.UTC(curYear, curMonth, curDay + dayOffset)).getUTCDay();
      let diff = i - curDayOfWeek;
      if (diff <= 0) diff += 7;
      dayOffset += diff;
      break;
    }
  }

  let hour = null;
  let minute = 0;
  let isPm = false;
  let isAm = false;

  if (
    text.includes('pm') ||
    text.includes('shaam') ||
    text.includes('dopahar') ||
    text.includes('raat') ||
    text.includes('evening') ||
    text.includes('afternoon') ||
    text.includes('night')
  ) {
    isPm = true;
  }

  if (text.includes('am') || text.includes('subah') || text.includes('morning')) {
    isAm = true;
  }

  const colonTimeMatch = text.match(/(\d{1,2})[:.](\d{2})(?:\s*(am|pm))?/i);
  const bajeOrAmpmMatch = text.match(/(\d{1,2})\s*(?:am|pm|baje|o'clock|\s*(?:am|pm))/i);
  const anyNumberMatch = text.match(/\b(\d{1,2})\b/);

  if (colonTimeMatch) {
    hour = parseInt(colonTimeMatch[1], 10);
    minute = parseInt(colonTimeMatch[2], 10);
    if (colonTimeMatch[3]) {
      if (colonTimeMatch[3].toLowerCase() === 'pm') isPm = true;
      if (colonTimeMatch[3].toLowerCase() === 'am') isAm = true;
    }
  } else if (bajeOrAmpmMatch) {
    hour = parseInt(bajeOrAmpmMatch[1], 10);
    minute = 0;
  } else if (anyNumberMatch) {
    hour = parseInt(anyNumberMatch[1], 10);
    minute = 0;
  }

  if (hour === null || isNaN(hour)) {
    return null;
  }

  if (isPm && hour < 12) {
    hour += 12;
  } else if (isAm && hour === 12) {
    hour = 0;
  } else if (!isPm && !isAm) {
    if (hour >= 1 && hour <= 6) {
      hour += 12;
    }
  }

  const targetUtcMs = Date.UTC(curYear, curMonth, curDay + dayOffset, hour - 5, minute - 30, 0);

  if (dayOffset === 0 && !text.includes('aaj') && !text.includes('today')) {
    if (targetUtcMs <= baseTime) {
      return targetUtcMs + 24 * 60 * 60 * 1000;
    }
  }

  return targetUtcMs;
}

export function formatTimestampToSlot(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

// Conflict Checker
export function checkMeetingSlotConflict(cleanPhone, slotDetails, targetTimestamp) {
  if (Object.keys(crmDatabase).length === 0) {
    loadCrmDatabase();
  }
  return Object.values(crmDatabase).find((c) => {
    if (c.phone === cleanPhone) return false;
    if (c.meetingState === 'confirmed') {
      // 1. Precise epoch conflict (within 30 mins)
      if (targetTimestamp && c.meetingTimestamp) {
        const diffMs = Math.abs(c.meetingTimestamp - targetTimestamp);
        if (diffMs < 30 * 60 * 1000) {
          return true;
        }
      }
      // 2. String comparison fallback
      if (c.meetingSlot && slotDetails) {
        const normNew = slotDetails.toLowerCase().replace(/\s+/g, ' ').trim();
        const normOld = c.meetingSlot.toLowerCase().replace(/\s+/g, ' ').trim();
        if (normNew === normOld || normOld.includes(normNew) || normNew.includes(normOld)) {
          return true;
        }
      }
    }
    return false;
  });
}

// Confirm meeting slot from Mukul's !slot command
export async function confirmClientMeetingSlot(targetPhone, slotDetails, sock) {
  loadCrmDatabase();
  const cleanPhone = cleanPhoneNumber(targetPhone);
  let customer = crmDatabase[cleanPhone];

  if (!customer) {
    const raw = String(targetPhone).replace(/[^0-9]/g, '');
    const entry = Object.values(crmDatabase).find((c) => c.phone.includes(raw) || raw.includes(c.phone));
    if (entry) customer = entry;
  }

  if (!customer) {
    customer = getOrCreateCustomerRecord(cleanPhone);
  }

  const parsedTimestamp = parseSlotToTimestamp(slotDetails);
  const existingMeeting = checkMeetingSlotConflict(cleanPhone, slotDetails, parsedTimestamp);

  if (existingMeeting) {
    return {
      success: false,
      message: `⚠️ *MEETING SLOT CONFLICT / CLASH!* ⚠️\n\nMukul sir, slot "${slotDetails}" par pehle se meeting booked hai:\n👤 *Existing Client*: ${existingMeeting.name || 'Client'} (+${existingMeeting.phone})\n🏢 *Business*: ${existingMeeting.businessName || 'Business'}\n\nKripya koi doosra time slot choose karke dobara command bhejein:\n*!slot ${targetPhone} <Naya Time>*`,
    };
  }

  customer.meetingState = 'confirmed';
  customer.meetingSlot = slotDetails;
  customer.meetingTimestamp = parsedTimestamp;
  customer.reminder20mSent = false;
  customer.stage = 'meeting_scheduled';
  customer.lastActive = Date.now();

  const formattedDisplay = parsedTimestamp ? ` (${formatTimestampToSlot(parsedTimestamp)})` : '';
  const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Mukul sir ke sath aapki 1-on-1 Business Growth Audit Call confirm ho gayi hai:
🕒 *Confirmed Slot*: *${slotDetails}*${formattedDisplay}

Mukul sir (+91 88875 21156) directly is time par aapse connect karenge. Agar koi specific report ya questions discuss karne ho, toh aap yahan share kar sakte hain! 🚀`;

  customer.history.push({
    sender: 'ai',
    text: clientMsg,
    timestamp: Date.now(),
  });

  crmDatabase[customer.phone] = customer;
  if (cleanPhone !== customer.phone) {
    crmDatabase[cleanPhone] = customer;
  }
  saveCrmDatabase();

  let clientDelivered = false;
  if (sock && typeof sock.sendMessage === 'function') {
    try {
      const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
      await sock.sendMessage(clientJid, { text: clientMsg });
      clientDelivered = true;
    } catch (err) {
      console.error('[Failed to send meeting confirmation to client via socket]:', err);
    }
  }

  if (!clientDelivered && customer.phone && customer.phone.length <= 13) {
    try {
      await fetch('https://msr-whatsapp-bot.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customer.phone, message: clientMsg }),
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
  }

  return {
    success: true,
    message: `✅ *Meeting Confirmed!*\n\nClient (+${customer.phone}) ko slot "${slotDetails}" WhatsApp par send kar diya gaya hai aur CRM me stage *meeting_scheduled* set ho gaya hai.\n⏰ Meeting se 20 minute pehle aap dono ko automatic reminder ping aayega.`,
  };
}

// Reschedule meeting slot from Mukul's !reschedule command
export async function rescheduleClientMeeting(targetPhone, newSlotDetails, sock) {
  loadCrmDatabase();
  const cleanPhone = cleanPhoneNumber(targetPhone);
  let customer = crmDatabase[cleanPhone];

  if (!customer) {
    const raw = String(targetPhone).replace(/[^0-9]/g, '');
    const entry = Object.values(crmDatabase).find((c) => c.phone.includes(raw) || raw.includes(c.phone));
    if (entry) customer = entry;
  }

  if (!customer) {
    return {
      success: false,
      message: `⚠️ *Client Record Nahi Mila!* (+${cleanPhone}) CRM me register nahi hai.`,
    };
  }

  const parsedTimestamp = parseSlotToTimestamp(newSlotDetails);
  const existingMeeting = checkMeetingSlotConflict(cleanPhone, newSlotDetails, parsedTimestamp);

  if (existingMeeting) {
    return {
      success: false,
      message: `⚠️ *MEETING SLOT CONFLICT!* ⚠️\n\nMukul sir, slot "${newSlotDetails}" par pehle se meeting booked hai:\n👤 *Client*: ${existingMeeting.name || 'Client'} (+${existingMeeting.phone})\n🏢 *Business*: ${existingMeeting.businessName || 'Business'}\n\nKripya koi doosra slot dekar try karein:\n*!reschedule ${targetPhone} <Naya Slot>*`,
    };
  }

  customer.meetingState = 'confirmed';
  customer.meetingSlot = newSlotDetails;
  customer.meetingTimestamp = parsedTimestamp;
  customer.reminder20mSent = false;
  customer.stage = 'meeting_scheduled';
  customer.lastActive = Date.now();

  const formattedDisplay = parsedTimestamp ? ` (${formatTimestampToSlot(parsedTimestamp)})` : '';
  const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Mukul sir ke schedule update ke anusaar aapki 1-on-1 Business Growth Audit Call reschedule kar di gayi hai:
🕒 *New Scheduled Slot*: *${newSlotDetails}*${formattedDisplay}

Mukul sir (+91 88875 21156) is naye time par aapse connect karenge. Kripya apna calendar note kar lein! 🚀`;

  customer.history.push({
    sender: 'ai',
    text: clientMsg,
    timestamp: Date.now(),
  });

  crmDatabase[customer.phone] = customer;
  if (cleanPhone !== customer.phone) {
    crmDatabase[cleanPhone] = customer;
  }
  saveCrmDatabase();

  let clientDelivered = false;
  if (sock && typeof sock.sendMessage === 'function') {
    try {
      const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
      await sock.sendMessage(clientJid, { text: clientMsg });
      clientDelivered = true;
    } catch (err) {
      console.error('[Failed to send reschedule to client via socket]:', err);
    }
  }

  if (!clientDelivered && customer.phone && customer.phone.length <= 13) {
    try {
      await fetch('https://msr-whatsapp-bot.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customer.phone, message: clientMsg }),
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
  }

  return {
    success: true,
    message: `✅ *Meeting Rescheduled!*\n\nClient (+${customer.phone}) ko updated slot "${newSlotDetails}" bhej diya gaya hai aur calendar update ho gaya hai.`,
  };
}

// Delay meeting by N minutes from Mukul's !delay command
export async function delayClientMeeting(targetPhone, delayMinutes, sock) {
  loadCrmDatabase();
  const cleanPhone = cleanPhoneNumber(targetPhone);
  let customer = crmDatabase[cleanPhone];

  if (!customer) {
    const raw = String(targetPhone).replace(/[^0-9]/g, '');
    const entry = Object.values(crmDatabase).find((c) => c.phone.includes(raw) || raw.includes(c.phone));
    if (entry) customer = entry;
  }

  if (!customer) {
    return {
      success: false,
      message: `⚠️ *Client Record Nahi Mila!* (+${cleanPhone}) CRM me register nahi hai.`,
    };
  }

  let baseTs = customer.meetingTimestamp;
  if (!baseTs && customer.meetingSlot) {
    baseTs = parseSlotToTimestamp(customer.meetingSlot);
  }
  if (!baseTs) {
    baseTs = Date.now();
  }

  const newTimestamp = baseTs + delayMinutes * 60 * 1000;
  const newSlotStr = formatTimestampToSlot(newTimestamp);

  const existingMeeting = checkMeetingSlotConflict(cleanPhone, newSlotStr, newTimestamp);
  if (existingMeeting) {
    return {
      success: false,
      message: `⚠️ *MEETING SLOT CONFLICT!* ⚠️\n\nMukul sir, ${delayMinutes} minute delay karne par slot "${newSlotStr}" par doosri meeting booked hai:\n👤 *Client*: ${existingMeeting.name || 'Client'} (+${existingMeeting.phone})\n\nKripya specific slot choose karein:\n*!reschedule ${targetPhone} <Naya Time>*`,
    };
  }

  customer.meetingState = 'confirmed';
  customer.meetingTimestamp = newTimestamp;
  customer.meetingSlot = `${newSlotStr} (+${delayMinutes}m delay)`;
  if (newTimestamp - Date.now() > 20 * 60 * 1000) {
    customer.reminder20mSent = false;
  }
  customer.lastActive = Date.now();

  const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Mukul sir ke schedule update ke anusaar aapki call *${delayMinutes} minute* delay hui hai:
🕒 *Updated Meeting Time*: *${newSlotStr}*

Mukul sir (+91 88875 21156) is naye time par aapse connect karenge. Thank you for your patience! 🚀`;

  customer.history.push({
    sender: 'ai',
    text: clientMsg,
    timestamp: Date.now(),
  });

  crmDatabase[customer.phone] = customer;
  if (cleanPhone !== customer.phone) {
    crmDatabase[cleanPhone] = customer;
  }
  saveCrmDatabase();

  let clientDelivered = false;
  if (sock && typeof sock.sendMessage === 'function') {
    try {
      const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
      await sock.sendMessage(clientJid, { text: clientMsg });
      clientDelivered = true;
    } catch (err) {
      console.error('[Failed to send delay notice to client via socket]:', err);
    }
  }

  if (!clientDelivered && customer.phone && customer.phone.length <= 13) {
    try {
      await fetch('https://msr-whatsapp-bot.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customer.phone, message: clientMsg }),
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
  }

  return {
    success: true,
    message: `✅ *Meeting Delayed by ${delayMinutes} Mins!*\n\nClient (+${customer.phone}) ko updated time "${newSlotStr}" bhej diya gaya hai.`,
  };
}

// Cancel meeting from Mukul's !cancel command
export async function cancelClientMeeting(targetPhone, reason, sock) {
  loadCrmDatabase();
  const cleanPhone = cleanPhoneNumber(targetPhone);
  let customer = crmDatabase[cleanPhone];

  if (!customer) {
    const raw = String(targetPhone).replace(/[^0-9]/g, '');
    const entry = Object.values(crmDatabase).find((c) => c.phone.includes(raw) || raw.includes(c.phone));
    if (entry) customer = entry;
  }

  if (!customer) {
    return {
      success: false,
      message: `⚠️ *Client Record Nahi Mila!* (+${cleanPhone}) CRM me register nahi hai.`,
    };
  }

  customer.meetingState = 'cancelled';
  customer.stage = 'cancelled';
  customer.reminder20mSent = true;
  customer.lastActive = Date.now();

  const reasonText = reason ? `\n*Reason*: ${reason}` : '';
  const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Ek unavoidable schedule update ke karan Mukul sir ke sath aapki scheduled call filhal cancel / postpone karni padi hai.${reasonText}

Hamari team jald hi aapse fresh slot schedule karne ke liye sampark karegi. Inconvenience ke liye kshama chahte hain! 🙏`;

  customer.history.push({
    sender: 'ai',
    text: clientMsg,
    timestamp: Date.now(),
  });

  crmDatabase[customer.phone] = customer;
  if (cleanPhone !== customer.phone) {
    crmDatabase[cleanPhone] = customer;
  }
  saveCrmDatabase();

  let clientDelivered = false;
  if (sock && typeof sock.sendMessage === 'function') {
    try {
      const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
      await sock.sendMessage(clientJid, { text: clientMsg });
      clientDelivered = true;
    } catch (err) {
      console.error('[Failed to send cancel notice to client via socket]:', err);
    }
  }

  if (!clientDelivered && customer.phone && customer.phone.length <= 13) {
    try {
      await fetch('https://msr-whatsapp-bot.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customer.phone, message: clientMsg }),
        signal: AbortSignal.timeout(6000),
      });
    } catch {}
  }

  return {
    success: true,
    message: `❌ *Meeting Cancelled!*\n\nClient (+${customer.phone}) ki meeting cancel kar di gayi hai aur unhe WhatsApp par inform kar diya gaya hai.`,
  };
}

// 20-Minute Pre-Meeting Automated Reminder Engine
export async function processMeeting20mReminders(sock) {
  loadCrmDatabase();
  const now = Date.now();
  let sentCount = 0;

  for (const customer of Object.values(crmDatabase)) {
    if (customer.meetingState !== 'confirmed') continue;
    if (customer.reminder20mSent) continue;

    let targetTs = customer.meetingTimestamp;
    if (!targetTs && customer.meetingSlot) {
      targetTs = parseSlotToTimestamp(customer.meetingSlot);
      if (targetTs) {
        customer.meetingTimestamp = targetTs;
      }
    }

    if (!targetTs) continue;

    const diffMs = targetTs - now;
    // Trigger when meeting is between 0 and 22 minutes away
    if (diffMs > 0 && diffMs <= 22 * 60 * 1000) {
      const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Mukul sir (Founder, MSR Next Gen) ke sath aapki 1-on-1 Business Growth Audit Call agle *20 minutes* me shuru hone wali hai! ⏰

🕒 *Scheduled Time*: *${customer.meetingSlot}*
📱 *Founder WhatsApp*: +91 88875 21156

Mukul sir direct call par aapse connect karenge. Kripya ready rahein aur agar koi specific website ya marketing query discuss karni ho toh yahan share kar sakte hain! 🚀`;

      const mukulMsg = `🔔 *20-MINUTE MEETING REMINDER!* 🔔
━━━━━━━━━━━━━━━━━━━━
Mukul sir, aapki 1-on-1 client call agle *20 minute* me start hone wali hai:

👤 *Client*: ${customer.name || 'Client'} (+${customer.phone})
🏢 *Business*: ${customer.businessName || 'Business Owner'} (${customer.category || 'General'})
🕒 *Scheduled Slot*: *${customer.meetingSlot}*

⚡ *Instant Commands (Copy & Send)*:
• Delay 10 min: *!delay ${customer.phone} 10*
• Delay 20 min: *!delay ${customer.phone} 20*
• Reschedule: *!reschedule ${customer.phone} <Naya Time>*
• Cancel: *!cancel ${customer.phone}*
━━━━━━━━━━━━━━━━━━━━
👉 *Direct Call*: https://wa.me/${customer.phone}`;

      // 1. Send to Client
      if (sock) {
        try {
          const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
          await sock.sendMessage(clientJid, { text: clientMsg });
          customer.history.push({
            sender: 'ai',
            text: `[20m Meeting Reminder]: ${clientMsg}`,
            timestamp: now,
          });
        } catch (err) {
          console.error(`[Failed to send 20m reminder to client ${customer.phone}]:`, err.message);
        }
      }

      // 2. Send to Mukul via Baileys socket
      const primaryJid = `${MUKUL_PRIMARY_ALERT_PHONE}@s.whatsapp.net`;
      const backupJid = `${MUKUL_BACKUP_ALERT_PHONE}@s.whatsapp.net`;

      if (sock && typeof sock.sendMessage === 'function') {
        try { await sock.sendMessage(primaryJid, { text: mukulMsg }); } catch {}
        if (MUKUL_BACKUP_ALERT_PHONE !== MUKUL_PRIMARY_ALERT_PHONE) {
          try { await sock.sendMessage(backupJid, { text: mukulMsg }); } catch {}
        }
      }

      // 3. Dual-delivery fallback via Render Worker
      try {
        await fetch('https://msr-whatsapp-bot.onrender.com/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: MUKUL_PRIMARY_ALERT_PHONE, message: mukulMsg }),
          signal: AbortSignal.timeout(6000),
        });
      } catch {}

      customer.reminder20mSent = true;
      sentCount++;
      console.log(`[20m Meeting Reminder Dispatched for client ${customer.phone}]`);
    }
  }

  if (sentCount > 0) {
    saveCrmDatabase();
  }

  return { sent: sentCount };
}

// =============================================================================
// AGENT 4: EXECUTIVE DOSSIER DISPATCHER TO MUKUL'S WHATSAPP (+91 88875 21156)
// =============================================================================
export async function sendHotLeadDossierToOwner(customer, sock) {
  if (!sock) return;

  const isLid = !customer.phone || customer.phone.length > 13 || customer.isLid;
  const displayPhone = isLid ? 'WhatsApp Direct Chat (LID)' : `+${customer.phone}`;
  const callAction = isLid
    ? `_Direct chat thread available in WhatsApp_`
    : `👉 *1-Tap WhatsApp Call*: https://wa.me/${customer.phone}`;

  const dossierMessage = `🔥 *HOT LEAD QUALIFIED & READY TO CLOSE!*
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name*: ${customer.name || 'Business Owner'}
📱 *Phone*: ${displayPhone}
🏢 *Business*: ${customer.businessName || 'Business Owner'} (${customer.category || 'General'})
💰 *Budget / Spend*: ${customer.budget || 'To be discussed on audit call'}
⚠️ *Core Pain Point*: ${customer.painPoint || 'Needs qualified leads & WhatsApp automation'}
🔗 *Website / IG*: ${customer.websiteUrl || 'Not provided'}
🎯 *Funnel Stage*: *${(customer.stage || 'hot').toUpperCase()}*

📝 *Recent Context*:
${(customer.history || []).slice(-2).map((m) => `• ${m.sender === 'customer' ? 'Client' : 'AI'}: ${m.text}`).join('\n')}

${callAction}
━━━━━━━━━━━━━━━━━━━━
_Dispatched via MSR Multi-Agent Sales Mind_`;

  try {
    const primaryJid = `${MUKUL_PRIMARY_ALERT_PHONE}@s.whatsapp.net`;
    await sock.sendMessage(primaryJid, { text: dossierMessage });
    console.log(`[Executive Dossier Sent to Mukul at ${MUKUL_PRIMARY_ALERT_PHONE}] for lead ${displayPhone}`);

    if (MUKUL_BACKUP_ALERT_PHONE !== MUKUL_PRIMARY_ALERT_PHONE) {
      const backupJid = `${MUKUL_BACKUP_ALERT_PHONE}@s.whatsapp.net`;
      await sock.sendMessage(backupJid, { text: dossierMessage });
    }

    customer.alertSentToOwner = true;
    saveCrmDatabase();
  } catch (err) {
    console.error('[Failed to send dossier to Mukul]:', err);
  }
}

// =============================================================================
// MAIN ENTRY POINT FOR INCOMING WHATSAPP MESSAGES
// =============================================================================
export async function handleIncomingSalesMessage(senderJid, text, sock, contactInfo = {}) {
  let rawPhone = senderJid.split('@')[0];
  let resolvedPhone = rawPhone;

  if (senderJid.endsWith('@lid')) {
    if (contactInfo.participant && !contactInfo.participant.endsWith('@lid')) {
      resolvedPhone = contactInfo.participant.split('@')[0];
    } else {
      resolvedPhone = resolveLidToPhone(rawPhone);
    }
  }

  const cleanPhone = cleanPhoneNumber(resolvedPhone);

  // If sender is Mukul (Owner), do not treat as lead
  if (isOwnerNumber(cleanPhone)) {
    return 'Namaste Mukul sir! MSR Sales AI is running smoothly.';
  }

  const pushName = contactInfo.pushName || sock?.chats?.[senderJid]?.name || '';

  // 1. Get or create customer memory profile
  const customer = getOrCreateCustomerRecord(cleanPhone, pushName);
  customer.senderJid = senderJid;
  if (resolvedPhone.length > 13) {
    customer.isLid = true;
  }

  // 2. Append incoming message to conversation timeline
  customer.history.push({
    sender: 'customer',
    text: text.trim(),
    timestamp: Date.now(),
  });

  // 3. Multi-agent analysis (Psychology, Intent, Links, Budget)
  analyzeCustomerIntent(customer, text);

  // Extract Name & Business Name from incoming text
  const { name: parsedName, businessName: parsedBiz } = extractNameAndBusiness(text, customer);
  if (parsedName && (!customer.name || customer.name === 'Client' || customer.name === 'Business Owner' || /^\+?\d+$/.test(customer.name))) {
    customer.name = parsedName;
  }
  if (parsedBiz && (!customer.businessName || customer.businessName === 'Business' || customer.businessName === 'Business Owner')) {
    customer.businessName = parsedBiz;
  }

  const hasValidName = Boolean(customer.name && customer.name.trim().length >= 2 && !/^(client|customer|user|inbound|business owner)$/i.test(customer.name.trim()));
  const hasValidBiz = Boolean(customer.businessName && customer.businessName.trim().length >= 2 && !/^(business|business owner)$/i.test(customer.businessName.trim()));

  const meetingIntent = isMeetingIntent(text);
  let reply = '';

  // SCENARIO 1: Client was in 'collecting_info' (we asked for Name & Business)
  if (customer.meetingState === 'collecting_info') {
    if (parsedName || parsedBiz || hasValidName || hasValidBiz) {
      customer.meetingState = 'pending_owner_approval';
      customer.stage = 'meeting_requested';

      // Send complete meeting request alert to Mukul
      await sendMeetingRequestToOwner(customer, text, sock);

      const displayName = customer.name || 'ji';
      const displayBiz = customer.businessName ? ` (${customer.businessName})` : '';
      reply = `Thank you ${displayName}${displayBiz}! 🙏 Aapki details note ho gayi hain.

Main Mukul sir (+91 88875 21156) se next available calendar slot check karke agle 5 minute me aapko WhatsApp par confirm karti hu! 🚀`;
    } else {
      reply = `Zaroor! Mukul sir ke sath 1-on-1 strategy call plan karne ke liye, kripya apna *Name* aur *Business / Brand ka Naam* share kar dijiye taaki hum customised audit report prepare kar sakein! 😊`;
    }
  }
  // SCENARIO 2: Client expresses meeting intent for the first time
  else if (meetingIntent) {
    if (!hasValidName || !hasValidBiz) {
      // Must collect Name & Business Name BEFORE alerting Mukul
      customer.meetingState = 'collecting_info';
      customer.stage = 'meeting_requested';

      if (!hasValidName && !hasValidBiz) {
        reply = `Bilkul! Mukul sir ke sath 1-on-1 Business Growth & Ads Audit Call arrange karne se pehle, kripya apna *Shubh Naam* aur *Business / Brand ka Naam* share kar dijiye? 😊 Taaki Mukul sir aapke business ke according customized growth roadmap ready rakh sakein!`;
      } else if (!hasValidBiz) {
        reply = `Zaroor ${customer.name} ji! Call plan karne se pehle kripya aapke *Business / Brand ka Naam* aur category bata dijiye taaki hum accurate audit plan ready kar sakein? 😊`;
      } else {
        reply = `Bilkul! ${customer.businessName} ke liye Mukul sir ke sath call plan karne se pehle, kripya apna *Shubh Naam* share kar dijiye? 😊`;
      }
    } else {
      // Both Name and Business are already known!
      customer.meetingState = 'pending_owner_approval';
      customer.stage = 'meeting_requested';
      await sendMeetingRequestToOwner(customer, text, sock);

      reply = `Bilkul ${customer.name} ji! ${customer.businessName} ke liye Mukul sir ke calendar se available slot check karke main agle 5-10 minute me aapko WhatsApp par confirm karti hu. 😊 Aapke liye morning ka time convenient rahega ya shaam ka?`;
    }
  }
  // SCENARIO 3: Consultative Sales Journey (Meta Ads / Organic Lead)
  else {
    reply = await generateConsultativeSalesReply(customer, text);
    if (isQualifiedForDossier(customer)) {
      await sendHotLeadDossierToOwner(customer, sock);
    }
  }

  // 4. Append AI reply to conversation timeline
  customer.history.push({
    sender: 'ai',
    text: reply,
    timestamp: Date.now(),
  });

  crmDatabase[customer.phone] = customer;
  if (cleanPhone !== customer.phone) {
    crmDatabase[cleanPhone] = customer;
  }
  saveCrmDatabase();
  return reply;
}

// =============================================================================
// AGENT 5: 100% AUTONOMOUS CRON FOLLOW-UP & NURTURE BRAIN
// =============================================================================
export async function processAutomatedFollowUps(sock) {
  if (!sock) return { processed: 0, sent: 0 };
  loadCrmDatabase();

  const now = Date.now();
  const leads = Object.values(crmDatabase);
  let sentCount = 0;

  for (const lead of leads) {
    // Skip if lead is already closed or opted out
    if (lead.stage === 'closed_won' || lead.stage === 'opted_out') continue;

    const lastActive = lead.lastActive || 0;
    const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60);

    // Initial follow-up counters
    if (!lead.followUpCount) lead.followUpCount = 0;
    if (!lead.lastFollowUpAt) lead.lastFollowUpAt = 0;

    const hoursSinceLastFollowUp = (now - lead.lastFollowUpAt) / (1000 * 60 * 60);

    // Only follow up during business hours (9:30 AM to 8:30 PM IST)
    const istHour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
    if (istHour < 9 || istHour >= 21) continue;

    // RULE 1: First Follow-Up (Lead went silent for 2 to 24 hours after discovery/qualifying)
    if (lead.followUpCount === 0 && hoursSinceActive >= 2 && hoursSinceActive <= 48) {
      let nudge = '';
      if (lead.category && lead.category !== 'Unclassified') {
        nudge = `Namaste ${lead.name || 'ji'}! Humne ${lead.category} brands ke liye latest Meta ad hooks check kiye the. Kya aap aaj 10 minute ka free strategy audit schedule karna chahenge?`;
      } else {
        nudge = `Namaste ${lead.name || 'ji'}! Maya here from MSR Next Gen. Kya aapke business ke ads ya WhatsApp automation par koi query thi jisme hum help kar sakein?`;
      }

      try {
        const jid = `${lead.phone}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: nudge });
        lead.history.push({
          sender: 'ai',
          text: `[Auto Follow-Up 1]: ${nudge}`,
          timestamp: now,
        });
        lead.followUpCount = 1;
        lead.lastFollowUpAt = now;
        lead.stage = 'follow_up_active';
        sentCount++;
        console.log(`[Auto Follow-Up #1 Sent to ${lead.phone}]`);
      } catch (err) {
        console.error(`[Follow-Up Error for ${lead.phone}]:`, err.message);
      }
    }
    // RULE 2: Second Follow-Up (48+ hours later with Social Proof case study)
    else if (lead.followUpCount === 1 && hoursSinceLastFollowUp >= 48 && hoursSinceLastFollowUp <= 120) {
      const caseProof = `Ek quick update ${lead.name || 'ji'}: Hamare client Amparo D2C ne pichle 30 dino me WhatsApp AI verification se 28% fake COD orders khatam kiye hain aur 3.8x ROAS reach kiya hai. Aapke brand ke liye bhi similar setup 48 ghante me live ho sakta hai. Call plan karein?`;
      try {
        const jid = `${lead.phone}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: caseProof });
        lead.history.push({
          sender: 'ai',
          text: `[Auto Follow-Up 2]: ${caseProof}`,
          timestamp: now,
        });
        lead.followUpCount = 2;
        lead.lastFollowUpAt = now;
        sentCount++;
        console.log(`[Auto Follow-Up #2 Sent to ${lead.phone}]`);
      } catch (err) {
        console.error(`[Follow-Up #2 Error for ${lead.phone}]:`, err.message);
      }
    }
  }

  saveCrmDatabase();
  return { processed: leads.length, sent: sentCount };
}
