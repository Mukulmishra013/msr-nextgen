import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import { getSmartAssistantAnswer } from '@/lib/chatKnowledge';
import { sendWhatsAppMessage } from '@/lib/whatsappSend';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MAYA_SYSTEM_PROMPT = `You are Maya, the intelligent AI Growth Assistant for "MSR Next Gen" — India's premier digital marketing & AI automation agency founded by Mukul Mishra.

Agency Background:
- Specializes in: High-ROI Meta Ads (Instagram/Facebook), Google Ads, and 24/7 AI WhatsApp Chatbot Agents for Indian businesses & D2C brands.
- Proof: Managed brands like Amparo (D2C skincare, ₹2.4 Lakhs revenue in 30 days, 3.8x ROAS), local restaurants (Nacho G, The Bunker Cafe), retail stores.
- Founder & Team: Mukul Mishra (Founder & Growth Architect).
- Official WhatsApp / Sales: +91 95193 42440
- Customer Care: +91 88875 21156
- Official Email: msbestshoopingpro@gmail.com
- Offer: Free 15-Minute Business Growth & Ads Audit.
- Packages start around ₹15,000/month.

Guidelines:
1. You are Maya, the AI assistant, NOT Mukul. Speak warmly as Maya representing MSR Next Gen.
2. Match the user's language: If they ask in Hindi or Hinglish, reply in natural, friendly Hinglish. If in English, reply in crisp English.
3. Keep responses concise (usually 2 to 4 sentences or bullet points, max 100 words) so it feels like a fast live chat.
4. When asked about pricing, mention packages start around ₹15,000/month and invite them to connect on WhatsApp (+91 95193 42440) for a free 15-minute audit.
5. If the user writes gibberish, random letters (e.g. 'xyz', 'test', 'asdf'), or unclear queries, DO NOT assume or claim anything was booked or ordered. Instead, politely ask in friendly Hinglish how you can help their business.
6. Autonomous Onboarding: If the user provides their business name, category, or WhatsApp number, warmly acknowledge it, confirm that their onboarding request is logged, and invite them for a quick confirmation call.`;

