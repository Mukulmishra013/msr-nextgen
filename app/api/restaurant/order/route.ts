import { NextRequest, NextResponse } from 'next/server';
import { saveRestaurantOrder, getRestaurantSettings } from '@/lib/restaurantStore';

const WORKER_URL = process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, table, items, subtotal, specialNote, birthday } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer name and at least 1 item are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '';
    const finalPhone = cleanPhone.length >= 10 ? cleanPhone : '919519342440'; // Fallback demo number if skip mode

    // Save order & update customer profile in persistent store
    const { order, customer } = await saveRestaurantOrder({
      customerName: customerName.trim(),
      phone: finalPhone,
      table: table || 'Table 4',
      items,
      subtotal: Number(subtotal) || 0,
      specialNote: specialNote || '',
      birthday: birthday || '',
    });

    // Fetch live Manager & Chef routing settings
    const settings = await getRestaurantSettings();

    // Formulate Order Confirmation Message for Customer
    const itemsList = items
      .map((it: any) => `• ${it.qty}x ${it.name} (₹${it.price * it.qty})`)
      .join('\n');

    const customerMessage = `🍽️ *${settings.restaurantName.toUpperCase()} • ORDER CONFIRMED!*
━━━━━━━━━━━━━━━━━━━━
Namaste *${customerName}* ji! 🙏
Aapka table order kitchen ko bhej diya gaya hai:

*Order ID*: #${order.id}
*Table*: ${order.table}
${itemsList}

💰 *Total Amount*: ₹${order.subtotal}
${order.specialNote ? `📝 *Special Request*: "${order.specialNote}"\n` : ''}
👨‍🍳 *Status*: *Kitchen Preparing (15-20 mins)*
Humne head chef aur floor manager ko notify kar diya hai!

Bon Appétit & Enjoy your meal! ✨
━━━━━━━━━━━━━━━━━━━━
${settings.restaurantName} • Craft Kitchen`;

    // Formulate Kitchen & Manager Ticket
    const kitchenTicket = `🚨 *NEW TABLE ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━
📍 *${order.table}*
👤 *Guest*: ${customerName} (+${finalPhone})
🆔 *Order ID*: #${order.id}
${itemsList}

💵 *Total*: ₹${order.subtotal}
📝 *Notes*: ${order.specialNote || 'None'}
⏰ *Received*: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━
Kitchen Order Ticket • Automated POS`;

    // Dispatch WhatsApp via Worker to Customer, Manager, and Chef
    const dispatchPromises: Promise<any>[] = [];

    // 1. Send to Customer if valid 10-digit number
    if (finalPhone && finalPhone.length >= 10) {
      dispatchPromises.push(
        fetch(`${WORKER_URL}/restaurant/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: finalPhone, message: customerMessage }),
          signal: AbortSignal.timeout(3500),
        }).catch(() => {})
      );
    }

    // 2. Send to Manager if enabled
    if (settings.sendToManager && settings.managerPhone) {
      dispatchPromises.push(
        fetch(`${WORKER_URL}/restaurant/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: settings.managerPhone, message: kitchenTicket }),
          signal: AbortSignal.timeout(3500),
        }).catch(() => {})
      );
    }

    // 3. Send to Chef if enabled (and different from manager)
    if (settings.sendToChef && settings.chefPhone && settings.chefPhone !== settings.managerPhone) {
      dispatchPromises.push(
        fetch(`${WORKER_URL}/restaurant/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: settings.chefPhone, message: kitchenTicket }),
          signal: AbortSignal.timeout(3500),
        }).catch(() => {})
      );
    }

    // Await with graceful timeout
    await Promise.allSettled(dispatchPromises);

    // Fallback Direct WhatsApp Click-to-Chat URL
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(customerMessage)}`;
    const managerWhatsappUrl = `https://wa.me/${settings.managerPhone}?text=${encodeURIComponent(kitchenTicket)}`;

    return NextResponse.json({
      success: true,
      order,
      customer,
      message: customerMessage,
      whatsappUrl,
      managerWhatsappUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
