/**
 * MSR Next Gen — Dual-Engine WhatsApp Automation Worker
 *
 * Runs 2 Completely Isolated WhatsApp Sockets:
 * 1. ADMIN PERMANENT SOCKET (Port 5001 - Session: .whatsapp_auth):
 *    - Mukul / MSR Next Gen Official Business WhatsApp (+91 95193 42440).
 *    - NEVER disconnected or reset by visitors.
 *    - 24/7 lead handling, owner alerts, and agency growth autopilot.
 *
 * 2. CUSTOMER 5-MINUTE SANDBOX SOCKET (Session: .whatsapp_auth_sandbox):
 *    - Dedicated for website visitors on /agents.
 *    - Generates real on-demand WhatsApp pairing QR codes for any visitor's phone.
 *    - Connects visitor's phone for 5 minutes (300s) to demonstrate live AI auto-reply.
 *    - Auto-disconnects and completely cleans sandbox credentials after 5 minutes.
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import {
  handleIncomingSalesMessage,
  getAllCrmLeads,
  updateLeadRecord,
  deleteLeadRecord,
  confirmClientMeetingSlot,
  resolveLidToPhone,
  isOwnerNumber,
  cleanPhoneNumber,
  processAutomatedFollowUps,
} from './whatsappSalesEngine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_AUTH_DIR = path.resolve(__dirname, '../.whatsapp_auth');
const SANDBOX_AUTH_DIR = path.resolve(__dirname, '../.whatsapp_auth_sandbox');
const RESTAURANT_AUTH_DIR = path.resolve(__dirname, '../.whatsapp_auth_restaurant');

if (!fs.existsSync(ADMIN_AUTH_DIR)) fs.mkdirSync(ADMIN_AUTH_DIR, { recursive: true });
if (!fs.existsSync(SANDBOX_AUTH_DIR)) fs.mkdirSync(SANDBOX_AUTH_DIR, { recursive: true });
if (!fs.existsSync(RESTAURANT_AUTH_DIR)) fs.mkdirSync(RESTAURANT_AUTH_DIR, { recursive: true });

const PORT = process.env.PORT || 5001;
const logger = pino({ level: 'silent' });

function getEnvConfig() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    const env = {};
    raw.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    });
    return env;
  }
  return process.env;
}

const DATA_DIR = path.resolve(__dirname, '../data');
const MEMORY_FILE = path.join(DATA_DIR, 'agent_memory.json');

function loadAgentMemory() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(MEMORY_FILE)) {
      const initial = {
        learnedFacts: [
          'MSR Next Gen specializes in high-ROI Meta Ads (Instagram/FB) and Google Ads for Indian businesses and D2C brands.',
          'Founder is Mukul (Growth Architect).',
          'Case study: Amparo D2C generated ₹2.4 Lakhs in 30 days with 3.8x ROAS.',
          'Management packages start at ₹15,000/month depending on ad spend and scope.',
          'Free 15-Minute Business Growth & Funnel Audit available on WhatsApp.',
          'Official contact WhatsApp: +91 95193 42440, Customer Care: +91 88875 21156, Email: msbestshoopingpro@gmail.com.',
        ],
        optedOutNumbers: [],
        conversations: {},
      };
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch {
    return { learnedFacts: [], optedOutNumbers: [], conversations: {} };
  }
}

function saveAgentMemory(mem) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2), 'utf8');
  } catch {}
}

async function generateAIWhatsAppReply(userQuery, senderJid, personaType = 'admin') {
  const env = getEnvConfig();
  const groqKey = env.GROQ_API_KEY;
  const geminiKey = env.GEMINI_API_KEY;

  const memory = loadAgentMemory();
  const learnedContext =
    memory.learnedFacts.length > 0
      ? `\nVerified Knowledge & Training:\n${memory.learnedFacts.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
      : '';

  const isSandbox = personaType === 'sandbox';
  const isRestaurant = personaType === 'restaurant';

  const nowIST = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  let systemPrompt = '';
  if (isRestaurant) {
    systemPrompt = `You are Chef Maya, the friendly 24/7 AI Concierge & Hostess for "The Grand Bistro & Craft Kitchen".
Current Live Indian Standard Time (IST): ${nowIST}.
Today's Kitchen Operating Status: Open daily from 12:00 PM to 11:30 PM (Serving Lunch, High Tea & Dinner).
Signature Menu Highlights:
- Truffle Malai Paneer Tikka (₹380)
- Burrata Sourdough Pizza (₹540)
- Smoked Butter Chicken & Garlic Naan (₹580)
- Belgian Chocolate Lava Cake (₹249)
- Craft Sangria & Mocktails (₹220 - ₹280)
Special Features: Instant QR Table Ordering, Chef's pairings, VIP Birthday celebrations with complimentary Lava Cake + 15% discount.
If the person chatting is a restaurant owner inquiring about how to get this system or packages for their cafe, warmly inform them: "MSR Next Gen helps cafes & restaurants set up this exact system. Check our growth packages here: https://msrnextgen.com/MSR_Next_Gen_Restaurant_Growth_Pitch.pdf or WhatsApp founder Mukul at +91 95193 42440."
CRITICAL GUIDELINES:
1. Warm, gracious hospitality in Hinglish or English (match customer language).
2. If customer asks about current time, date, day of week, schedule, open/close status, or table booking, answer accurately using the Live IST time above (${nowIST}).
3. Keep responses concise (2 to 3 sentences max) with delightful food emojis.
4. If they want to reserve a table or order, warmly guide them to table booking or our QR menu.`;
  } else if (isSandbox) {
    systemPrompt = `You are the MSR Next Gen AI Auto-Pilot assistant running on a 5-minute LIVE DEMO on this business WhatsApp number.
Explain that you are an AI agent responding in real-time to show how fast and smart MSR Next Gen automation works.
Services: Meta Ads, Google Ads, 24/7 AI WhatsApp customer booking.
Keep answers warm, polite, in natural Hinglish or English (2 to 3 sentences max).
Guide them to visit https://msrnextgen.com or WhatsApp Mukul at +91 95193 42440.`;
  } else {
    systemPrompt = `You are Maya, the 24/7 AI Growth Assistant for "MSR Next Gen" (India's premier Digital Marketing & AI Agency founded by Mukul).
Services: High-converting Meta (Instagram/FB) Ads, Google Ads, and 24/7 AI WhatsApp Agents that qualify leads and automate customer orders for Indian businesses and D2C brands.
Contact email: msbestshoopingpro@gmail.com, Customer Care: +91 88875 21156, Sales/Owner: +91 95193 42440.${learnedContext}
CRITICAL RULES:
1. Warm, polite, professional Hinglish or English (match user language). NEVER say "Main Mukul hu" or pretend to be Mukul; you are Maya representing founder Mukul Mishra and MSR Next Gen.
2. Answer directly and concisely (2 to 4 sentences).
3. IMPORTANT: Always complete your sentences fully. Never stop abruptly.
4. Guide them toward booking a free 15-minute business growth audit with Mukul.`;
  }

  // Try Groq
  if (groqKey) {
    const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
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
              { role: 'user', content: userQuery },
            ],
            temperature: 0.3,
            max_tokens: 450,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply && reply.trim()) return reply.trim();
        }
      } catch {}
    }
  }

  // Try Gemini
  if (geminiKey) {
    const models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: `${systemPrompt}\nEnsure reply ends with a complete sentence.` }] },
              contents: [{ parts: [{ text: userQuery }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 450 },
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch {}
    }
  }

  // Try Keyless Pollinations AI
  try {
    const url = `https://text.pollinations.ai/${encodeURIComponent(userQuery)}?system=${encodeURIComponent(systemPrompt)}&model=openai`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10 && !text.trim().startsWith('{')) {
        return text.trim();
      }
    }
  } catch {}

  if (personaType === 'restaurant') {
    return 'Namaste! Main The Grand Bistro ki AI Concierge Chef Maya hu. Humara restaurant open hai (12 PM - 11:30 PM). Table booking ya signature menu recommendations ke liye bataiye, main aapki kya madad kar sakti hu? 🍽️✨';
  }

  return 'Namaste! Main MSR Next Gen ki AI Assistant hu. Hum aapke business ke liye high-converting Meta Ads aur 24/7 AI WhatsApp Chatbots setup karte hain. Free 15-minute audit ke liye +91 95193 42440 par sampark karein!';
}

// =============================================================================
// ENGINE 1: ADMIN PERMANENT WHATSAPP SOCKET (+91 95193 42440)
// =============================================================================
let adminSock = null;
let adminQrCode = null;
let adminStatus = 'initializing'; // 'initializing' | 'qr_ready' | 'connected' | 'disconnected'
let adminUser = null;
let adminLastError = null;
const adminProcessedMsgIds = new Set();
let isAutoReplyPaused = false;
const lastAdminReplyPerUser = new Map();
let isAdminStarting = false;

// Sequential FIFO Outgoing Message Queue with anti-ban humanized pacing
const adminOutboundQueue = [];
let isProcessingAdminQueue = false;
let lastAdminOutboundTimestamp = 0;

export async function enqueueAdminMessage(sock, jid, messageContent, options = {}) {
  return new Promise((resolve, reject) => {
    adminOutboundQueue.push({ sock, jid, messageContent, options, resolve, reject });
    processAdminOutboundQueue();
  });
}

async function processAdminOutboundQueue() {
  if (isProcessingAdminQueue || adminOutboundQueue.length === 0) return;
  isProcessingAdminQueue = true;

  while (adminOutboundQueue.length > 0) {
    const item = adminOutboundQueue.shift();
    try {
      const activeSock = item.sock || adminSock;
      if (!activeSock) {
        item.reject(new Error('Admin WhatsApp socket inactive'));
        continue;
      }

      // 1. Maintain safe gap between outgoing messages (3.5s - 5.5s)
      const now = Date.now();
      const elapsed = now - lastAdminOutboundTimestamp;
      const minInterval = 3500 + Math.floor(Math.random() * 2000);
      if (elapsed < minInterval) {
        await new Promise((r) => setTimeout(r, minInterval - elapsed));
      }

      // 2. Human typing indicator (2.5s - 4.5s)
      try {
        await activeSock.sendPresenceUpdate('composing', item.jid);
      } catch {}
      const typingTime = 2500 + Math.floor(Math.random() * 2000);
      await new Promise((r) => setTimeout(r, typingTime));

      try {
        await activeSock.sendPresenceUpdate('paused', item.jid);
      } catch {}

      // 3. Dispatch message
      const res = await activeSock.sendMessage(item.jid, item.messageContent, item.options);
      lastAdminOutboundTimestamp = Date.now();
      item.resolve(res);
    } catch (err) {
      console.error('[Admin Outbound Queue Error]:', err.message);
      item.reject(err);
    }
  }

  isProcessingAdminQueue = false;
}

async function startAdminWhatsAppSocket() {
  if (isAdminStarting || adminStatus === 'connected') return;
  isAdminStarting = true;
  adminStatus = 'initializing';
  adminQrCode = null;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(ADMIN_AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    adminSock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['MSR Admin AI', 'Chrome', '120.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000,
    });

    adminSock.ev.on('creds.update', saveCreds);

    adminSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        adminStatus = 'qr_ready';
        adminLastError = null;
        try {
          adminQrCode = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        } catch {}
      }

      if (connection === 'close') {
        isAdminStarting = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        adminStatus = 'disconnected';
        adminQrCode = null;
        adminLastError = lastDisconnect?.error?.message || 'Disconnected';

        console.log(`[Admin WhatsApp Closed] Status: ${statusCode}. Reconnecting in 3s...`);
        if (adminSock) {
          try { adminSock.end(); } catch {}
          adminSock = null;
        }
        if (isLoggedOut || statusCode === 408 || String(adminLastError).includes('QR refs')) {
          try {
            fs.rmSync(ADMIN_AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(ADMIN_AUTH_DIR, { recursive: true });
          } catch {}
        }
        setTimeout(() => {
          if (adminStatus === 'disconnected') {
            startAdminWhatsAppSocket();
          }
        }, 3000);
      } else if (connection === 'open') {
        isAdminStarting = false;
        adminStatus = 'connected';
        adminQrCode = null;
        adminLastError = null;
        adminUser = adminSock.user;
        console.log(`\n[Admin WhatsApp Live!] Permanent Session Active: ${adminSock.user?.id || 'Connected'}\n`);
      }
    });

    adminSock.ev.on('messages.upsert', async (m) => {
      try {
        const msg = m.messages?.[0];
        if (!msg || !msg.message || !msg.key?.remoteJid) return;

        const isFromMe = Boolean(msg.key.fromMe);
        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          '';

        if (!text.trim()) return;

        const trimmedText = text.trim();
        if (isFromMe && !trimmedText.toLowerCase().startsWith('!test')) {
          return;
        }

        const effectiveText = isFromMe
          ? trimmedText.replace(/^!test\s*/i, '').trim() || 'hi'
          : trimmedText;

        const messageId = msg.key.id;
        if (adminProcessedMsgIds.has(messageId)) return;
        adminProcessedMsgIds.add(messageId);
        setTimeout(() => adminProcessedMsgIds.delete(messageId), 15 * 60 * 1000);

        const senderJid = msg.key.remoteJid;
        if (senderJid.endsWith('@g.us') || senderJid === 'status@broadcast') return;

        // Resolve LID to real phone number if Baileys received an LID remoteJid
        let resolvedPhone = senderJid.split('@')[0];
        if (senderJid.endsWith('@lid')) {
          const part = msg.key.participant || msg.participant;
          if (part && !part.endsWith('@lid')) {
            resolvedPhone = part.split('@')[0];
          } else {
            resolvedPhone = resolveLidToPhone(resolvedPhone, ADMIN_AUTH_DIR);
          }
        }

        const senderClean = cleanPhoneNumber(resolvedPhone);
        const isOwner = isOwnerNumber(senderClean) || isOwnerNumber(resolvedPhone);
        const memory = loadAgentMemory();

        // OWNER COMMAND: !slot <Client Phone> <Date & Time>
        if (isOwner && trimmedText.startsWith('!slot')) {
          const slotMatch = trimmedText.match(/^!slot\s+(\+?\d[\d\s-]{8,15})\s+(.+)$/i);
          if (!slotMatch) {
            await enqueueAdminMessage(adminSock, senderJid, {
              text: `⚠️ *Format Galat Hai!*\n\nSahi format:\n*!slot <Customer Phone> <Date & Time>*\n\nExample:\n!slot 9519342440 Kal shaam 5:00 PM`,
            });
            return;
          }

          const targetRawPhone = slotMatch[1];
          const slotDetails = slotMatch[2].trim();
          const result = await confirmClientMeetingSlot(targetRawPhone, slotDetails, adminSock);
          await enqueueAdminMessage(adminSock, senderJid, { text: result.message });
          return;
        }

        if (isOwner && trimmedText.startsWith('!learn')) {
          const fact = trimmedText.replace(/^!learn\s*/i, '').trim();
          if (fact) {
            memory.learnedFacts.push(fact);
            saveAgentMemory(memory);
            await enqueueAdminMessage(adminSock, senderJid, { text: `✅ *Learned & Saved!* "${fact}"` });
            return;
          }
        }

        if (isOwner && trimmedText === '!pause') {
          isAutoReplyPaused = true;
          await enqueueAdminMessage(adminSock, senderJid, { text: '⏸️ *AI Auto-Reply Paused.*' });
          return;
        }

        if (isOwner && trimmedText === '!resume') {
          isAutoReplyPaused = false;
          await enqueueAdminMessage(adminSock, senderJid, { text: '▶️ *AI Auto-Reply Resumed.*' });
          return;
        }

        // If sender is Mukul (Owner), do not treat as lead
        if (isOwner) {
          return;
        }

        if (isAutoReplyPaused) return;

        if (memory.optedOutNumbers.includes(senderClean)) return;
        if (trimmedText.toLowerCase() === 'stop' || trimmedText.toLowerCase() === 'mat bhejo') {
          memory.optedOutNumbers.push(senderClean);
          saveAgentMemory(memory);
          await enqueueAdminMessage(adminSock, senderJid, {
            text: 'Aapka opt-out request save ho gaya hai. Thank you!',
          });
          return;
        }

        const now = Date.now();
        const lastReplied = lastAdminReplyPerUser.get(senderJid) || 0;
        if (now - lastReplied < 4000) return;
        lastAdminReplyPerUser.set(senderJid, now);

        try {
          await adminSock.readMessages([msg.key]);
        } catch {}

        // Multi-Agent Consultative Sales Mind with Memory & Hot Lead Dossier
        const contactInfo = {
          pushName: msg.pushName || '',
          participant: msg.key.participant || msg.participant || '',
        };

        const aiReply = await handleIncomingSalesMessage(senderJid, effectiveText, adminSock, contactInfo);
        await enqueueAdminMessage(adminSock, senderJid, { text: aiReply });
        console.log(`[Admin Multi-Agent Sales Replied to ${senderJid}]: "${aiReply.substring(0, 60)}..."`);
      } catch (err) {
        console.error('[Admin Message Handling Error]:', err);
      }
    });
  } catch (err) {
    console.error('[Admin Socket Init Error]:', err);
  }
}