const AGENT_PROMPTS: Record<string, string> = {
  'restaurant-smart-dine': `You are SmartDine AI Agent for restaurants and cafes (like Nacho G and The Bunker Cafe) by MSR Next Gen. You handle 24/7 table reservations, party bookings, food menus, and pre-orders on WhatsApp. Reply warmly in natural Hinglish. Keep it short (2-3 sentences). If the user message is gibberish or random letters (e.g. 'xyz'), do NOT book anything; politely ask for their reservation details (guests, date, time) or menu questions.`,
  food: `You are SmartDine AI Agent for restaurants and cafes (like Nacho G and The Bunker Cafe) by MSR Next Gen. You handle 24/7 table reservations, party bookings, food menus, and pre-orders on WhatsApp. Reply warmly in natural Hinglish. Keep it short (2-3 sentences). If the user message is gibberish or random letters (e.g. 'xyz'), do NOT book anything; politely ask for their reservation details or menu questions.`,

  'clinic-care-slot': `You are CareSlot AI Agent for clinics and doctors by MSR Next Gen. You handle 24/7 patient appointments, token timings, and clinic GPS directions on WhatsApp. Reply warmly in natural Hinglish. Keep it short (2-3 sentences). If the user message is gibberish or random letters (e.g. 'xyz'), do NOT book anything; politely ask which doctor/specialist or timings they are looking for.`,
  healthcare: `You are CareSlot AI Agent for clinics and doctors by MSR Next Gen. You handle 24/7 patient appointments, token timings, and clinic GPS directions on WhatsApp. Reply warmly in natural Hinglish. Keep it short (2-3 sentences). If the user message is gibberish or random letters (e.g. 'xyz'), do NOT book anything; politely ask which doctor/specialist or timings they are looking for.`,

  'd2c-cod-shield': `You are D2C Anti-RTO Shield AI Agent for e-commerce and Shopify stores by MSR Next Gen (proven with Amparo Wellness: ₹2.4L revenue, 3.8x ROAS, -28% RTO). You verify Cash on Delivery orders, detect fake addresses, and reduce RTO by 35%. Reply in crisp Hinglish. Keep it short (2-3 sentences). If the user message is random letters or unclear, politely ask about their e-commerce store or order inquiry.`,
  d2c: `You are D2C Anti-RTO Shield AI Agent for e-commerce and Shopify stores by MSR Next Gen (proven with Amparo Wellness). You verify Cash on Delivery orders, detect fake addresses, and reduce RTO by 35%. Reply in crisp Hinglish. Keep it short (2-3 sentences). If the user message is random letters or unclear, politely ask about their e-commerce store or order inquiry.`,

  'edu-enroll-agent': `You are EduEnroll AI Agent for schools and coaching institutes by MSR Next Gen. You answer parents' fee structure and syllabus queries, and book demo classes. Reply in friendly Hinglish. Keep it short. If the user message is gibberish, politely ask which class or course they are interested in.`,
  education: `You are EduEnroll AI Agent for schools and coaching institutes by MSR Next Gen. You answer parents' fee structure and syllabus queries, and book demo classes. Reply in friendly Hinglish. Keep it short. If the user message is gibberish, politely ask which class or course they are interested in.`,

  'real-estate-lead-matcher': `You are EstateMatch AI Agent for builders and property brokers by MSR Next Gen. You filter high-ticket buyer budgets, deliver floor plans, and book site visits. Reply in professional Hinglish. Keep it short. If the user message is gibberish, politely ask for their budget and preferred location.`,
  realestate: `You are EstateMatch AI Agent for builders and property brokers by MSR Next Gen. You filter high-ticket buyer budgets, deliver floor plans, and book site visits. Reply in professional Hinglish. Keep it short. If the user message is gibberish, politely ask for their budget and preferred location.`,

  'whatsapp-autopilot': `You are WhatsApp 24/7 AI Sales Pilot by MSR Next Gen. You automate customer sales, catalog sharing, and order locking 24/7 on WhatsApp. Reply in natural Hinglish. Keep it short.`,

  'omni-support-bot': `You are OmniDesk AI Support Agent by MSR Next Gen. You provide instant tier-1 customer support, order tracking, and FAQ resolution. Reply in friendly Hinglish.`,
};

// 1. OpenRouter Provider (auto model routing)
async function callOpenRouter(messages: ChatMessage[], systemPrompt: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://msrnextgen.com',
        'X-Title': 'MSR Next Gen AI',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),
        ],
        temperature: 0.35,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply && reply.trim().length > 5) return reply.trim();
  } catch {
    // fallback
  }
  return null;
}

// 2. NVIDIA NIM Provider (if key provided)
async function callNvidiaNim(messages: ChatMessage[], systemPrompt: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),
        ],
        temperature: 0.35,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply && reply.trim().length > 5) return reply.trim();
  } catch {
    // fallback
  }
  return null;
}

// 3. Groq Provider
async function callGroqChat(messages: ChatMessage[], systemPrompt: string, apiKey: string): Promise<string | null> {
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-6),
          ],
          temperature: 0.35,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply && reply.trim().length > 5 && (reply.match(/\uFFFD/g) || []).length <= 2) {
        return reply.trim();
      }
    } catch {
      // try next
    }
  }
  return null;
}

// 4. Gemini Provider (if valid key provided)
async function callGeminiChat(messages: ChatMessage[], systemPrompt: string, apiKey: string): Promise<string | null> {
  const models = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];
  for (const model of models) {
    try {
      const contents = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: `${systemPrompt}\nEnsure responses are complete and in Hinglish.` }],
            },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 350,
            },
          }),
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && reply.trim().length > 5) return reply.trim();
    } catch {
      // try next
    }
  }
  return null;
}

