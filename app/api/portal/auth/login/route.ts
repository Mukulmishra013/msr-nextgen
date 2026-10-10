import { NextRequest, NextResponse } from 'next/server';
import { authenticateClient, signSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local_user';
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many login attempts. Kripya ${rateCheck.resetSeconds}s baad try karein.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Mobile aur Password dono required hain.' },
        { status: 400 }
      );
    }

    const result = await authenticateClient(identifier, password);
    if (!result.success || !result.account) {
      return NextResponse.json({ success: false, error: result.error || 'Login failed' }, { status: 401 });
    }

    const token = signSession({
      userId: result.account.id,
      role: 'client',
      email: result.account.email,
      phone: result.account.phone,
      name: result.account.name,
      businessName: result.account.businessName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      client: {
        id: result.account.id,
        name: result.account.name,
        businessName: result.account.businessName,
        email: result.account.email,
        phone: result.account.phone,
        category: result.account.category,
      },
    });

    response.cookies.set('msr_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Login error' }, { status: 500 });
  }
}