async function restartAdminWhatsAppSocket() {
  console.log('[Admin WhatsApp] Restarting admin socket...');
  if (adminSock) {
    try { adminSock.end(); } catch {}
    adminSock = null;
  }
  adminStatus = 'initializing';
  adminQrCode = null;
  setTimeout(startAdminWhatsAppSocket, 1000);
}

async function resetAdminWhatsAppSession() {
  console.log('[Admin WhatsApp] Disconnecting and resetting admin credentials...');
  if (adminSock) {
    try { await adminSock.logout(); } catch {}
    try { adminSock.end(); } catch {}
    adminSock = null;
  }
  adminStatus = 'initializing';
  adminQrCode = null;
  adminUser = null;
  adminLastError = null;

  try {
    fs.rmSync(ADMIN_AUTH_DIR, { recursive: true, force: true });
    fs.mkdirSync(ADMIN_AUTH_DIR, { recursive: true });
  } catch (err) {
    console.error('[Admin Reset Auth Error]:', err);
  }

  setTimeout(startAdminWhatsAppSocket, 1500);
}

// =============================================================================
// ENGINE 2: CUSTOMER 5-MINUTE SANDBOX SOCKET (.whatsapp_auth_sandbox)
// =============================================================================
let sandboxSock = null;
let sandboxQrCode = null;
let sandboxStatus = 'idle'; // 'idle' | 'initializing' | 'qr_ready' | 'connected' | 'expired'
let sandboxUser = null;
let sandboxSecondsLeft = 300;
let sandboxCountdownTimer = null;
let sandboxExpiryTimeout = null;
const sandboxProcessedMsgIds = new Set();