// 5. Keyless Free LLM (Pollinations AI - GPT-4o Engine)
async function callPollinationsAI(messages: ChatMessage[], systemPrompt: string): Promise<string | null> {
  try {
    const lastMsg = messages[messages.length - 1]?.content || '';
    if (!lastMsg) return null;

    const conversationSnippet = messages
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const promptToSend = encodeURIComponent(
      `Conversation:\n${conversationSnippet}\n\nRespond as Assistant to the last message (concise, 2-4 sentences in Hinglish/Hindi):`
    );
    const encodedSystem = encodeURIComponent(systemPrompt);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const url = `https://text.pollinations.ai/${promptToSend}?system=${encodedSystem}&model=openai`;
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const text = await res.text();
    if (text && text.trim().length > 5 && !text.trim().startsWith('{')) {
      return text.trim();
    }
  } catch {
    // fallback
  }
  return null;
}

// Autonomous Lead & Onboarding Extraction
async function detectAndTriggerOnboarding(text: string, clientIp: string) {
  try {
    const phoneMatch = text.match(/(?:\+91|91|0)?([6-9]\d{9})/);
    if (!phoneMatch) return;

    const phone = phoneMatch[1];
    const alertMessage = `🚀 *AUTONOMOUS ONBOARDING LEAD VIA AI CHAT!*
━━━━━━━━━━━━━━━━━━━━
📱 *Phone*: +91${phone}
💬 *Message*: "${text.substring(0, 150)}"
🌐 *IP*: ${clientIp}
📅 *Time*: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━
_Auto-captured by MSR Next Gen AI_`;

    await sendWhatsAppMessage('918887521156', alertMessage);
    await sendWhatsAppMessage('919519342440', alertMessage);
    console.log(`[Autonomous Onboarding Triggered for +91${phone}]`);
  } catch (err) {
    console.error('[Onboarding Trigger Error]:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(`chat_${clientIp}`, 50, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many messages. Please chat with us directly on WhatsApp (+91 95193 42440).',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, agentId, scenario } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide messages array.' },
        { status: 400 }
      );
    }

    const effectiveAgentId = (agentId || scenario || '').toLowerCase();
    const systemPrompt = AGENT_PROMPTS[effectiveAgentId] || MAYA_SYSTEM_PROMPT;

    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // Autonomous Onboarding Detection
    detectAndTriggerOnboarding(lastUserMsg, clientIp);

    const knowledgeAnswer = getSmartAssistantAnswer(lastUserMsg, messages.length, effectiveAgentId);

    let aiReply: string | null = null;
    let provider = 'rules';

    // 1. OpenRouter AI (Primary High-Intelligence Cloud Router)
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!aiReply && openrouterKey) {
      const orReply = await callOpenRouter(messages, systemPrompt, openrouterKey);
      if (orReply) {
        aiReply = orReply;
        provider = 'openrouter_auto';
      }
    }

    // 2. Groq Cloud Engine (Ultra-fast Qwen / Llama)
    const groqKey = process.env.GROQ_API_KEY;
    if (!aiReply && groqKey) {
      const groqReply = await callGroqChat(messages, systemPrompt, groqKey);
      if (groqReply) {
        aiReply = groqReply;
        provider = 'groq';
      }
    }

    // 3. Google Gemini Flash
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!aiReply && geminiKey && (geminiKey.startsWith('AIzaSy') || geminiKey.startsWith('AQ.'))) {
      const geminiReply = await callGeminiChat(messages, systemPrompt, geminiKey);
      if (geminiReply) {
        aiReply = geminiReply;
        provider = 'gemini';
      }
    }

    // 4. NVIDIA NIM (if key configured)
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (!aiReply && nvidiaKey) {
      const nvReply = await callNvidiaNim(messages, systemPrompt, nvidiaKey);
      if (nvReply) {
        aiReply = nvReply;
        provider = 'nvidia_nim';
      }
    }

    // 5. Pollinations AI Keyless GPT-4o-mini
    if (!aiReply) {
      const pollinationsReply = await callPollinationsAI(messages, systemPrompt);
      if (pollinationsReply) {
        aiReply = pollinationsReply;
        provider = 'pollinations_gpt4o';
      }
    }

    // 6. Last-resort Offline Fallback ONLY if all 5 live LLM providers failed or timed out
    if (!aiReply) {
      const knowledgeAnswer = getSmartAssistantAnswer(lastUserMsg, messages.length, effectiveAgentId);
      aiReply = knowledgeAnswer;
      provider = 'msr_ai_fallback';
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      provider,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown chat error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
