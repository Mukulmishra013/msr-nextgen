import { NextResponse } from 'next/server';
import { getLeadsFromFirestore } from '@/lib/firebaseAdmin';
import { WHATSAPP_SALES_NUMBER } from '@/lib/config';
import { sendWhatsAppMessage } from '@/lib/whatsappSend';

export async function GET() {
  try {
    const leads = await getLeadsFromFirestore();

    const now = Date.now();
    const past24h = now - 24 * 60 * 60 * 1000;

    const recentLeads = leads.filter(
      (l) => new Date(l.createdAt).getTime() >= past24h
    );

    const autoHandled = recentLeads.filter((l) => l.autoSent);
    const needsYou = recentLeads.filter((l) => !l.autoSent || l.aiScore === 'cold');

    const digestMessage = `*MSR Daily Digest* 🌅\n\n📊 *${recentLeads.length}* new leads in the past 24 hours.\n🤖 *${autoHandled.length}* auto-replied & qualified by AI.\n⚠️ *${needsYou.length}* waiting in your "Needs You" queue.\n\nDashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://msrnextgen.com'}/admin/dashboard`;

    // Attempt to dispatch to owner's WhatsApp
    const sendResult = await sendWhatsAppMessage(WHATSAPP_SALES_NUMBER, digestMessage);

    return NextResponse.json({
      success: true,
      stats: {
        total24h: recentLeads.length,
        autoHandled: autoHandled.length,
        needsYou: needsYou.length,
      },
      sentToOwner: sendResult.sent,
      digestMessage,
    });
  } catch (err) {
    console.error('Daily Digest Cron Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to generate digest' }, { status: 500 });
  }
}
