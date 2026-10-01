import { NextRequest, NextResponse } from 'next/server';

/**
 * Dedicated API route for Customer 5-Minute Sandbox Demo (/agents)
 * Communicates with the sandbox engine on port 5001 (/sandbox/status, /sandbox/start, /sandbox/disconnect).
 * 
 * NEVER interacts with or disconnects the Admin / Mukul Business WhatsApp session!
 */

export async function GET() {
  try {
    const res = await fetch('http://localhost:5001/sandbox/status', {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Sandbox worker offline
  }

  return NextResponse.json({
    success: false,
    status: 'idle',
    qrCode: null,
    user: null,
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
