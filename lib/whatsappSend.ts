/**
 * WhatsApp Delivery & Action Module
 *
 * Supports three operating tiers:
 * 1. LINKED DEVICE (QR SCAN - RECOMMENDED): Sends directly from the user's existing
 *    phone number via the local Baileys engine worker on port 5001. No new number required!
 * 2. CLOUD API: Official Meta WhatsApp Business API (if token & phone_id are set in env).
 * 3. 1-CLICK MANUAL FALLBACK: Generates direct wa.me link with the AI prefilled reply
 *    for immediate 1-tap dispatch by the owner from the Admin Dashboard.
 */

export interface WhatsAppSendResult {
  sent: boolean;
  mode: 'linked_device' | 'cloud_api' | 'manual_fallback';
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  let cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  // ---------------------------------------------------------------------------
  // Tier 1: Try Render Cloud / Local WhatsApp Worker (Port 5001)
  // ---------------------------------------------------------------------------
  const targets = [
    process.env.WHATSAPP_WORKER_URL || 'https://msr-whatsapp-bot.onrender.com',
    'http://localhost:5001'
  ];

  for (const base of targets) {
    try {
      const workerRes = await fetch(`${base}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, message: messageText }),
        signal: AbortSignal.timeout(8000),
      });

      if (workerRes.ok) {
        const data = await workerRes.json();
        if (data.success) {
          console.log(`[WhatsApp Delivery: Linked Device] Sent to +${cleanPhone} via ${base}!`);
          return {
            sent: true,
            mode: 'linked_device',
            messageId: data.messageId,
          };
        }
      }
    } catch {
      // try next
    }
  }

  // ---------------------------------------------------------------------------
  // Tier 2: Meta Official Cloud API
  // ---------------------------------------------------------------------------
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: true, body: messageText },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          sent: true,
          mode: 'cloud_api',
          messageId: data.messages?.[0]?.id,
        };
      }
    } catch {
      // Fall through to manual fallback
    }
  }

  // ---------------------------------------------------------------------------
  // Tier 3: 1-Click Manual Fallback (Always Ready in Admin Dashboard)
  // ---------------------------------------------------------------------------
  console.log(
    `[WhatsApp Sender: 1-Click Fallback Ready] Prepared for +${cleanPhone}: "${messageText.substring(0, 50)}..."`
  );

  return {
    sent: false,
    mode: 'manual_fallback',
  };
}

/**
 * Generates a 1-click wa.me URL with pre-filled message
 */
export function getOneClickWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
