import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CRM_FILE = path.join(process.cwd(), 'data', 'whatsapp_sales_crm.json');

export async function GET() {
  // 1. Try to fetch live from the dual-engine WhatsApp worker
  try {
    const res = await fetch('http://localhost:5001/crm/conversations', {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
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
      const res = await fetch('http://localhost:5001/crm/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, updates }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === 'trigger_followup') {
      const res = await fetch('http://localhost:5001/crm/trigger-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ success: false, error: 'Invalid CRM action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
