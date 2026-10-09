import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';

export async function GET() {
  try {
    const res = await fetch(`${WORKER_URL}/restaurant/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {}

  return NextResponse.json({
    success: true,
    status: 'cloud_ready',
    qrCode: null,
    user: null,
    isCloudFallback: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'start') {
      const res = await fetch(`${WORKER_URL}/restaurant/start`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'disconnect') {
      const res = await fetch(`${WORKER_URL}/restaurant/disconnect`, {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
