import { NextRequest, NextResponse } from 'next/server';

/**
 * Dedicated API route for Customer 5-Minute Sandbox Demo (/agents)
 * Communicates with the sandbox engine on port 5001 (/sandbox/status, /sandbox/start, /sandbox/disconnect).
 * 
 * NEVER interacts with or disconnects the Admin / Mukul Business WhatsApp session!
 */

const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const res = await fetch(`${WORKER_URL}/sandbox/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Sandbox local worker offline (standard on serverless cloud like Vercel)
  }

  // Graceful cloud simulator state so visitors on Vercel are never stuck on infinite loading
  return NextResponse.json({
    success: true,
    status: 'cloud_ready',
    qrCode: null,
    user: null,
    isCloudFallback: true,
    secondsLeft: 300,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'start') {
      const res = await fetch('http://localhost:5001/sandbox/start', {
        method: 'POST',
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'disconnect') {
      const res = await fetch('http://localhost:5001/sandbox/disconnect', {
        method: 'POST',
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: 'Invalid sandbox action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Sandbox communication error' },
      { status: 500 }
    );
  }
}
