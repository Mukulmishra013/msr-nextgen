import { NextRequest, NextResponse } from 'next/server';
import { signSession, verifySession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimiter';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('msr_admin_session')?.value;
  const session = verifySession(token);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      name: session.name || 'Mukul Mishra (Admin)',
      role: 'admin',
      email: session.email,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local_admin';
    const rateCheck = checkRateLimit(`admin_login_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Kripya ${rateCheck.resetSeconds} seconds baad try karein.`,
        },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'msr_admin_2026_growth';

    if (!password || String(password).trim() !== adminSecret) {
      return NextResponse.json({ success: false, error: 'Invalid admin passcode' }, { status: 401 });
    }

    // Issue cryptographically signed HMAC-SHA256 session token
    const token = signSession({
      userId: 'admin_mukul',
      role: 'admin',
      email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'msbestshoopingpro@gmail.com',
      name: 'Mukul Mishra',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin access granted',
      token,
    });

    response.cookies.set('msr_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Authentication error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('msr_admin_session');
  return response;
}

