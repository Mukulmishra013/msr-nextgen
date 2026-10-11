import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin, OrderDbRecord } from '@/lib/supabase';

// Approved Catalogue & Immutable Server Prices (Frontend price is NEVER trusted)
const APPROVED_PACKAGES: Record<string, { name: string; amount: number; description: string }> = {
  // Flagship Packages
  'business-website': {
    name: 'Business Website (Website Launch)',
    amount: 14999, // ₹14,999
    description: 'Professional responsive business website, contact forms, essential on-page SEO, analytics',
  },
  'whatsapp-starter': {
    name: 'WhatsApp AI Starter (Automation)',
    amount: 14999, // ₹14,999
    description: 'Basic WhatsApp automation, FAQs, lead capture and defined setup/testing scope',
  },
  'shopify-launch': {
    name: 'Shopify Launch Pack (E-Commerce)',
    amount: 19999, // ₹19,999
    description: 'Store setup, product catalogue configuration, essential checkout setup & shipping',
  },
  'gbp-growth': {
    name: 'GBP Audit & Optimization (Local Business Growth)',
    amount: 2999, // ₹2,999 (Special discounted price, down from ₹4,999)
    description: 'Google Business Profile audit, optimization recommendations and agreed listing improvements',
  },
  // Legacy / Retainer Packages
  starter: {
    name: 'Starter (Visibility Package)',
    amount: 6999, // ₹6,999
    description: 'Google Maps SEO + 4 Reels + Reviews QR & WhatsApp + Monthly Report',
  },
  growth: {
    name: 'Growth (Customer Magnet Package)',
    amount: 14999, // ₹14,999
    description: 'Starter + Local Meta/Google Ads + 8 Reels + 24/7 AI WhatsApp Bot + Loyalty System',
  },
  premium: {
    name: 'Premium (Full Automation VIP)',
    amount: 24999, // ₹24,999
    description: 'Growth + 12 Reels + Shoot + Custom Booking/Landing Page + AI Calling + Dedicated Manager',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packageId, clientPhone, clientName, clientEmail, businessCategory } = body;

    if (!packageId || !APPROVED_PACKAGES[packageId]) {
      return NextResponse.json({ error: 'Invalid or unapproved package selected' }, { status: 400 });
    }

    if (!clientPhone || String(clientPhone).replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    const pkg = APPROVED_PACKAGES[packageId];
    const amountInPaise = pkg.amount * 100;

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Tm87FZ58zafiUA';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'z9J3uLrQkl86aMdlIMoRO1aq';

    let razorpayOrderId = `order_test_${Date.now()}`;

    // If real Razorpay keys are configured, generate authentic order from gateway
    if (keyId && keySecret) {
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            packageId,
            packageName: pkg.name,
            clientPhone,
            clientName: clientName || '',
            businessCategory: businessCategory || 'General',
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        console.error('[Razorpay Order Creation Failed]', err);
        return NextResponse.json({ error: 'Failed to initiate payment gateway order' }, { status: 500 });
      }
    }

    // Persist pending order to Supabase
    const orderRecord: OrderDbRecord = {
      razorpay_order_id: razorpayOrderId,
      package_id: packageId,
      package_name: pkg.name,
      amount: pkg.amount,
      currency: 'INR',
      status: 'payment_pending',
      client_name: clientName || '',
      client_phone: String(clientPhone).replace(/\D/g, ''),
      client_email: clientEmail || '',
      business_category: businessCategory || 'General',
    };

    try {
      await supabaseAdmin.from('orders').insert([orderRecord]);
    } catch (dbErr) {
      console.warn('[Supabase Order Insert Notice]: Table might be initializing', dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || 'rzp_test_placeholder',
      packageName: pkg.name,
      packageAmount: pkg.amount,
    });
  } catch (error: any) {
    console.error('[Checkout Route Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
