import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantSettings, saveRestaurantSettings, RestaurantSettings } from '@/lib/restaurantStore';

const CLOUD_WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';
const LOCAL_WORKER_URL = 'http://localhost:5001';

async function fetchFromWorker(path: string, options?: RequestInit): Promise<Response | null> {
  const targets = [CLOUD_WORKER_URL, LOCAL_WORKER_URL];
  for (const base of targets) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) return res;
    } catch {
      // try next
    }
  }
  return null;
}

function formatPhoneForWa(phone: string): string {
  let clean = String(phone || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  return clean;
}

export async function GET() {
  try {
    let settings = await getRestaurantSettings();

    // Try checking if worker has an even newer configuration
    try {
      const workerRes = await fetchFromWorker('/restaurant/settings', { cache: 'no-store' });
      if (workerRes) {
        const workerData = await workerRes.json();
        if (workerData.success && workerData.settings) {
          const workerSettings = workerData.settings as RestaurantSettings;
          if ((workerSettings.updatedAt || 0) > (settings.updatedAt || 0)) {
            settings = await saveRestaurantSettings(workerSettings);
          }
        }
      }
    } catch {}

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'test_ping') {
      const current = await getRestaurantSettings();
      const testMsg = `🔔 *TEST KITCHEN & MANAGER ALERT*
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro Table AI routing test successful!
⏰ ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
System: MSR Next Gen Restaurant Engine`;

      let sentCount = 0;
      if (current.sendToManager && current.managerPhone) {
        const mgrPhone = formatPhoneForWa(current.managerPhone);
        try {
          await fetchFromWorker('/restaurant/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: mgrPhone, message: testMsg }),
          });
          sentCount++;
        } catch {}
      }

      if (current.sendToChef && current.chefPhone && current.chefPhone !== current.managerPhone) {
        const chefPhone = formatPhoneForWa(current.chefPhone);
        try {
          await fetchFromWorker('/restaurant/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: chefPhone, message: testMsg }),
          });
          sentCount++;
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: `Test ping dispatched to ${sentCount} recipient(s)!`,
        managerPhone: current.managerPhone,
        chefPhone: current.chefPhone,
      });
    }

    const { managerPhone, chefPhone, restaurantName, sendToManager, sendToChef, updatedAt } = body;
    const saveTime = updatedAt || Date.now();

    const updated = await saveRestaurantSettings({
      ...(managerPhone !== undefined ? { managerPhone } : {}),
      ...(chefPhone !== undefined ? { chefPhone } : {}),
      ...(restaurantName !== undefined ? { restaurantName } : {}),
      ...(sendToManager !== undefined ? { sendToManager: Boolean(sendToManager) } : {}),
      ...(sendToChef !== undefined ? { sendToChef: Boolean(sendToChef) } : {}),
      updatedAt: saveTime,
    });

    // Sync with worker in background
    try {
      fetchFromWorker('/restaurant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
