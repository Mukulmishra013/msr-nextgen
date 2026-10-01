import { NextRequest, NextResponse } from 'next/server';
import { saveLeadToFirestore } from '@/lib/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimiter';
import { leadAgent } from '@/lib/leadAgent';
import { sendWhatsAppMessage } from '@/lib/whatsappSend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, businessName, phone, honeypot, submittedAt } = body;

    // 1. Anti-Spam Honeypot Verification:
    // If hidden bot field is populated, silently return success without writing to Firestore
    if (honeypot && String(honeypot).trim().length > 0) {
      console.warn('[Anti-Spam] Honeypot triggered. Silently ignoring bot submission.');
      return NextResponse.json(
        { success: true, message: 'Inquiry received' },
        { status: 200 }
      );
    }

    // 2. Client IP Rate Limiting (in-memory dev / single-server)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(`lead_${clientIp}`, 6, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please connect with us directly via WhatsApp or try again later.',
        },
        { status: 429 }
      );
    }

    // 3. Name & Business Validation
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanBusiness = typeof businessName === 'string' ? businessName.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    if (!cleanBusiness || cleanBusiness.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your business or store name.' },
        { status: 400 }
      );
    }

    // 4. Strict Indian Phone Number Validation
    const rawPhone = typeof phone === 'string' ? phone.replace(/[\s\-()]/g, '') : '';
    const normalizedPhone = rawPhone.replace(/^(\+91|91|0)/, '');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).',
        },
        { status: 400 }
      );
    }

    const formattedPhone = `+91${normalizedPhone}`;

    // 5. SOLO-OPERATOR AI LEAD AGENT EXECUTION
    // Analyzes intent, assigns score ('hot' | 'warm' | 'cold'), creates summary & drafted reply
    let aiScore: 'hot' | 'warm' | 'cold' = 'warm';
    let aiSummary = `${cleanBusiness} — Inquiry for growth marketing`;
    let aiSuggestedReply = `Hi ${cleanName}, thank you for contacting MSR Next Gen regarding ${cleanBusiness}. Let's schedule a 15-min growth audit!`;
    let autoSend = false;
    let providerUsed = 'rules';
    let autoSent = false;

    try {
      const aiAnalysis = await leadAgent.handleNewLead({
        name: cleanName,
        businessName: cleanBusiness,
        phone: formattedPhone,
      });

      aiScore = aiAnalysis.score;
      aiSummary = aiAnalysis.summary;
      aiSuggestedReply = aiAnalysis.reply;
      autoSend = aiAnalysis.autoSend;
      providerUsed = aiAnalysis.providerUsed;

      // 6. WhatsApp Dispatch:
      // (a) Alert the Agency Owner (+91 95193 42440 & +91 88875 21156) instantly on WhatsApp
      const ownerPhone = process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER || '919519342440';
      const carePhone = process.env.NEXT_PUBLIC_CUSTOMER_CARE_NUMBER || '918887521156';

      const ownerAlertMessage = `🚨 *New Inbound Lead Received!*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${cleanName}
🏢 *Business:* ${cleanBusiness}
📱 *Phone:* ${formattedPhone}
🎯 *AI Quality Score:* ${aiScore.toUpperCase()}
🤖 *AI Provider:* ${providerUsed}
💡 *Summary:* ${aiSummary}
━━━━━━━━━━━━━━━━━━
💬 *Drafted AI Response for Client:*
"${aiSuggestedReply}"
━━━━━━━━━━━━━━━━━━
⚡ *Action:* You can tap their number to call or message directly!`;

      try {
        await sendWhatsAppMessage(ownerPhone, ownerAlertMessage);
        // Also notify secondary owner number if different from lead's phone
        const cleanFormatted = formattedPhone.replace(/[^0-9]/g, '');
        const cleanCare = carePhone.replace(/[^0-9]/g, '');
        if (cleanCare && cleanCare !== cleanFormatted && cleanCare !== ownerPhone.replace(/[^0-9]/g, '')) {
          await sendWhatsAppMessage(cleanCare, ownerAlertMessage);
        }
      } catch (ownerAlertErr) {
        console.warn('[Owner WhatsApp Alert Notice]', ownerAlertErr);
      }

      // (b) Send welcome / audit offer message directly to the customer's phone if warm/hot
      if (autoSend) {
        const sendResult = await sendWhatsAppMessage(formattedPhone, aiSuggestedReply);
        autoSent = sendResult.sent;
      }
    } catch (aiErr) {
      console.warn('[AI Agent Processing Notice]', aiErr);
    }

    // 7. Save Enriched Lead to Firestore
    const result = await saveLeadToFirestore(
      {
        name: cleanName,
        businessName: cleanBusiness,
        phone: formattedPhone,
        source: 'landing-page-form',
        submittedAt: new Date().toISOString(),
        aiScore,
        aiSummary,
        aiSuggestedReply,
        autoSent,
        providerUsed,
      },
      {
        ip: clientIp,
        userAgent: req.headers.get('user-agent') || undefined,
      }
    );

    return NextResponse.json({
      success: true,
      id: result.id,
      aiScore,
      autoSent,
      isDevFallback: result.isDevFallback,
      message: 'Thank you! Our team will contact you on WhatsApp shortly.',
    });
  } catch (err) {
    console.error('Lead submission API error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error processing inquiry. Please reach out via WhatsApp.' },
      { status: 500 }
    );
  }
}
