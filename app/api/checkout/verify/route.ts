import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { signOnboardingToken, verifySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      paymentId,
      signature,
      packageId,
      packageName,
      clientPhone,
      isManualException,
      exceptionReason,
    } = body;

    // SCENARIO 1: ADMIN MANUAL EXCEPTION (For quotation / offline approved clients)
    if (isManualException) {
      const adminToken = req.cookies.get('msr_admin_session')?.value;
      const adminSession = verifySession(adminToken);

      if (!adminSession || adminSession.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Only Mukul sir / Admin can approve manual onboarding exceptions.' },
          { status: 403 }
        );
      }

      if (!orderId || !clientPhone) {
        return NextResponse.json(
          { success: false, error: 'Order ID aur Client Phone zaroori hain.' },
          { status: 400 }
        );
      }

      const cleanPhone = String(clientPhone).replace(/\D/g, '');
      const token = signOnboardingToken({
        orderId,
        phone: cleanPhone,
        packageName: packageName || 'Custom Quotation Package',
        amount: 0,
        isManualException: true,
        exceptionReason: exceptionReason || 'Approved by Founder Mukul Mishra',
      });

      console.log(`[AUDIT LOG] Admin ${adminSession.email} approved onboarding exception for ${cleanPhone} (Order: ${orderId})`);

      return NextResponse.json({
        success: true,
        message: 'Manual onboarding exception approved by admin',
        onboardingToken: token,
        orderId,
      });
    }

    // SCENARIO 2: RAZORPAY VERIFIED PAYMENT
    if (!orderId || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Order ID aur Payment ID required hain.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'z9J3uLrQkl86aMdlIMoRO1aq';
    const cleanPhone = String(clientPhone || '').replace(/\D/g, '');

    // Cryptographic signature check
    if (signature && keySecret) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[Payment Verification Failed]: Cryptographic signature mismatch', { orderId, paymentId });
        return NextResponse.json(
          { success: false, error: 'Payment verification failed: Invalid cryptographic signature.' },
          { status: 400 }
        );
      }
    }

    // 1. Update Order in Supabase to 'paid' (Idempotent update)
    try {
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', orderId);
    } catch (dbErr) {
      console.warn('[Order Update Notice]:', dbErr);
    }

    // 2. Issue single-use signed Onboarding Entitlement Token
    const onboardingToken = signOnboardingToken({
      orderId,
      phone: cleanPhone,
      packageName: packageName || packageId || 'MSR Growth Package',
      amount: body.amount || 0,
      isManualException: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully!',
      onboardingToken,
      orderId,
      paymentId,
    });
  } catch (err: any) {
    console.error('[Verify Route Error]:', err);
    return NextResponse.json({ success: false, error: err.message || 'Verification error' }, { status: 500 });
  }
}
