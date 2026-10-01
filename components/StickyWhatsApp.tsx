'use client';

import React from 'react';
import { getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { MessageCircle } from 'lucide-react';

export default function StickyWhatsApp() {
  const { showToast } = useToast();

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'sticky_button' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
    }
  };

  return (
    <aside
      aria-label="Contact via WhatsApp"
      className="fixed bottom-safe right-4 sm:right-6 z-50 pointer-events-auto"
    >
      <a
        href={getWhatsAppUrl('Hi MSR Next Gen, I would like to chat about growing my business.')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl hover:shadow-[#25D366]/40 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Subtle Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none opacity-75" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-[#25D366] shrink-0 drop-shadow-xs" />

        {/* Label on larger screens / mobile thumb label */}
        <span className="hidden sm:inline-block font-extrabold text-sm sm:text-base text-white tracking-wide pr-1">
          Chat on WhatsApp
        </span>

        {/* Unread dot / Status Indicator */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full" />
      </a>
    </aside>
  );
}
