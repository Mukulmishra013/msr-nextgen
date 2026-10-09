import fs from 'fs';
import path from 'path';

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

const CRM_FILE = path.join(process.cwd(), 'data', 'whatsapp_sales_crm.json');
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

// Meeting Intent Detector
export function isMeetingIntent(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    /(?:call|meeting|baat|connect|audit|slot)\s*(?:karo|karni|karein|schedule|book|fix|time|kab|chahiye|hoga|karna)/i.test(t) ||
    /(?:free 15-minute|growth audit|1-on-1|zoom|google meet)/i.test(t) ||
    /(?:aaj call|kal call|kab baat|phone call|call plan)/i.test(t)
  );
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

  const systemPrompt = `You are Maya, the 24/7 AI Growth Assistant for "MSR Next Gen", founded by Mukul Mishra (Growth Marketing & 24/7 AI WhatsApp Automation Agency in India).
You are speaking directly with a business owner on WhatsApp representing Mukul and MSR Next Gen.
CRITICAL PERSONA RULES:
1. NEVER claim to be Mukul Mishra himself. NEVER say "Main Mukul hu" or "Mera naam Mukul hai".
2. If asked who you are or who runs the agency, introduce yourself as Maya (AI Growth Assistant at MSR Next Gen) and explain that Mukul Mishra is the founder and Growth Architect.
3. Warm, natural, consultative Hinglish (like an experienced growth partner).
4. Concise: 2 to 3 sentences maximum per message. No robotic brochures or long walls of text.
5. Packages start around ₹15,000/mo. Mention Free 15-Minute Business Growth Audit with Mukul when relevant.
6. Real proof: Amparo D2C (₹2.4L revenue in 30 days, 3.8x ROAS, -28% RTO drop), Nacho G cafe (+40% weekend jump).

SPECIAL RESTAURANT & CAFE SALES EXPERTISE (Ground from our Complete Profile & Packages PDF):
- We specialize in 3 Restaurant Packages:
  * STARTER (Visibility): Google Business Profile SEO + 4 Google Posts + Social Reels (4/mo) + Reviews growth system via QR + WhatsApp + Monthly report.
  * GROWTH (Customer Magnet - Most Popular): Starter + 8 Reels + Meta/Google Ads (2-5km hyper-local targeting) + Birthday/Anniversary auto-offers + Win-Back inactive guests + 24/7 AI WhatsApp Bot + CRM.
  * PREMIUM (Full Automation): Growth + 12 Reels + Food Photography Shoot + Custom Website & Direct WhatsApp Ordering + AI Calling Agent + Weekly Reports + Dedicated Manager.
- SMART PDF BROCHURE SHARING:
  * We have our official high-value PDF: "MSR Next Gen Restaurant Growth System & Packages" (https://msrnextgen.com/MSR_Next_Gen_Restaurant_Growth_Pitch.pdf).
  * DO NOT SPAM the PDF link on the first message.
  * Share the link SMARTLY: ONLY when a restaurant/cafe owner specifically asks for "packages", "pricing", "quotation", "brochure", "profile", "services list", or asks "kya kya service dete ho detail me bhejo".
  * When sharing, say: "Humne restaurants aur cafes ke liye complete system PDF ready ki hai, aap yahan review kar sakte hain: https://msrnextgen.com/MSR_Next_Gen_Restaurant_Growth_Pitch.pdf — isme Starter, Growth aur Premium sabhi packages detailed hain."
7. If the user writes random characters, gibberish (e.g. 'xyz', 'test', 'asdf'), do NOT assume or claim anything was booked; politely ask how you can help their business.
8. End with ONE thoughtful discovery question to understand their business.
9. MEETING / CALL SCHEDULING FLOW:
- When a client asks to book a meeting, call, or discuss directly with Mukul ("call schedule karo", "baat karni hai", "meeting fix karo", "call me"):
  * NEVER confirm an exact slot yourself.
  * Inform them that you are checking Mukul sir's calendar and will confirm the slot in 5-10 minutes.
  * Ask whether morning or evening works better for them.`;

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
    await sock.sendMessage(primaryJid, { text: alertMessage });
    if (MUKUL_BACKUP_ALERT_PHONE !== MUKUL_PRIMARY_ALERT_PHONE) {
      const backupJid = `${MUKUL_BACKUP_ALERT_PHONE}@s.whatsapp.net`;
      await sock.sendMessage(backupJid, { text: alertMessage });
    }
  } catch (err) {
    console.error('[Meeting Alert to Mukul failed]:', err);
  }
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

  customer.meetingState = 'confirmed';
  customer.meetingSlot = slotDetails;
  customer.stage = 'meeting_scheduled';
  customer.lastActive = Date.now();

  const clientMsg = `Namaste ${customer.name || 'ji'}! 🙏

Mukul sir ke sath aapki 1-on-1 Business Growth Audit Call confirm ho gayi hai:
🕒 *Confirmed Slot*: *${slotDetails}*

Mukul sir (+91 88875 21156) directly is time par aapse connect karenge. Agar koi specific report ya questions discuss karne ho, toh aap yahan share kar sakte hain! 🚀`;

  customer.history.push({
    sender: 'ai',
    text: clientMsg,
    timestamp: Date.now(),
  });
  saveCrmDatabase();

  if (sock) {
    try {
      const clientJid = customer.senderJid || `${customer.phone}@s.whatsapp.net`;
      await sock.sendMessage(clientJid, { text: clientMsg });
    } catch (err) {
      console.error('[Failed to send meeting confirmation to client]:', err);
    }
  }

  return {
    success: true,
    message: `✅ *Meeting Confirmed!*\n\nClient (+${customer.phone}) ko slot "${slotDetails}" WhatsApp par send kar diya gaya hai aur CRM me stage *meeting_scheduled* set ho gaya hai.`,
  };
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

  // 4. Generate consultative open-ended sales response & handle meeting intent
  let reply = '';
  if (isMeetingIntent(text)) {
    customer.meetingState = 'pending_owner_approval';
    customer.stage = 'meeting_requested';
    reply = `Bilkul! Main Mukul sir ke calendar se slot verify karke aapko agle 5-10 minute me confirm karti hu. 😊\n\nAapke liye morning ka time convenient rahega ya shaam ka?`;
    await sendMeetingRequestToOwner(customer, text, sock);
  } else {
    reply = await generateConsultativeSalesReply(customer, text);
    if (isQualifiedForDossier(customer)) {
      await sendHotLeadDossierToOwner(customer, sock);
    }
  }

  // 5. Append AI reply to conversation timeline
  customer.history.push({
    sender: 'ai',
    text: reply,
    timestamp: Date.now(),
  });

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
