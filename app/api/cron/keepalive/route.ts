import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Render Worker Keep-Alive & Health Ping
 * Pings https://msr-whatsapp-bot.onrender.com every 10-14 minutes
 * to prevent the free-tier container from falling into cold sleep.
 */
export async function GET(request: Request) {
  const targetUrl = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';

  const startTime = Date.now();
  let status = 'unknown';
  let latencyMs = 0;
  let isAlive = false;

  try {
    const res = await fetch(`${targetUrl}/status`, {
      method: 'GET',
      headers: { 'User-Agent': 'MSR-KeepAlive-Ping/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    latencyMs = Date.now() - startTime;
    status = res.statusText || `${res.status}`;
    isAlive = res.ok;
  } catch (err: any) {
    // If /health not found, try root /status
    try {
      const res = await fetch(`${targetUrl}/status`, {
        method: 'GET',
        headers: { 'User-Agent': 'MSR-KeepAlive-Ping/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      latencyMs = Date.now() - startTime;
      status = res.statusText || `${res.status}`;
      isAlive = res.ok;
    } catch (fallbackErr: any) {
      latencyMs = Date.now() - startTime;
      status = fallbackErr.message || 'connection_timeout';
      isAlive = false;
    }
  }

  return NextResponse.json({
    success: true,
    target: targetUrl,
    workerAlive: isAlive,
    latencyMs,
    status,
    timestamp: new Date().toISOString(),
  });
}
