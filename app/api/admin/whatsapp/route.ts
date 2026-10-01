import { NextRequest, NextResponse } from 'next/server';

const CLOUD_WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';
const LOCAL_WORKER_URL = 'http://localhost:5001';

async function fetchFromWorker(path: string, options?: RequestInit): Promise<Response | null> {
  // Try cloud worker first (or local if configured)
  const targets = [CLOUD_WORKER_URL, LOCAL_WORKER_URL];
  for (const base of targets) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) return res;
    } catch {
      // try next
    }
  }
  return null;
}

export async function GET() {
  try {
    const res = await fetchFromWorker('/status', { cache: 'no-store' });
    if (res && res.ok) {
      const data = await res.json();
      return NextResponse.json({ running: true, ...data });
    }
  } catch {
    // offline
  }

  return NextResponse.json({
    running: false,
    status: 'offline',
    message: 'WhatsApp Baileys worker is offline or spinning up. Check Render or start locally.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, message } = body;

    if (action === 'test_send') {
      const res = await fetchFromWorker('/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    }

    if (action === 'restart') {
      const res = await fetchFromWorker('/restart', { method: 'POST' });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    if (action === 'reset' || action === 'logout' || action === 'disconnect') {
      const res = await fetchFromWorker('/reset', { method: 'POST' });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({ success: false, error: 'Worker unreachable or invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Worker communication error' },
      { status: 500 }
    );
  }
}
