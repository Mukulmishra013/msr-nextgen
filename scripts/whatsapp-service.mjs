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
} from './whatsappSalesEngine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_AUTH_DIR = path.resolve(__dirname, '../.whatsapp_auth');
const SANDBOX_AUTH_DIR = path.resolve(__dirname, '../.whatsapp_auth_sandbox');

if (!fs.existsSync(ADMIN_AUTH_DIR)) fs.mkdirSync(ADMIN_AUTH_DIR, { recursive: true });
if (!fs.existsSync(SANDBOX_AUTH_DIR)) fs.mkdirSync(SANDBOX_AUTH_DIR, { recursive: true });

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

  const systemPrompt = isSandbox
    ? `You are the MSR Next Gen AI Auto-Pilot assistant running on a 5-minute LIVE DEMO on this business WhatsApp number.
Explain that you are an AI agent responding in real-time to show how fast and smart MSR Next Gen automation works.
Services: Meta Ads, Google Ads, 24/7 AI WhatsApp customer booking.
Keep answers warm, polite, in natural Hinglish or English (2 to 3 sentences max).
Guide them to visit https://msrnextgen.com or WhatsApp Mukul at +91 95193 42440.`
    : `You are Maya, the 24/7 AI Growth Assistant for "MSR Next Gen" (India's premier Digital Marketing & AI Agency founded by Mukul).
Services: High-converting Meta (Instagram/FB) Ads, Google Ads, and 24/7 AI WhatsApp Agents that qualify leads and automate customer orders for Indian businesses and D2C brands.
Contact email: msbestshoopingpro@gmail.com, Customer Care: +91 88875 21156, Sales/Owner: +91 95193 42440.${learnedContext}
CRITICAL RULES:
1. Warm, polite, professional Hinglish or English (match user language).
2. Answer directly and concisely (2 to 4 sentences).
3. IMPORTANT: Always complete your sentences fully. Never stop abruptly.
4. Guide them toward booking a free 15-minute business growth audit with Mukul.`;

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
        if (isLoggedOut) {
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
        adminUser = adminSock.user;
        console.log(`\n[Admin WhatsApp Live!] Permanent Session Active: ${adminSock.user?.id || 'Connected'}\n`);
      }
    });

    adminSock.ev.on('messages.upsert', async (m) => {
      try {
        const isFromMe = Boolean(msg.key.fromMe);
        if (!msg || !msg.message || !msg.key.remoteJid) return;

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
        const senderClean = senderJid.replace(/[^0-9]/g, '');
        const isOwner = senderClean.includes('9519342440') || senderClean.includes('8887521156');
        const memory = loadAgentMemory();

        if (isOwner && trimmedText.startsWith('!learn')) {
          const fact = trimmedText.replace(/^!learn\s*/i, '').trim();
          if (fact) {
            memory.learnedFacts.push(fact);
            saveAgentMemory(memory);
            await adminSock.sendMessage(senderJid, { text: `✅ *Learned & Saved!* "${fact}"` });
            return;
          }
        }

        if (isOwner && trimmedText === '!pause') {
          isAutoReplyPaused = true;
          await adminSock.sendMessage(senderJid, { text: '⏸️ *AI Auto-Reply Paused.*' });
          return;
        }

        if (isOwner && trimmedText === '!resume') {
          isAutoReplyPaused = false;
          await adminSock.sendMessage(senderJid, { text: '▶️ *AI Auto-Reply Resumed.*' });
          return;
        }

        if (isAutoReplyPaused) return;

        if (memory.optedOutNumbers.includes(senderClean)) return;
        if (trimmedText.toLowerCase() === 'stop' || trimmedText.toLowerCase() === 'mat bhejo') {
          memory.optedOutNumbers.push(senderClean);
          saveAgentMemory(memory);
          await adminSock.sendMessage(senderJid, {
            text: 'Aapka opt-out request save ho gaya hai. Thank you!',
          });
          return;
        }

        const now = Date.now();
        const lastReplied = lastAdminReplyPerUser.get(senderJid) || 0;
        if (now - lastReplied < 3000) return;
        lastAdminReplyPerUser.set(senderJid, now);

        try {
          await adminSock.readMessages([msg.key]);
          await adminSock.sendPresenceUpdate('composing', senderJid);
        } catch {}

        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

        // Multi-Agent Consultative Sales Mind with Memory & Hot Lead Dossier
        const aiReply = await handleIncomingSalesMessage(senderJid, effectiveText, adminSock);
        await adminSock.sendMessage(senderJid, { text: aiReply });
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
// HTTP SERVER (PORT 5001) WITH CLEAN ISOLATION FOR ADMIN & SANDBOX
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

  // 3. WHATSAPP AI SALES CRM & MEMORY ENDPOINTS
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

        const sent = await adminSock.sendMessage(jid, { text: message });

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
        res.end(JSON.stringify({ success: true, messageId: sent.key.id, to: cleanPhone }));
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
  console.log(`[Dual-Engine WhatsApp Worker] Running on port ${PORT}`);
  // Start Mukul's permanent business WhatsApp
  startAdminWhatsAppSocket();

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
});
