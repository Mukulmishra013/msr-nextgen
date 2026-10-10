import { NextRequest, NextResponse } from 'next/server';
import { createClientAccount, signSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local_user';
    const rateCheck = checkRateLimit(`signup_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many signup attempts. Kripya thoda wait karein.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, businessName, category, email, phone, password, city } = body;

    if (!name || !businessName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, Business Name, Email, Phone aur Password sabhi zaroori hain.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password kam se kam 6 characters ka hona chahiye.' },
        { status: 400 }
      );
    }

    const result = createClientAccount({
      name,
      businessName,
      category,
      email,
      phone,
      password,
      city,
    });

    if (!result.success || !result.account) {
      return NextResponse.json({ success: false, error: result.error || 'Signup failed' }, { status: 400 });
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
      message: 'Account created successfully!',
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
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