async function cleanSandboxSession() {
  try {
    if (sandboxCountdownTimer) {
      clearInterval(sandboxCountdownTimer);
      sandboxCountdownTimer = null;
    }
    if (sandboxExpiryTimeout) {
      clearTimeout(sandboxExpiryTimeout);
      sandboxExpiryTimeout = null;
    }

    if (sandboxSock) {
      try {
        await sandboxSock.logout();
      } catch {}
      try {
        sandboxSock.end();
      } catch {}
      sandboxSock = null;
    }

    try {
      fs.rmSync(SANDBOX_AUTH_DIR, { recursive: true, force: true });
      fs.mkdirSync(SANDBOX_AUTH_DIR, { recursive: true });
    } catch {}

    sandboxStatus = 'idle';
    sandboxQrCode = null;
    sandboxUser = null;
    sandboxSecondsLeft = 300;
    console.log('[Sandbox Engine] Sandbox session cleaned and reset to idle.');
  } catch (err) {
    console.error('[Sandbox Cleanup Error]:', err);
  }
}

async function startSandboxWhatsAppSocket() {
  await cleanSandboxSession();
  sandboxStatus = 'initializing';
  sandboxQrCode = null;
  console.log('[Sandbox Engine] Starting fresh sandbox pairing socket for customer...');

  try {
    const { state, saveCreds } = await useMultiFileAuthState(SANDBOX_AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sandboxSock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['MSR Demo Sandbox', 'Chrome', '120.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 45_000,
    });

    sandboxSock.ev.on('creds.update', saveCreds);

    sandboxSock.ev.on('connection.update', async (update) => {
      const { connection, qr } = update;

      if (qr) {
        sandboxStatus = 'qr_ready';
        try {
          sandboxQrCode = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
          console.log('[Sandbox Engine] Real customer pairing QR Code generated successfully!');
        } catch (err) {
          console.error('[Sandbox QR Error]:', err);
        }
      }

      if (connection === 'close') {
        if (sandboxStatus === 'connected') {
          console.log('[Sandbox Engine] Customer sandbox disconnected.');
          cleanSandboxSession();
        }
      } else if (connection === 'open') {
        sandboxStatus = 'connected';
        sandboxQrCode = null;
        sandboxUser = sandboxSock.user;
        sandboxSecondsLeft = 300;

        console.log(`\n[Sandbox Engine] 🎉 CUSTOMER CONNECTED! Linked as: ${sandboxSock.user?.id}`);
        console.log('[Sandbox Engine] Starting 5-minute (300s) auto-disconnect timer...\n');

        // Start 5-minute countdown
        if (sandboxCountdownTimer) clearInterval(sandboxCountdownTimer);
        sandboxCountdownTimer = setInterval(() => {
          sandboxSecondsLeft -= 1;
          if (sandboxSecondsLeft <= 0) {
            clearInterval(sandboxCountdownTimer);
          }
        }, 1000);

        // Auto-terminate after exactly 5 minutes (300 seconds)
        if (sandboxExpiryTimeout) clearTimeout(sandboxExpiryTimeout);
        sandboxExpiryTimeout = setTimeout(() => {
          console.log('[Sandbox Engine] 5-minute demo period expired! Logging out customer phone...');
          cleanSandboxSession();
          sandboxStatus = 'expired';
        }, 5 * 60 * 1000);
      }
    });

    // Handle messages on customer's phone during the 5-minute demo
    sandboxSock.ev.on('messages.upsert', async (m) => {
      try {
        const msg = m.messages[0];
        if (!msg || !msg.message || msg.key.fromMe || !msg.key.remoteJid) return;

        const messageId = msg.key.id;
        if (sandboxProcessedMsgIds.has(messageId)) return;
        sandboxProcessedMsgIds.add(messageId);
        setTimeout(() => sandboxProcessedMsgIds.delete(messageId), 5 * 60 * 1000);

        const senderJid = msg.key.remoteJid;
        if (senderJid.endsWith('@g.us') || senderJid === 'status@broadcast') return;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          '';

        if (!text.trim()) return;

        console.log(`[Sandbox Incoming Msg on Customer Phone from ${senderJid}]: "${text}"`);

        await new Promise((r) => setTimeout(r, 2000));
        const aiReply = await generateAIWhatsAppReply(text.trim(), senderJid, 'sandbox');
        await sandboxSock.sendMessage(senderJid, { text: aiReply });
        console.log(`[Sandbox AI Replied]: "${aiReply.substring(0, 50)}..."`);
      } catch (err) {
        console.error('[Sandbox Message Handling Error]:', err);
      }
    });
  } catch (err) {
    console.error('[Sandbox Init Error]:', err);
    sandboxStatus = 'idle';
  }
}

