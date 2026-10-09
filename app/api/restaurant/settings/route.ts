import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantSettings, saveRestaurantSettings } from '@/lib/restaurantStore';

const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';

export async function GET() {
  try {
    const settings = await getRestaurantSettings();
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
        try {
          await fetch(`${WORKER_URL}/restaurant/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: current.managerPhone, message: testMsg }),
            signal: AbortSignal.timeout(3500),
          }).catch(() => {});
          sentCount++;
        } catch {}
      }

      if (current.sendToChef && current.chefPhone && current.chefPhone !== current.managerPhone) {
        try {
          await fetch(`${WORKER_URL}/restaurant/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: current.chefPhone, message: testMsg }),
            signal: AbortSignal.timeout(3500),
          }).catch(() => {});
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

    const { managerPhone, chefPhone, restaurantName, sendToManager, sendToChef } = body;
    const updated = await saveRestaurantSettings({
      ...(managerPhone !== undefined ? { managerPhone } : {}),
      ...(chefPhone !== undefined ? { chefPhone } : {}),
      ...(restaurantName !== undefined ? { restaurantName } : {}),
      ...(sendToManager !== undefined ? { sendToManager: Boolean(sendToManager) } : {}),
      ...(sendToChef !== undefined ? { sendToChef: Boolean(sendToChef) } : {}),
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
