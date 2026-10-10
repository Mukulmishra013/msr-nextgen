import { NextRequest, NextResponse } from 'next/server';
import { verifySession, getClientAccountById, getClientAccountByPhone } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('msr_session')?.value;
    const session = verifySession(token);

    if (!session || session.role !== 'client') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let client = (await getClientAccountById(session.userId)) || (session.phone ? await getClientAccountByPhone(session.phone) : null);
    if (!client && session.role === 'client') {
      client = {
        id: session.userId,
        name: session.name || 'Client',
        businessName: session.businessName || 'Business',
        category: 'Partner',
        email: session.email,
        phone: session.phone || '',
        passwordHash: '',
        salt: '',
        createdAt: Date.now(),
      };
    }
    if (!client) {
      return NextResponse.json({ success: false, error: 'Client account not found' }, { status: 404 });
    }

    const cleanPhone = client.phone.replace(/\D/g, '');

    // 1. Fetch Client Orders from Supabase or fallback
    let orders: any[] = [];
    try {
      const { data: dbOrders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('client_phone', cleanPhone)
        .order('created_at', { ascending: false });

      if (dbOrders && dbOrders.length > 0) {
        orders = dbOrders;
      }
    } catch {}

    // 2. Fetch Onboarding Details from Supabase or fallback
    let onboarding: any = null;
    try {
      const { data: dbOnboard } = await supabaseAdmin
        .from('client_onboarding')
        .select('*')
        .eq('client_phone', cleanPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (dbOnboard && dbOnboard.length > 0) {
        onboarding = dbOnboard[0];
      }
    } catch {}

    // 3. Check WhatsApp Engine Bot status for this client
    let botStatus: any = { connected: true, agentName: 'Maya AI', phone: cleanPhone };
    try {
      const crmFile = path.join(process.cwd(), 'data', 'whatsapp_sales_crm.json');
      if (fs.existsSync(crmFile)) {
        const crmData = JSON.parse(fs.readFileSync(crmFile, 'utf8'));
        const lead = Object.values(crmData).find((c: any) => c.phone?.includes(cleanPhone) || cleanPhone.includes(c.phone));
        if (lead) {
          botStatus.stage = (lead as any).stage;
          botStatus.meetingSlot = (lead as any).meetingSlot;
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        businessName: client.businessName,
        category: client.category,
        email: client.email,
        phone: client.phone,
        city: client.city || '',
        createdAt: client.createdAt,
      },
      orders,
      onboarding,
      botStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch profile' }, { status: 500 });
  }
}
