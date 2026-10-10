import { NextRequest, NextResponse } from 'next/server';

const SESSION_SECRET = process.env.ADMIN_SECRET_KEY || 'msr_admin_2026_growth_secure_token_secret_9988';

// Lightweight Edge-compatible HMAC-SHA256 signature verifier
async function verifyHmacToken(token: string | undefined | null): Promise<any | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  try {
    const [payloadB64, signature] = token.split('.');
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // base64url decode signature
    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadB64)
    );

    if (!isValid) return null;

    const jsonStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. ADMIN PROTECTED ROUTES (/admin/* and /api/admin/*)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = req.cookies.get('msr_admin_session')?.value;
    const session = await verifyHmacToken(adminToken);

    if (!session || session.role !== 'admin') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth') {
    const adminToken = req.cookies.get('msr_admin_session')?.value;
    const session = await verifyHmacToken(adminToken);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
  }

  // 2. CLIENT PORTAL PROTECTED ROUTES (/portal/* and /api/portal/*)
  if (
    pathname.startsWith('/portal') &&
    pathname !== '/portal/login' &&
    pathname !== '/portal/signup'
  ) {
    const clientToken = req.cookies.get('msr_session')?.value;
    const session = await verifyHmacToken(clientToken);

    if (!session) {
      const loginUrl = new URL('/portal/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    pathname.startsWith('/api/portal') &&
    !pathname.startsWith('/api/portal/auth')
  ) {
    const clientToken = req.cookies.get('msr_session')?.value;
    const session = await verifyHmacToken(clientToken);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Client login required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/portal/:path*',
    '/api/portal/:path*',
  ],
};
