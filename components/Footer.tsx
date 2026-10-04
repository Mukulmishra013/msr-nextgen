'use client';

import React from 'react';
import Link from 'next/link';
import { AGENCY_CONFIG, getWhatsAppUrl, getCustomerCareWhatsAppUrl } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { Instagram, Linkedin, Facebook, Mail, MessageCircle, PhoneCall } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 text-white pt-14 pb-20 sm:pb-14 border-t border-slate-800">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Agency Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-base">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                MSR NEXT GEN
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Performance marketing and 24/7 AI WhatsApp chatbot agents designed exclusively for Indian retail, local services, and D2C brands. Built to drive real revenue, not vanity clicks.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={AGENCY_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MSR Next Gen Instagram"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-brand-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={AGENCY_CONFIG.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MSR Next Gen LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-brand-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={AGENCY_CONFIG.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MSR Next Gen Facebook"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-brand-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Flagship Services
                </a>
              </li>
              <li>
                <a href="#brands" className="hover:text-white transition-colors">
                  Brands We Manage
                </a>
              </li>
              <li>
                <a href="#case-study" className="hover:text-white transition-colors">
                  Amparo Case Study
                </a>
              </li>
              <li>
                <a href="#ai-demo" className="hover:text-white transition-colors">
                  AI WhatsApp Demo
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About the Founder
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Inquiries & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Direct Contact & Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href={`mailto:${AGENCY_CONFIG.email}`}
                  className="inline-flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="truncate">{AGENCY_CONFIG.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { source: 'footer_sales' })}
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Sales WhatsApp: +91 95193 42440</span>
                </a>
              </li>
              <li>
                <a
                  href={getCustomerCareWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { source: 'footer_care' })}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Already a client? Care: +91 88875 21156</span>
                </a>
              </li>
              <li className="text-xs text-slate-500 pt-2 leading-relaxed">
                Operating across India with client headquarters in Uttar Pradesh & Delhi NCR.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} MSR Next Gen. All rights reserved.</p>
          <p>
            Designed & engineered for maximum mobile speed, clarity, and real business results.
          </p>
        </div>

      </div>
    </footer>
  );
}
