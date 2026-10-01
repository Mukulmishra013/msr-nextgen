'use client';

import React from 'react';
import Link from 'next/link';
import { AGENCY_CONFIG, getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { MessageCircle } from 'lucide-react';

export default function Navbar() {
  const { showToast } = useToast();

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent('whatsapp_click', { source: 'navbar' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-surface-200 transition-all">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-600 rounded-lg"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-sm group-hover:shadow-md transition-shadow">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-brand-600 transition-colors">
              MSR NEXT GEN
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-normal mt-0.5">
              Growth & AI Agency
            </span>
          </div>
        </Link>

        {/* Desktop / TV Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm tv:text-base font-semibold text-slate-700">
          <Link
            href="/agents"
            className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200/80 transition-colors shadow-2xs"
          >
            <span>AI Agents Hub</span>
            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black tracking-wider animate-pulse">
              New
            </span>
          </Link>
          <a href="/#services" className="hover:text-brand-600 transition-colors">
            Services
          </a>
          <a href="/#brands" className="hover:text-brand-600 transition-colors">
            Brands We Manage
          </a>
          <a href="/#case-study" className="hover:text-brand-600 transition-colors">
            Case Study
          </a>
          <a href="/#ai-demo" className="hover:text-brand-600 transition-colors">
            Live Demo
          </a>
          <a href="/#about" className="hover:text-brand-600 transition-colors">
            About
          </a>
        </nav>

        {/* Quick WhatsApp Action (Right Header) */}
        <div className="flex items-center gap-3">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm tv:text-base font-bold shadow-sm hover:shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span className="hidden xs:inline">WhatsApp Us</span>
            <span className="xs:hidden">Chat</span>
          </a>
        </div>
      </div>
    </header>
  );
}
