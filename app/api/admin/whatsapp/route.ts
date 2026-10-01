import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:5001/status', {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ running: true, ...data });
    }
  } catch {
    // Worker not running on port 5001
  }

  return NextResponse.json({
    running: false,
    status: 'offline',
    message: 'WhatsApp Baileys worker is offline. Start it with `npm run whatsapp`',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, message } = body;

    if (action === 'test_send') {
      const res = await fetch('http://localhost:5001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === 'restart') {
      const res = await fetch('http://localhost:5001/restart', { method: 'POST' });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'reset' || action === 'logout' || action === 'disconnect') {
      const res = await fetch('http://localhost:5001/reset', { method: 'POST' });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Worker communication error' },
      { status: 500 }
    );
  }
}
