import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOYALTY_FILE = path.resolve(process.cwd(), 'data/restaurant-loyalty.json');
const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';
const MANAGER_PHONE = '919519342440';

function loadLoyaltyData() {
  try {
    if (fs.existsSync(LOYALTY_FILE)) {
      return JSON.parse(fs.readFileSync(LOYALTY_FILE, 'utf-8'));
    }
  } catch {}
  return { orders: [], customers: [] };
}

function saveLoyaltyData(data: any) {
  try {
    fs.writeFileSync(LOYALTY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, table, items, subtotal, specialNote, birthday } = body;

    if (!customerName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name, phone and at least 1 item are required' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const orderId = `GB-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newOrder = {
      id: orderId,
      customerName: customerName.trim(),
      phone: cleanPhone,
      table: table || 'Table 1',
      items,
      subtotal: Number(subtotal) || 0,
      status: 'Kitchen Preparing',
      createdAt: now,
      specialNote: specialNote || '',
    };

    const db = loadLoyaltyData();
    db.orders.unshift(newOrder);

    // Update or insert customer loyalty profile
    let customer = db.customers.find((c: any) => c.phone.includes(cleanPhone.slice(-10)));
    if (customer) {
      customer.name = customerName.trim();
      customer.totalVisits = (customer.totalVisits || 1) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + Number(subtotal);
      customer.lastVisit = now.split('T')[0];
      if (birthday) customer.birthday = birthday;
      if (items[0]?.name) customer.favoriteDish = items[0].name;
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        name: customerName.trim(),
        phone: cleanPhone,
        birthday: birthday || '15-10',
        birthdayDisplay: birthday ? `${birthday} (Saved)` : '15 Oct',
        favoriteDish: items[0]?.name || 'Signature Special',
        totalVisits: 1,
        totalSpent: Number(subtotal),
        lastVisit: now.split('T')[0],
        birthdayWishSent: false,
        status: 'New Guest',
      };
      db.customers.push(customer);
    }

    saveLoyaltyData(db);

    // Formulate Order Confirmation Message for Customer
    const itemsList = items
      .map((it: any) => `• ${it.qty}x ${it.name} (₹${it.price * it.qty})`)
      .join('\n');

    const customerMessage = `🍽️ *THE GRAND BISTRO • ORDER CONFIRMED!*
━━━━━━━━━━━━━━━━━━━━
Namaste *${customerName}* ji! 🙏
Aapka order receive ho gaya hai:

*Order ID*: #${orderId}
*Table*: ${table || 'Table 1'}
${itemsList}

💰 *Total Amount*: ₹${subtotal}
${specialNote ? `📝 *Special Request*: "${specialNote}"\n` : ''}
👨‍🍳 *Status*: *Humne restaurant manager aur head chef ko aapka order bhej diya hai!*
Aapka fresh khana 15-20 minutes me aapki table par serve hoga.

Bon Appétit & Enjoy your meal! ✨
━━━━━━━━━━━━━━━━━━━━
The Grand Bistro Craft Kitchen`;

    // Formulate Kitchen Ticket for Manager
    const managerMessage = `🚨 *NEW TABLE ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━
📍 *${table || 'Table 1'}*
👤 *Guest*: ${customerName} (+${cleanPhone})
🆔 *Order*: #${orderId}
${itemsList}

💵 *Total*: ₹${subtotal}
📝 *Notes*: ${specialNote || 'Standard'}
⏰ *Received*: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    // Try sending live WhatsApp message via Worker
    try {
      await fetch(`${WORKER_URL}/restaurant/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, message: customerMessage }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});

      await fetch(`${WORKER_URL}/restaurant/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: MANAGER_PHONE, message: managerMessage }),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch {}

    // Fallback Direct WhatsApp Click-to-Chat URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customerMessage)}`;

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: customerMessage,
      whatsappUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