// =============================================================================
// ENGINE 3: DEDICATED RESTAURANT WHATSAPP SOCKET (.whatsapp_auth_restaurant)
// =============================================================================
let restaurantSock = null;
let restaurantQrCode = null;
let restaurantStatus = 'idle'; // 'idle' | 'initializing' | 'qr_ready' | 'connected' | 'disconnected'
let restaurantUser = null;
let restaurantLastError = null;
const restaurantProcessedMsgIds = new Set();
let isRestaurantStarting = false;

async function cleanRestaurantSession() {
  try {
    if (restaurantSock) {
      try {
        await restaurantSock.logout();
      } catch {}
      try {
        restaurantSock.end();
      } catch {}
      restaurantSock = null;
    }

    try {
      fs.rmSync(RESTAURANT_AUTH_DIR, { recursive: true, force: true });
      fs.mkdirSync(RESTAURANT_AUTH_DIR, { recursive: true });
    } catch {}

    restaurantStatus = 'idle';
    restaurantQrCode = null;
    restaurantUser = null;
    restaurantLastError = null;
    isRestaurantStarting = false;
    console.log('[Restaurant Engine] Restaurant session cleaned and reset to idle.');
  } catch (err) {
    console.error('[Restaurant Cleanup Error]:', err);
  }
}

