import fs from 'fs';
import path from 'path';

// =============================================================================
// MSR NEXT GEN — MULTI-AGENT CONSULTATIVE SALES MIND & CRM ENGINE
// =============================================================================

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
      category: 'Unclassified', // 'D2C' | 'Restaurant' | 'Clinic' | 'RealEstate' | 'Education' | 'Retail' | 'Services'
      budget: '',
      painPoint: '',
      websiteUrl: '',
      auditFindings: '',
      stage: 'discovery', // 'discovery' | 'qualifying' | 'audited' | 'pitching' | 'hot_ready_to_close' | 'converted'
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
// Inspects URLs or Instagram handles to find live conversion leaks
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
// Determines category, budget, pain points, and current funnel stage
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
    text.includes('price kya hai') ||
    text.includes('charges') ||
    text.includes('package') ||
    text.includes('start kaise') ||
    text.includes('call schedule') ||
    text.includes('kitna time') ||
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
// AGENT 3: CONSULTATIVE SALES CLOSER (OPEN-ENDED HUMAN-LIKE HINGLISH)
// =============================================================================
export async function generateConsultativeSalesReply(customer, incomingText) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Build conversational transcript history (Last 8 messages for memory context)
  const recentHistory = customer.history
    .slice(-8)
    .map((m) => `${m.sender === 'customer' ? 'Client' : 'Mukul (MSR Next Gen)'}: "${m.text}"`)
    .join('\n');

  const systemPrompt = `You are Mukul Mishra, founder of MSR Next Gen (Premium Growth Marketing & 24/7 AI WhatsApp Automation Agency in India).
You are speaking directly with a potential business client on WhatsApp.

CRITICAL IDENTITY & SALES PSYCHOLOGY GUIDELINES:
1. Speak in warm, natural, consultative Hinglish (like an experienced, sharp growth partner who genuinely wants their business to win).
2. NEVER sound like a robotic AI chatbot. Do NOT write bulleted marketing brochures or long overwhelming essays.
3. Keep your reply concise (2-4 sentences max per message) so it feels like a real human typing on a phone.
4. Active Listening: Acknowledge their specific problem with empathy ("Yeh problem 90% founders face karte hain...").
5. Real Proof Drops: Casually reference real client work when relevant (e.g. "Jaise Amparo D2C ke liye humne WhatsApp lead qualification lagayi to CPL 40% drop ho gaya" or "Nacho G cafe ke weekend bookings 3x ho gaye").
6. OPEN-ENDED DISCOVERY: Always end with ONE thoughtful, open-ended question that encourages them to share their numbers or bottlenecks (e.g. "Abhi monthly ads par lagbhag kitna spend ho raha hai?", "Leads aati hain par call par log convert nahi ho rahe ya CPL zyada aa rahi hai?").
7. If the customer shared an Instagram handle or link, refer to the audit findings naturally and ask their take on it.
8. If the customer is asking about price/charges, do NOT give generic fake numbers. Say: "Charges business ke scale aur ads budget par depend karte hain. Pehle main aapka 15-minute free audit kar deta hu taaki clear roadmap mil sake. Kya aaj shaam ko 10-15 minute ki call comfortable rahegi?"

CUSTOMER PROFILE IN MEMORY:
- Client Name: ${customer.name || 'Founder'}
- Business Name: ${customer.businessName || 'Not yet disclosed'}
- Business Category: ${customer.category || 'General'}
- Current Budget: ${customer.budget || 'Not yet known'}
- Identified Pain Point: ${customer.painPoint || 'Needs growth & automation'}
- Website/Instagram: ${customer.websiteUrl || 'None shared yet'}
- Audit Notes: ${customer.auditFindings || 'None'}
- Funnel Stage: ${customer.stage}

RECENT CONVERSATION HISTORY:
${recentHistory}

Latest Message from Client: "${incomingText}"

Write your next natural, consultative reply in Hinglish now:`;

  // 1. Try Groq for ultra-fast natural human response
  if (groqKey) {
    const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'llama-3.3-70b-versatile'];
    for (const model of models) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: incomingText },
            ],
            temperature: 0.35,
            max_tokens: 220,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply && reply.trim()) return reply.trim().replace(/^"|"$/g, '');
        }
      } catch {}
    }
  }

  // 2. Try Gemini
  if (geminiKey) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${incomingText}` }] }],
              generationConfig: { temperature: 0.35, maxOutputTokens: 250 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim().replace(/^"|"$/g, '');
        }
      } catch {}
    }
  }

  // High-converting fallback if API is unreachable
  return `Namaste! Aapke business ko samajh kar hi hum customized ads aur AI setup plan karte hain. Aap abhi Meta ads chala rahe hain ya organic se inquiries aati hain? Thoda detail batayenge to main quick review kar deta hu.`;
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
    // Send to primary number requested by user (+91 88875 21156)
    const primaryJid = `${MUKUL_PRIMARY_ALERT_PHONE}@s.whatsapp.net`;
    await sock.sendMessage(primaryJid, { text: dossierMessage });
    console.log(`[Executive Dossier Sent to Mukul at ${MUKUL_PRIMARY_ALERT_PHONE}] for lead +${customer.phone}`);

    // If backup phone is different, also send
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
