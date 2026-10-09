import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CLOUD_WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';
const LOCAL_WORKER_URL = 'http://localhost:5001';
const CRM_FILE = path.join(process.cwd(), 'data', 'whatsapp_sales_crm.json');

async function fetchFromWorker(path: string, options?: RequestInit): Promise<Response | null> {
  const targets = [CLOUD_WORKER_URL, LOCAL_WORKER_URL];
  for (const base of targets) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return res;
    } catch {
      // try next
    }
  }
  return null;
}

export async function GET() {
  // 1. Try to fetch live from the dual-engine WhatsApp worker (Render or Local)
  try {
    const res = await fetchFromWorker('/crm/conversations', { cache: 'no-store' });
    if (res && res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Worker offline or restarting, fallback to disk
  }

  // 2. Direct fallback reading from data/whatsapp_sales_crm.json
  try {
    if (fs.existsSync(CRM_FILE)) {
      const raw = fs.readFileSync(CRM_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const leads = Object.values(data).sort(
        (a: any, b: any) => (b.lastActive || 0) - (a.lastActive || 0)
      );
      return NextResponse.json({ success: true, count: leads.length, leads });
    }
  } catch (err: unknown) {
    console.error('[CRM API Disk Read Error]:', err);
  }

  return NextResponse.json({ success: true, count: 0, leads: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, updates, message } = body;

    if (action === 'update_lead') {
      const res = await fetchFromWorker('/crm/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, updates }),
      });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    }

    if (action === 'trigger_followup') {
      const res = await fetchFromWorker('/crm/trigger-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    }

    if (action === 'delete_lead') {
      const res = await fetchFromWorker('/crm/delete-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }

      // Fallback: Delete directly from local disk
      try {
        if (fs.existsSync(CRM_FILE)) {
          const raw = fs.readFileSync(CRM_FILE, 'utf-8');
          const data = JSON.parse(raw);
          const cleanPhone = String(phone).replace(/[^0-9]/g, '');
          delete data[cleanPhone];
          delete data[phone];
          fs.writeFileSync(CRM_FILE, JSON.stringify(data, null, 2), 'utf-8');
          return NextResponse.json({ success: true, deleted: true, phone });
        }
      } catch (err: unknown) {
        console.error('[CRM API Disk Delete Error]:', err);
      }
    }

    return NextResponse.json({ success: false, error: 'Worker unreachable or invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'CRM worker error' },
      { status: 500 }
    );
  }
}