async function startRestaurantWhatsAppSocket() {
  if (isRestaurantStarting || restaurantStatus === 'connected') return;
  isRestaurantStarting = true;
  restaurantStatus = 'initializing';
  restaurantQrCode = null;
  restaurantLastError = null;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(RESTAURANT_AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    restaurantSock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['The Grand Bistro AI', 'Chrome', '120.0.0'],
      syncFullHistory: false,
      connectTimeoutMs: 60_000,
      keepAliveIntervalMs: 25_000,
    });

    restaurantSock.ev.on('creds.update', saveCreds);

    restaurantSock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        restaurantStatus = 'qr_ready';
        restaurantLastError = null;
        try {
          restaurantQrCode = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        } catch {}
      }

      if (connection === 'close') {
        isRestaurantStarting = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        restaurantStatus = 'disconnected';
        restaurantQrCode = null;
        restaurantLastError = lastDisconnect?.error?.message || 'Disconnected';

        console.log(`[Restaurant WhatsApp Closed] Status: ${statusCode}`);
        if (restaurantSock) {
          try { restaurantSock.end(); } catch {}
          restaurantSock = null;
        }

        if (isLoggedOut || statusCode === 408 || String(restaurantLastError).includes('QR refs')) {
          try {
            fs.rmSync(RESTAURANT_AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(RESTAURANT_AUTH_DIR, { recursive: true });
          } catch {}
        } else {
          // If session closed due to connection drop/restart, auto-reconnect
          setTimeout(() => {
            if (restaurantStatus === 'disconnected' || restaurantStatus === 'idle') {
              console.log('[Restaurant Socket] Attempting auto-reconnect...');
              startRestaurantWhatsAppSocket();
            }
          }, 3500);
        }
      } else if (connection === 'open') {
        isRestaurantStarting = false;
        restaurantStatus = 'connected';
        restaurantQrCode = null;
        restaurantLastError = null;
        restaurantUser = restaurantSock.user;
        console.log(`\n[Restaurant WhatsApp Live!] Grand Bistro Session Active: ${restaurantSock.user?.id || 'Connected'}\n`);
      }
    });

    restaurantSock.ev.on('messages.upsert', async (m) => {
      try {
        const msg = m.messages?.[0];
        if (!msg || !msg.message || msg.key?.fromMe || !msg.key?.remoteJid) return;

        const messageId = msg.key.id;
        if (restaurantProcessedMsgIds.has(messageId)) return;
        restaurantProcessedMsgIds.add(messageId);
        setTimeout(() => restaurantProcessedMsgIds.delete(messageId), 5 * 60 * 1000);

        const senderJid = msg.key.remoteJid;
        if (senderJid.endsWith('@g.us') || senderJid === 'status@broadcast') return;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          '';

        if (!text.trim()) return;

        console.log(`[Restaurant Incoming Msg from ${senderJid}]: "${text}"`);

        try {
          await restaurantSock.readMessages([msg.key]);
          await restaurantSock.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((r) => setTimeout(r, 1500));
        const aiReply = await generateAIWhatsAppReply(text.trim(), senderJid, 'restaurant');
        await restaurantSock.sendMessage(senderJid, { text: aiReply });
        console.log(`[Restaurant AI Chef Replied]: "${aiReply.substring(0, 50)}..."`);
      } catch (err) {
        console.error('[Restaurant Message Handling Error]:', err);
      }
    });
  } catch (err) {
    console.error('[Restaurant Socket Init Error]:', err);
    restaurantStatus = 'idle';
    isRestaurantStarting = false;
  }
}

