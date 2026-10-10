import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Cryptographic signature check (Prevents spoofed payments)
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[Razorpay Webhook Error]: Invalid signature verification');
        return NextResponse.json({ error: 'Invalid cryptographic signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const clientPhone = payment.contact || payment.notes?.clientPhone;

      console.log(`[Payment Verified]: Order ${orderId}, Payment ${paymentId}`);

      // 1. Update Order in Supabase to 'paid' (Idempotent update)
      if (orderId) {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            razorpay_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId);
      }

      // 2. Shut off marketing sales followups in CRM (Opt-out paid client)
      if (clientPhone) {
        const cleanPhone = String(clientPhone).replace(/\D/g, '');
        await supabaseAdmin
          .from('leads')
          .update({
            stage: 'converted',
            notes: `Paid customer for order ${orderId}. Sales followups terminated.`,
          })
          .eq('phone', cleanPhone);
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
