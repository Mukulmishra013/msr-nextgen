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
// KEYLESS CLOUD LLM (POLLINATIONS AI GPT-4o-MINI ENGINE)
// =============================================================================
async function callPollinationsAI(systemPrompt, incomingText, recentHistory) {
  try {
    const promptToSend = encodeURIComponent(
      `Conversation History:\n${recentHistory}\n\nClient's Message: "${incomingText}"\n\nReply as Mukul Mishra (MSR Next Gen) in warm, natural Hinglish (2-3 sentences max, consultative, human-like):`
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
  } catch {
    // fallback
  }
  return null;
}

// =============================================================================
// AGENT 3: CONSULTATIVE SALES CLOSER (OPEN-ENDED HUMAN-LIKE HINGLISH)
// =============================================================================
export async function generateConsultativeSalesReply(customer, incomingText) {
  const q = incomingText.toLowerCase().trim();
  const historyLen = customer.history.length;

  // 1. SPECIFIC DOMAIN INTENTS (Immediate high-priority consultative answers)

  // A. Pricing / Packages / Charges / Cost
  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('charge') ||
    q.includes('cost') ||
    q.includes('kharcha') ||
    q.includes('package') ||
    q.includes('kitna') ||
    q.includes('fees') ||
    q.includes('rate')
  ) {
    return `Hamare Meta/Google Ads aur 24/7 AI WhatsApp bot management packages ₹15,000/month se start hote hain.\n\nIsme included hai:\n✓ High-converting ad creatives & video reel scripting\n✓ Laser-targeted local audience & daily ROAS optimization\n✓ 24/7 AI WhatsApp bot automation (instant reply & booking)\n\nAapka monthly ads budget lagbhag kitna rehta hai ya kis business ke liye run karna chahte hain?`;
  }

  // B. Meta & Google Ads / Advertising / Campaigns
  if (
    q.includes('meta') ||
    q.includes('google') ||
    q.includes('ads') ||
    q.includes('ad ') ||
    q.includes('campaign') ||
    q.includes('marketing') ||
    q.includes('kaise help')
  ) {
    return `Meta & Google Ads se aapke business ko daily verified customers milte hain:\n1. 🎯 Hyper-Local Targeting: Aapke store ya city ke serious buyers tak direct video ads pahunchte hain.\n2. 📲 Direct WhatsApp Funnel: Har ad click seedhe aapke WhatsApp par aati hai jahan bot 2 second me lead qualify karta hai.\n\nAap abhi khud ads run kar rahe hain ya fresh start karna chahte hain?`;
  }

  // C. WhatsApp Bot / Automation / Features
  if (
    q.includes('whatsapp') ||
    q.includes('bot') ||
    q.includes('agent') ||
    q.includes('automation') ||
    q.includes('kaam karta hai') ||
    q.includes('feature')
  ) {
    return `Hamara 24/7 AI WhatsApp Bot aapke business number par live hokar:\n• ⚡ Raat ke 2 baje bhi 2 second me instant customer answers deta hai\n• 📦 Catalogs, pricing aur payment links automatically share karta hai\n• 🛡️ Fake orders filter karke bookings/orders lock karta hai\n\nAapke business me roz lagbhag kitni customer inquiries aati hain?`;
  }

  // D. Free 15-Minute Audit / Consultation / Call
  if (
    q.includes('audit') ||
    q.includes('free audit') ||
    q.includes('call') ||
    q.includes('meeting') ||
    q.includes('baat karni')
  ) {
    return `Free 15-Minute Business Growth Audit bilkul complimentary hai! 🚀\n\nMain aapke current ads, Instagram page aur website ka live audit karke top 3 conversion leaks identify karunga.\n\nKya aaj shaam ya kal subah 10-15 minute ki call convenient rahegi aapke liye?`;
  }

  // E. Proof / Case Studies / Clients / Results
  if (
    q.includes('proof') ||
    q.includes('result') ||
    q.includes('amparo') ||
    q.includes('case study') ||
    q.includes('client') ||
    q.includes('kaam dikhao')
  ) {
    return `Hamare verified client results:\n• Amparo (D2C Skincare): ₹2.4 Lakhs revenue in 30 days, 3.8x ROAS aur -28% RTO drop.\n• Nacho G (Mexican Cafe): Weekend footfall me 40% jump.\n• The Bunker Cafe: 1+ year regular clients.\n\nHum real bank balance growth deliver karte hain! Aapka business kis category me hai?`;
  }

  // F. Doctor / Clinic / Healthcare
  if (q.includes('clinic') || q.includes('doctor') || q.includes('patient') || q.includes('opd') || q.includes('hospital')) {
    return `Clinics aur doctors ke liye hamara CareSlot AI Agent 24/7 patient appointments book karta hai aur automated tokens & clinic GPS directions WhatsApp par bhejta hai. OPD rush 60% smooth ho jata hai! Aapka clinic kis specialization me hai?`;
  }

  // G. Restaurant / Cafe / Dining
  if (q.includes('restaurant') || q.includes('cafe') || q.includes('food') || q.includes('table') || q.includes('dining')) {
    return `Restaurants aur cafes ke liye hamara SmartDine AI Agent WhatsApp par automated table reservations aur digital food menu distribution handle karta hai — bina kisi staff ke! Aapka restaurant kahan located hai?`;
  }

  // H. Greetings: Hi, Hello, Hlo, Hey, Namaste, Kon ho
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hlo' ||
    q === 'hey' ||
    q === 'namaste' ||
    q.includes('kon ho') ||
    q.includes('who are you')
  ) {
    return `Namaste! 🙏 Main Mukul Mishra hu, founder of MSR Next Gen.\n\nHum Indian businesses aur D2C brands ke liye high-converting Meta/Google Ads aur 24/7 AI WhatsApp Agents banate hain jisse daily qualified leads aati hain.\n\nAap kis business ke liye marketing ya automation dekh rahe hain?`;
  }

  // 2. REAL CLOUD LLM CONVERSATION (Pollinations GPT-4o-mini)
  const recentHistory = customer.history
    .slice(-6)
    .map((m) => `${m.sender === 'customer' ? 'Client' : 'Mukul'}: "${m.text}"`)
    .join('\n');

  const systemPrompt = `You are Mukul Mishra, founder of MSR Next Gen (Premium Growth Marketing & 24/7 AI WhatsApp Automation Agency in India).
You are speaking directly with a business owner on WhatsApp.
CRITICAL GUIDELINES:
1. Warm, natural, consultative Hinglish (like an experienced growth partner).
2. Concise: 2 to 3 sentences maximum per message. No robotic brochures or long walls of text.
3. Packages start around ₹15,000/mo. Mention Free 15-Minute Audit.
4. Real proof: Amparo D2C (₹2.4L revenue in 30 days, 3.8x ROAS), Nacho G cafe.
5. End with ONE thoughtful discovery question to understand their business.`;

  const aiReply = await callPollinationsAI(systemPrompt, incomingText, recentHistory);
  if (aiReply) return aiReply;

  // 3. Dynamic Contextual Fallbacks (Ensures zero repetitive responses)
  if (historyLen > 4) {
    return `Aapka requirement samajh aa gaya hai. Isko live discuss karne aur exact ads strategy finalize karne ke liye kya hum aaj 10 minute ki quick phone call ya WhatsApp call schedule karein?`;
  } else if (historyLen > 2) {
    return `Bilkul! Hum aapke specific business goals ke hisab se customized campaign structure design karte hain. Kya aap apna business name aur monthly estimated budget share karenge taaki main ek clear roadmap share kar saku?`;
  }

  return `Namaste! MSR Next Gen me aapka swagat hai. Hum Meta & Google Ads aur 24/7 AI WhatsApp bots se aapke sales scale karte hain. Aap kis business ke liye marketing ya AI automation explore kar rahe hain?`;
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
