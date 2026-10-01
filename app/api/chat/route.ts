import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';

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
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

      if (lastUserMsg.includes('price') || lastUserMsg.includes('cost') || lastUserMsg.includes('kharcha') || lastUserMsg.includes('fees') || lastUserMsg.includes('package')) {
        aiReply =
          'Hamare Meta/Google Ads and 24/7 AI WhatsApp bot management packages ₹15,000/month se start hote hain (complete ad creative + targeting + 24/7 AI lead capture included). Exact investment aapke business scale aur ad spend par depend karta hai. Kya aap ek quick 15-minute free growth audit book karna chahenge?';
      } else if (lastUserMsg.includes('d2c') || lastUserMsg.includes('ecom') || lastUserMsg.includes('shopify') || lastUserMsg.includes('rto') || lastUserMsg.includes('cod')) {
        aiReply =
          'D2C brands ke liye humne D2C Anti-RTO Shield develop kiya hai (jaise Amparo ke liye 340% ROAS aur 28% RTO drop deliver kiya). Ye fake addresses filter karta hai aur Cash-on-Delivery orders ko WhatsApp par 1-click me auto-verify karta hai. Aapka store kis product category me hai?';
      } else if (lastUserMsg.includes('restaurant') || lastUserMsg.includes('cafe') || lastUserMsg.includes('food') || lastUserMsg.includes('table') || lastUserMsg.includes('dining')) {
        aiReply =
          'Restaurants aur Cafes ke liye hamara SmartDine AI Agent (jaise Nacho G aur The Bunker Cafe) WhatsApp par automated table reservations aur menu sharing karta hai — bina kisi staff ke! Weekend rush me zero customers miss hote hain. Aapka cafe/restaurant kahan located hai?';
      } else if (lastUserMsg.includes('clinic') || lastUserMsg.includes('doctor') || lastUserMsg.includes('health') || lastUserMsg.includes('hospital') || lastUserMsg.includes('patient')) {
        aiReply =
          'Doctors aur Clinics ke liye hamara CareSlot AI Agent 24/7 patient appointments book karta hai, token timings aur clinic GPS directions automatically WhatsApp par bhejta hai. OPD rush 60% tak smooth ho jata hai!';
      } else if (lastUserMsg.includes('school') || lastUserMsg.includes('coaching') || lastUserMsg.includes('admission') || lastUserMsg.includes('edu')) {
        aiReply =
          'Schools aur Coaching Institutes (jaise Elite Futuristic School) ke liye hamara EduEnroll AI Agent parents ke fee structure, syllabus aur timings queries ko instantly solve karke verified campus visits schedule karta hai.';
      } else if (lastUserMsg.includes('real estate') || lastUserMsg.includes('builder') || lastUserMsg.includes('property') || lastUserMsg.includes('flat') || lastUserMsg.includes('site visit')) {
        aiReply =
          'Real Estate builders ke liye hamara EstateMatch Agent serious buyers ka budget (2BHK/3BHK) filter karta hai, PDF brochures deliver karta hai aur sales manager ke sath direct site visits book karta hai.';
      } else if (lastUserMsg.includes('amparo') || lastUserMsg.includes('case study') || lastUserMsg.includes('proof') || lastUserMsg.includes('result') || lastUserMsg.includes('client')) {
        aiReply =
          'Hamare verified results: Amparo (D2C Skincare) ne ₹2.4 Lakhs revenue 30 days me generate kiya with 3.8x ROAS aur -28% RTO drop. Nacho G restaurant ne weekend footfall me 40% jump dekha. Hum vanity metrics nahi, real revenue deliver karte hain!';
      } else if (lastUserMsg.includes('ad') || lastUserMsg.includes('meta') || lastUserMsg.includes('facebook') || lastUserMsg.includes('instagram') || lastUserMsg.includes('google')) {
        aiReply =
          'MSR Next Gen Meta & Google Ads me high-converting vernacular video ads, UGC hooks aur hyper-local targeting use karta hai. Isse cost-per-lead 40% tak drop ho jata hai aur direct WhatsApp leads aati hain. Aap monthly kitna ad spend plan kar rahe hain?';
      } else if (lastUserMsg.includes('mukul') || lastUserMsg.includes('founder') || lastUserMsg.includes('contact') || lastUserMsg.includes('phone') || lastUserMsg.includes('number')) {
        aiReply =
          'Aap direct MSR founder Mukul se WhatsApp par connect kar sakte hain: +91 95193 42440 (Sales & Audits) ya +91 88875 21156 (Client Desk). Hamara email hai msbestshoopingpro@gmail.com.';
      } else if (lastUserMsg.includes('audit') || lastUserMsg.includes('free') || lastUserMsg.includes('consult')) {
        aiReply =
          'Bilkul! Hum aapke business ke Instagram page, website aur current ads ka ek comprehensive 15-Minute Video/WhatsApp Audit free of charge karte hain. Direct WhatsApp par start karne ke liye tap karein: +91 95193 42440.';
      } else if (lastUserMsg.includes('whatsapp') || lastUserMsg.includes('bot') || lastUserMsg.includes('agent') || lastUserMsg.includes('demo')) {
        aiReply =
          'MSR Next Gen ka 24/7 AI WhatsApp Agent bina kisi human delay ke 2 second me pricing, product catalogs aur order bookings handle karta hai. Aap hamare live WhatsApp number +91 95193 42440 par message bhejkar ise abhi live test kar sakte hain!';
      } else {
        aiReply =
          'Namaste! MSR Next Gen me aapka swagat hai. Hum Meta/Google Ads aur 24/7 AI WhatsApp Automation se Indian businesses aur D2C brands ke sales scale karte hain. Aap kis business ke liye marketing ya AI agent explore karna chahte hain?';
      }
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
