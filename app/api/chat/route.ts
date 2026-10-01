import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import { getSmartAssistantAnswer } from '@/lib/chatKnowledge';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are Maya, the intelligent AI Growth Assistant for "MSR Next Gen" — India's premier digital marketing & AI automation agency founded by Mukul.

Agency Background:
- Specializes in: High-ROI Meta Ads (Instagram/Facebook), Google Ads, and 24/7 AI WhatsApp Chatbot Agents for Indian businesses & D2C brands.
- Proof: Managed brands like Amparo (D2C skincare, ₹2.4 Lakhs revenue in 30 days, 3.8x ROAS), local restaurants, retail stores.
- Founder & Team: Mukul (Founder & Growth Architect).
- Official WhatsApp / Sales: +91 95193 42440
- Customer Care: +91 88875 21156
- Official Email: msbestshoopingpro@gmail.com
- Offer: Free 15-Minute Business Growth & Ads Audit.

Guidelines:
1. Be warm, professional, and knowledgeable.
2. Match the user's language: If they ask in Hindi or Hinglish, reply in natural, friendly Hinglish. If in English, reply in crisp English.
3. Keep responses concise (usually 2 to 4 sentences or bullet points, max 100 words) so it feels like a fast live chat.
4. When asked about pricing, explain that packages start around ₹15,000/month depending on ad spend & scale, and invite them for a free 15-minute audit on WhatsApp (+91 95193 42440).
5. Always guide interested business owners toward booking a free audit or reaching out on WhatsApp.`;

async function callGroqChat(messages: ChatMessage[], apiKey: string): Promise<string | null> {
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
            ...messages.slice(-6),
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) return reply.trim();
    } catch {
      // try next
    }
  }
  return null;
}

async function callGeminiChat(messages: ChatMessage[], apiKey: string): Promise<string | null> {
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
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
              parts: [{ text: `${SYSTEM_PROMPT}\nEnsure all sentences and bullet points are 100% complete. Do not truncate or stop abruptly.` }],
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      if (!res.ok) continue;
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
    } catch {
      // try next
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(`chat_${clientIp}`, 30, 60 * 1000);

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
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide messages array.' },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let aiReply: string | null = null;
    let provider = 'rules';

    if (groqKey) {
      aiReply = await callGroqChat(messages, groqKey);
      if (aiReply) provider = 'groq';
    }

    if (!aiReply && geminiKey) {
      aiReply = await callGeminiChat(messages, geminiKey);
      if (aiReply) provider = 'gemini';
    }

    if (!aiReply) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      aiReply = getSmartAssistantAnswer(lastUserMsg, messages.length);
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