// =============================================================================
// HTTP SERVER (PORT 5001) WITH CLEAN ISOLATION FOR ADMIN, SANDBOX & RESTAURANT
// =============================================================================
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. ADMIN ENDPOINTS (Permanent Mukul Business WhatsApp)
  // GET /status or GET /admin/status
  if (req.method === 'GET' && (url.pathname === '/status' || url.pathname === '/admin/status')) {
    if (adminStatus === 'disconnected' && !isAdminStarting) {
      startAdminWhatsAppSocket();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        status: adminStatus,
        qrCode: adminQrCode,
        user: adminUser,
        lastError: adminLastError,
      })
    );
    return;
  }

  // POST /send - Send WhatsApp message from Mukul's business WhatsApp
  if (req.method === 'POST' && url.pathname === '/send') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { phone, message } = JSON.parse(body);
        if (!adminSock || adminStatus !== 'connected') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Admin WhatsApp not connected' }));
          return;
        }

        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid = `${cleanPhone}@s.whatsapp.net`;

        const sent = await adminSock.sendMessage(jid, { text: message });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: sent.key.id, to: cleanPhone }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // POST /restart or /admin/restart - Restart Admin socket
  if (req.method === 'POST' && (url.pathname === '/restart' || url.pathname === '/admin/restart')) {
    restartAdminWhatsAppSocket();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Admin WhatsApp restarting...' }));
    return;
  }

  // POST /reset or /admin/reset or /disconnect or /admin/disconnect - Reset Admin session & generate new QR
  if (
    req.method === 'POST' &&
    (url.pathname === '/reset' ||
      url.pathname === '/admin/reset' ||
      url.pathname === '/disconnect' ||
      url.pathname === '/admin/disconnect')
  ) {
    resetAdminWhatsAppSession();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        message: 'Admin WhatsApp disconnected. Generating fresh pairing QR code...',
      })
    );
    return;
  }

  // 2. SANDBOX DEMO ENDPOINTS (For Website Visitors on /agents)
  // GET /sandbox/status
  if (req.method === 'GET' && url.pathname === '/sandbox/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        status: sandboxStatus,
        qrCode: sandboxQrCode,
        user: sandboxUser,
        secondsLeft: sandboxSecondsLeft,
      })
    );
    return;
  }

  // POST /sandbox/start - Initiate fresh QR code for customer's phone
  if (req.method === 'POST' && url.pathname === '/sandbox/start') {
    startSandboxWhatsAppSocket();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Sandbox started. Generating fresh customer QR...' }));
    return;
  }

  // POST /sandbox/disconnect - Clean up customer demo session
  if (req.method === 'POST' && url.pathname === '/sandbox/disconnect') {
    await cleanSandboxSession();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Sandbox session disconnected.' }));
    return;
  }

  // 3. RESTAURANT ENDPOINTS (Dedicated "The Grand Bistro" WhatsApp Socket)
  // GET /restaurant/status
  if (req.method === 'GET' && url.pathname === '/restaurant/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        status: restaurantStatus,
        qrCode: restaurantQrCode,
        user: restaurantUser,
        lastError: restaurantLastError,
      })
    );
    return;
  }

  // POST /restaurant/start - Generate QR pairing for restaurant phone
  if (req.method === 'POST' && url.pathname === '/restaurant/start') {
    startRestaurantWhatsAppSocket();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Restaurant WhatsApp initialized. Generating QR code...' }));
    return;
  }

  // POST /restaurant/disconnect - Disconnect restaurant session
  if (req.method === 'POST' && url.pathname === '/restaurant/disconnect') {
    await cleanRestaurantSession();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Restaurant WhatsApp disconnected and cleaned.' }));
    return;
  }

  // POST /restaurant/send - Send WhatsApp message from restaurant socket (with admin fallback)
  if (req.method === 'POST' && url.pathname === '/restaurant/send') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { phone, message } = JSON.parse(body);
        if (!restaurantSock || restaurantStatus !== 'connected') {
          // Fallback to active admin socket if available
          if (adminSock && adminStatus === 'connected') {
            let cleanPhone = String(phone).replace(/[^0-9]/g, '');
            if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
            const jid = `${cleanPhone}@s.whatsapp.net`;
            const sent = await adminSock.sendMessage(jid, { text: message });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, messageId: sent.key.id, to: cleanPhone, fallback: 'admin_socket' }));
            return;
          }
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Restaurant WhatsApp socket not connected' }));
          return;
        }

        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid = `${cleanPhone}@s.whatsapp.net`;

        const sent = await restaurantSock.sendMessage(jid, { text: message });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: sent.key.id, to: cleanPhone }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. WHATSAPP AI SALES CRM & MEMORY ENDPOINTS
  // GET /crm/conversations - List all leads with full memory & chat history
  if (req.method === 'GET' && url.pathname === '/crm/conversations') {
    const leads = getAllCrmLeads();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: leads.length, leads }));
    return;
  }

  // POST /crm/update-lead - Update customer notes, category, budget, or stage
  if (req.method === 'POST' && url.pathname === '/crm/update-lead') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { phone, updates } = JSON.parse(body);
        const updated = updateLeadRecord(phone, updates);
        if (updated) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, lead: updated }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Lead not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // POST /crm/delete-lead - Delete spam or bogus lead from CRM
  if (req.method === 'POST' && url.pathname === '/crm/delete-lead') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { phone } = JSON.parse(body);
        if (!phone) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Phone number is required' }));
          return;
        }
        const deleted = deleteLeadRecord(phone);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, deleted, phone }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // POST /crm/trigger-followup - Send AI follow-up message to lead
  if (req.method === 'POST' && url.pathname === '/crm/trigger-followup') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { phone, message } = JSON.parse(body);
        if (!adminSock || adminStatus !== 'connected') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Admin WhatsApp not connected' }));
          return;
        }

        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const jid = `${cleanPhone}@s.whatsapp.net`;

        const sent = await enqueueAdminMessage(adminSock, jid, { text: message });

        // Record follow-up in customer history
        updateLeadRecord(cleanPhone, {
          stage: 'follow_up_sent',
        });
        const lead = getAllCrmLeads().find((l) => l.phone === cleanPhone);
        if (lead) {
          lead.history.push({
            sender: 'ai',
            text: message,
            timestamp: Date.now(),
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, messageId: sent?.key?.id || 'sent', to: cleanPhone }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

// Launch on Port 5001
server.listen(PORT, () => {
  console.log(`[Tri-Engine WhatsApp Worker] Running on port ${PORT}`);
  // Start Mukul's permanent business WhatsApp
  startAdminWhatsAppSocket();

  // If Restaurant session was already paired, auto-start socket immediately
  if (fs.existsSync(RESTAURANT_AUTH_DIR) && fs.existsSync(path.join(RESTAURANT_AUTH_DIR, 'creds.json'))) {
    console.log('[Restaurant Socket] Existing session found. Auto-starting...');
    startRestaurantWhatsAppSocket();
  }

  // Render 24/7 Self-Keep-Alive Ping (pings itself every 8 minutes so Render free tier never sleeps)
  const RENDER_SERVICE_URL = process.env.RENDER_EXTERNAL_URL || 'https://msr-whatsapp-bot.onrender.com';
  setInterval(() => {
    try {
      const proto = RENDER_SERVICE_URL.startsWith('https') ? https : http;
      proto.get(`${RENDER_SERVICE_URL}/status`, (res) => {
        console.log(`[Keep-Alive Ping] Status: ${res.statusCode} at ${new Date().toLocaleTimeString('en-IN')}`);
      }).on('error', (err) => {
        console.log('[Keep-Alive Ping Error]:', err.message);
      });
    } catch {}
  }, 8 * 60 * 1000);

  // ===========================================================================
  // 100% AUTONOMOUS CRON 1: AGENCY LEADS FOLLOW-UP & NURTURE BRAIN (Every 30 Mins)
  // Runs entirely on auto-pilot without human intervention!
  // ===========================================================================
  setInterval(async () => {
    try {
      if (adminSock && adminStatus === 'connected') {
        const result = await processAutomatedFollowUps(adminSock);
        if (result?.sent > 0) {
          console.log(`[Autonomous Cron]: Followed up with ${result.sent} lead(s) automatically.`);
        }
      }
    } catch (err) {
      console.error('[Autonomous Follow-Up Cron Error]:', err.message);
    }
  }, 30 * 60 * 1000);

  // ===========================================================================
  // 100% AUTONOMOUS CRON 2: RESTAURANT BIRTHDAY RE-ENGAGEMENT BRAIN (Hourly Check)
  // Dispatches free lava cake vouchers automatically on customer birthdays!
  // ===========================================================================
  const sentBirthdaysToday = new Set();
  let lastCheckedDay = new Date().getDate();

  setInterval(async () => {
    try {
      const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const currentDay = nowIST.getDate();
      const currentHour = nowIST.getHours();

      // Reset daily tracker at midnight IST
      if (currentDay !== lastCheckedDay) {
        sentBirthdaysToday.clear();
        lastCheckedDay = currentDay;
      }

      // Send birthday vouchers between 10:00 AM and 6:00 PM IST
      if (currentHour < 10 || currentHour >= 18) return;

      const activeSock = (restaurantSock && restaurantStatus === 'connected') ? restaurantSock : adminSock;
      if (!activeSock) return;

      const currentDayStr = String(currentDay).padStart(2, '0');
      const currentMonthStr = String(nowIST.getMonth() + 1).padStart(2, '0');
      const todayBirthdayKey = `${currentDayStr}-${currentMonthStr}`; // e.g. "09-10"

      const loyaltyFile = path.resolve(process.cwd(), 'data/restaurant-loyalty.json');
      if (fs.existsSync(loyaltyFile)) {
        const loyaltyData = JSON.parse(fs.readFileSync(loyaltyFile, 'utf8'));
        const customers = loyaltyData.customers || [];

        for (const cust of customers) {
          if (!cust.phone || cust.phone.length < 10) continue;
          if (cust.birthday === todayBirthdayKey && !sentBirthdaysToday.has(cust.id)) {
            let cleanPhone = cust.phone.replace(/[^0-9]/g, '');
            if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

            const bdayWish = `🎂 *HAPPY BIRTHDAY ${cust.name?.toUpperCase() || 'VALUED GUEST'} JI!* 🎉
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro family ki taraf se aapko janamdin ki dher saari shubhkaamnayein! 🎁

Aapke Birthday celebration ko grand banane ke liye hamare Chef ki taraf se ek special gift:
✨ *1 Complimentary Signature Belgian Chocolate Lava Cake (₹249 Free)*
✨ *Flat 15% OFF on your entire celebration bill*

Aap apni family aur dosto ke sath kab aana chahenge? 
Bas yaha *"Book Birthday Table"* reply karein, hum VIP table ready rakhenge! 🥂
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro • Craft Kitchen`;

            try {
              const jid = `${cleanPhone}@s.whatsapp.net`;
              await activeSock.sendMessage(jid, { text: bdayWish });
              sentBirthdaysToday.add(cust.id);
              cust.birthdayWishSent = true;
              cust.status = 'Birthday Wish Sent Today';
              fs.writeFileSync(loyaltyFile, JSON.stringify(loyaltyData, null, 2), 'utf8');
              console.log(`[Autonomous Birthday Wish Dispatched]: Sent to ${cust.name} (+${cleanPhone})`);
            } catch (bdayErr) {
              console.error(`[Birthday Auto-Dispatch Error for ${cust.name}]:`, bdayErr.message);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Autonomous Birthday Cron Error]:', err.message);
    }
  }, 45 * 60 * 1000); // Check every 45 minutes
});
