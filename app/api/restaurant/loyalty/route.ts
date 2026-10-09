import { NextRequest, NextResponse } from 'next/server';
import {
  getRestaurantData,
  registerOrUpdateGuest,
  sendBirthdayWish,
} from '@/lib/restaurantStore';

const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';

export async function GET() {
  try {
    const data = await getRestaurantData();
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Guest Registration on Menu Visit / Birthday Pass
    if (action === 'register_guest') {
      const { name, phone, birthday, table } = body;
      if (!name && !phone) {
        return NextResponse.json({ success: false, error: 'Name or phone required' }, { status: 400 });
      }

      const customer = await registerOrUpdateGuest({
        name: name || 'Valued Guest',
        phone,
        birthday,
        table,
      });

      return NextResponse.json({ success: true, customer });
    }

    // 2. Send Birthday Greeting Voucher
    if (action === 'send_birthday_wish') {
      const { customerId } = body;
      const data = await getRestaurantData();
      const customer = data.customers.find((c) => c.id === customerId);

      if (!customer) {
        return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
      }

      const wishMessage = `🎂 *ADVANCE HAPPY BIRTHDAY ${customer.name.toUpperCase()} JI!* 🎉
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro family ki taraf se aapke aane wale special day ke liye dher saari shubhkaamnayein! 🎁

Aapke Birthday celebration ko grand banane ke liye hamare Chef ki taraf se ek special gift:
✨ *1 Complimentary Signature Belgian Chocolate Lava Cake (₹249 Free)*
✨ *Flat 15% OFF on your entire celebration bill*

Aap apni family aur dosto ke sath kab aana chahenge? 
Table reserve karne ke liye bas yaha *"Book Birthday Table"* reply karein, hum VIP table ready rakhenge! 🥂
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro • Craft Kitchen`;

      // Dispatch via WhatsApp worker if phone available
      if (customer.phone && customer.phone.length >= 10) {
        try {
          await fetch(`${WORKER_URL}/restaurant/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: customer.phone, message: wishMessage }),
            signal: AbortSignal.timeout(3500),
          }).catch(() => {});
        } catch {}
      }

      await sendBirthdayWish(customerId);
      const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodeURIComponent(wishMessage)}`;

      return NextResponse.json({
        success: true,
        message: wishMessage,
        whatsappUrl,
        customer,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
