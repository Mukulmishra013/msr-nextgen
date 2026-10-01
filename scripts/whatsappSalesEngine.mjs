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

// Clean phone helper
export function cleanPhoneNumber(phone) {
  let clean = String(phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  return clean;
}

// Get or initialize customer record
export function getOrCreateCustomerRecord(phone, pushName = '') {
  const cleanPhone = cleanPhoneNumber(phone);
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
  return Object.values(crmDatabase).sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
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

  // Detect Budget / Spend
  const budgetMatch = text.match(/(?:budget|spend|kharch|mahine ka)?\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*\s*(?:k|lakh|thousand)?)/i);
  if (budgetMatch && !customer.budget) {
    customer.budget = budgetMatch[0].trim();
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

  // Detect Buying Signals & Advance Funnel Stage
  const isHotSignal =
    text.includes('price') ||
    text.includes('charges') ||
    text.includes('package') ||
    text.includes('start kaise') ||
    text.includes('call schedule') ||
    text.includes('meeting') ||
    text.includes('call me') ||
    text.includes('baat karni');

  if (isHotSignal) {
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
7. If the user writes random characters, gibberish (e.g. 'xyz', 'test', 'asdf'), do NOT assume or claim anything was booked; politely ask how you can help their business.
8. End with ONE thoughtful discovery question to understand their business.`;

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
  if (historyLen > 4) {
    return `Aapka requirement samajh aa gaya hai. Isko live discuss karne aur exact ads strategy finalize karne ke liye kya hum Mukul ke sath aaj 10 minute ki quick call schedule karein?`;
  } else if (historyLen > 2) {
    return `Bilkul! Hum aapke specific business goals ke hisab se customized campaign structure design karte hain. Kya aap apna business name aur monthly estimated budget share karenge taaki main ek clear roadmap share kar saku?`;
  }

  return `Namaste! Main Maya hu, MSR Next Gen se (founded by Mukul Mishra). Hum Meta & Google Ads aur 24/7 AI WhatsApp bots se aapke sales scale karte hain. Aap kis business ke liye marketing ya AI automation explore kar rahe hain?`;
}

// =============================================================================
// AGENT 4: EXECUTIVE DOSSIER DISPATCHER TO MUKUL'S WHATSAPP (+91 88875 21156)
// =============================================================================
export async function sendHotLeadDossierToOwner(customer, sock) {
  if (!sock) return;

  const dossierMessage = `🔥 *HOT LEAD QUALIFIED & READY TO CLOSE!*
━━━━━━━━━━━━━━━━━━━━
👤 *Client Name*: ${customer.name || 'Business Owner'}
📱 *Phone*: +${customer.phone}
🏢 *Business*: ${customer.businessName || 'Business Owner'} (${customer.category})
💰 *Budget / Spend*: ${customer.budget || 'To be discussed on audit call'}
⚠️ *Core Pain Point*: ${customer.painPoint || 'Needs qualified leads & WhatsApp automation'}
🔗 *Website / IG*: ${customer.websiteUrl || 'Not provided'}
🎯 *Funnel Stage*: *${customer.stage.toUpperCase()}*

📝 *Recent Context*:
${customer.history.slice(-2).map((m) => `• ${m.sender === 'customer' ? 'Client' : 'AI'}: ${m.text}`).join('\n')}

👉 *1-Tap WhatsApp Call*: https://wa.me/${customer.phone}
━━━━━━━━━━━━━━━━━━━━
_Dispatched via MSR Multi-Agent Sales Mind_`;

  try {
    const primaryJid = `${MUKUL_PRIMARY_ALERT_PHONE}@s.whatsapp.net`;
    await sock.sendMessage(primaryJid, { text: dossierMessage });
    console.log(`[Executive Dossier Sent to Mukul at ${MUKUL_PRIMARY_ALERT_PHONE}] for lead +${customer.phone}`);

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
export async function handleIncomingSalesMessage(senderJid, text, sock) {
  const cleanPhone = cleanPhoneNumber(senderJid.split('@')[0]);
  const pushName = sock?.chats?.[senderJid]?.name || '';

  // 1. Get or create customer memory profile
  const customer = getOrCreateCustomerRecord(cleanPhone, pushName);

  // 2. Append incoming message to conversation timeline
  customer.history.push({
    sender: 'customer',
    text: text.trim(),
    timestamp: Date.now(),
  });

  // 3. Multi-agent analysis (Psychology, Intent, Links, Budget)
  analyzeCustomerIntent(customer, text);

  // 4. Generate consultative open-ended sales response
  const reply = await generateConsultativeSalesReply(customer, text);

  // 5. Append AI reply to conversation timeline
  customer.history.push({
    sender: 'ai',
    text: reply,
    timestamp: Date.now(),
  });

  saveCrmDatabase();

  // 6. Check if hot lead needs instant executive dossier to Mukul (+91 88875 21156)
  if (customer.stage === 'hot_ready_to_close' && !customer.alertSentToOwner) {
    await sendHotLeadDossierToOwner(customer, sock);
  }

  return reply;
}
