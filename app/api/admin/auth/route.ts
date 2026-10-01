import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'msr_admin_2026_growth';

    if (!password || password !== adminSecret) {
      return NextResponse.json({ success: false, error: 'Invalid admin credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated' });
    
    // Set admin session cookie
    response.cookies.set('msr_admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Auth error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('msr_admin_session');
  return response;
}
