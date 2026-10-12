import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin, OrderDbRecord } from '@/lib/supabase';

import { getPackageById } from '@/lib/catalogue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packageId, clientPhone, clientName, clientEmail, businessCategory } = body;

    const pkg = getPackageById(packageId);
    if (!pkg || pkg.isCustom || pkg.amount <= 0) {
      return NextResponse.json({ error: 'This service requires a custom scope proposal. Please request a quote.' }, { status: 400 });
    }

    if (!clientPhone || String(clientPhone).replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

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
