import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, OnboardingDbRecord } from '@/lib/supabase';

// GET: Check onboarding status for a client
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const orderId = searchParams.get('orderId');

    if (!phone && !orderId) {
      return NextResponse.json({ error: 'Phone or Order ID is required' }, { status: 400 });
    }

    let query = supabaseAdmin.from('client_onboarding').select('*');
    if (orderId) {
      query = query.eq('order_id', orderId);
    } else if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      query = query.eq('client_phone', cleanPhone);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, onboarding: data?.[0] || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch onboarding' }, { status: 500 });
  }
}

// POST: Submit onboarding details after payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      onboardingToken,
      orderId,
      clientPhone,
      businessName,
      businessType,
      address,
      googleMapsLink,
      instagramHandle,
      managerPhone,
      staffPhone,
      assetsUrls,
      menuOrServicesDoc,
      notes,
    } = body;

    if (!clientPhone || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Client phone, business name, and business type are required' },
        { status: 400 }
      );
    }

    const cleanPhone = String(clientPhone).replace(/\D/g, '');

    // -------------------------------------------------------------------------
    // 🛡️ CRITICAL PAYMENT & AUTHORIZATION GATE
    // -------------------------------------------------------------------------
    let isAuthorized = false;
    const { verifyOnboardingToken, verifySession, linkOrderToClientAccount, getClientAccountByPhone } = await import('@/lib/auth');

    // 1. Verify cryptographic onboarding token
    if (onboardingToken) {
      const verified = verifyOnboardingToken(onboardingToken);
      if (verified) {
        isAuthorized = true;
      }
    }

    // 2. Secondary verify against trusted database order
    if (!isAuthorized && orderId) {
      try {
        const { data: dbOrder } = await supabaseAdmin
          .from('orders')
          .select('id, status, client_phone')
          .or(`id.eq.${orderId},razorpay_order_id.eq.${orderId}`)
          .maybeSingle();

        if (dbOrder && dbOrder.status === 'paid') {
          isAuthorized = true;
        }
      } catch {}
    }

    // 3. Tertiary verify: Admin override
    if (!isAuthorized) {
      const adminToken = req.cookies.get('msr_admin_session')?.value;
      const adminSession = verifySession(adminToken);
      if (adminSession && adminSession.role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: 'Payment verification failed: Valid payment token ya paid order zaroori hai onboarding karne ke liye.',
        },
        { status: 403 }
      );
    }

    // Resolve order UUID if razorpay order string (e.g. order_Tm8WsZPMCGSGQD) was passed
    let dbOrderId: string | undefined = undefined;
    if (orderId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
        dbOrderId = orderId;
      } else {
        const { data: matchedOrder } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle();
        if (matchedOrder?.id) {
          dbOrderId = matchedOrder.id;
        }
      }
    }

    // -------------------------------------------------------------------------
    // 🛡️ PREVENT DUPLICATE ONBOARDING SUBMISSIONS FOR SAME ORDER
    // -------------------------------------------------------------------------
    const checkTargetId = dbOrderId || orderId;
    if (checkTargetId) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('client_onboarding')
          .select('id')
          .eq('order_id', checkTargetId)
          .limit(1);

        if (existing && existing.length > 0) {
          return NextResponse.json(
            { error: 'Yeh order pehle se onboard ho chuka hai. Kripya apna Client Portal check karein.' },
            { status: 409 }
          );
        }
      } catch {}
    }

    const record: OnboardingDbRecord = {
      order_id: dbOrderId || orderId,
      client_phone: cleanPhone,
      business_name: businessName.trim(),
      business_type: businessType.trim(),
      address: address?.trim() || '',
      google_maps_link: googleMapsLink?.trim() || '',
      instagram_handle: instagramHandle?.trim() || '',
      manager_phone: managerPhone ? String(managerPhone).replace(/\D/g, '') : '',
      staff_phone: staffPhone ? String(staffPhone).replace(/\D/g, '') : '',
      assets_urls: Array.isArray(assetsUrls) ? assetsUrls : [],
      menu_or_services_doc: menuOrServicesDoc?.trim() || '',
      status: 'onboarding_pending', // Will transition to 'setup_running' -> 'testing' -> 'active'
      owner_approved: false, // Must be approved by Mukul sir initially
      notes: notes?.trim() || '',
    };

    const { data, error } = await supabaseAdmin.from('client_onboarding').insert([record]).select().single();

    if (error) {
      console.error('[Onboarding Insert Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Link order to client account if exists
    try {
      const existingClient = getClientAccountByPhone(cleanPhone);
      if (existingClient && (dbOrderId || orderId)) {
        linkOrderToClientAccount(existingClient.id, dbOrderId || orderId);
      }
    } catch {}

    // Auto-dispatch confirmation & official receipt link to client on WhatsApp
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://msr-nextgen-live.vercel.app';
      const receiptUrl = `${siteUrl}/invoice?orderId=${encodeURIComponent(orderId || data?.id)}&phone=${encodeURIComponent(cleanPhone)}&business=${encodeURIComponent(businessName)}`;

      const clientMsg = `Namaste ${businessName}! 🎉\n\nMSR Next Gen me aapka swagat hai. Aapka onboarding details aur service activation queue me successfully record ho gaya hai.\n\n📄 *Official Payment Receipt & Tax Invoice*:\n${receiptUrl}\n\n⚙️ *Setup Status*: Hamari growth team & Maya AI aapke assets review karke testing shuru kar rahi hai. Mukul sir jald hi aapse direct connect karenge!\n\nKoi bhi sawal ho toh aap is number par direct reply kar sakte hain. 😊`;

      // Import dynamic to avoid cycle
      const { sendWhatsAppMessage } = await import('@/lib/whatsappSend');
      await sendWhatsAppMessage(cleanPhone, clientMsg);
    } catch (waErr) {
      console.warn('[WhatsApp Auto-Receipt Dispatch Notice]', waErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding details submitted successfully. Service setup queued.',
      onboardingId: data?.id,
      status: 'onboarding_pending',
    });
  } catch (error: any) {
    console.error('[Onboarding API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
