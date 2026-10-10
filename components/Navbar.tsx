'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AGENCY_CONFIG, getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { MessageCircle, Menu, X, Bot, ChevronRight, User } from 'lucide-react';

export default function Navbar() {
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navbarWaUrl = getWhatsAppUrl('Hi MSR Next Gen, I want to explore high-converting Ads and 24/7 AI WhatsApp automation.');

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent('whatsapp_click', { source: 'navbar' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
      return;
    }
    try {
      if (typeof window !== 'undefined' && !e.defaultPrevented) {
        window.open(navbarWaUrl, '_blank');
        e.preventDefault();
      }
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-surface-200 transition-all">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
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
            href="/restaurant"
            className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-200/80 transition-colors shadow-2xs"
          >
            <span>🍽️ Restaurant AI Demo</span>
            <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black tracking-wider">
              QR
            </span>
          </Link>
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

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Client Portal Access */}
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm tv:text-base font-bold shadow-sm hover:shadow-md active:scale-95 transition-all border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 shrink-0" />
            <span>Client Portal</span>
          </Link>

          {/* Quick WhatsApp Action */}
          <a
            href={navbarWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm tv:text-base font-bold shadow-sm hover:shadow-md active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span className="hidden xs:inline">WhatsApp Us</span>
            <span className="xs:hidden">Chat</span>
          </a>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white/98 backdrop-blur-xl border-b border-surface-200 shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {/* Client Portal Link */}
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600/30 text-brand-400 flex items-center justify-center shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white">Client Portal / Dashboard</span>
                    <span className="bg-brand-600 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider">
                      Client
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Orders, Invoices & Bot Engine</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* Featured AI Agents Hub */}
            <Link
              href="/agents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-200 text-emerald-950 font-bold shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-emerald-950">AI Agents Hub</span>
                    <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider animate-pulse">
                      New
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Interactive WhatsApp & voice bots</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </Link>

            {/* Restaurant AI QR Demo */}
            <Link
              href="/restaurant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border border-amber-200 text-amber-950 font-bold shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <span className="text-base">🍽️</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-amber-950">Restaurant AI QR Menu</span>
                    <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider">
                      Live
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-medium">3D AI Concierge & Table WhatsApp</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>

            {/* Navigation Sections */}
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-brand-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <span>Services</span>
              <span className="text-xs text-slate-400 font-normal">Paid Ads & AI Bots</span>
            </a>

            <a
              href="/#brands"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-brand-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <span>Brands We Manage</span>
              <span className="text-xs text-slate-400 font-normal">Social Proof</span>
            </a>

            <a
              href="/#case-study"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-brand-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <span>Case Study</span>
              <span className="text-xs text-slate-400 font-normal">Amparo 3.8x ROAS</span>
            </a>

            <a
              href="/#ai-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-brand-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <span>Live Demo</span>
              <span className="text-xs text-slate-400 font-normal">WhatsApp Simulator</span>
            </a>

            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-800 hover:text-brand-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
            >
              <span>About</span>
              <span className="text-xs text-slate-400 font-normal">Founder & Story</span>
            </a>

            {/* Mobile Direct WhatsApp Contact Button */}
            <div className="pt-2 border-t border-slate-100">
              <a
                href={navbarWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  handleWhatsAppClick(e);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>Talk to Mukul on WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
