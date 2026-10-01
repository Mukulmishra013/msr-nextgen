'use client';

import React from 'react';
import { AGENCY_CONFIG, getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { MessageCircle, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function Hero() {
  const { showToast } = useToast();

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', { source: 'hero' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
    }
  };

  const handleSeeWorkClick = () => {
    trackEvent('case_study_view', { brand: 'Amparo' });
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-surface-100 to-white pt-6 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-28 border-b border-surface-200">
      {/* Clean Modern Ambient Background (No muddy stock photos or smudges) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle Tech Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#0f6e56 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Soft Radial Teal & Emerald Ambient Lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-36 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-36 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl tv:max-w-5xl mx-auto">
          
          {/* Target Audience Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs sm:text-sm tv:text-base font-bold mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span>Exclusively for Indian Local Businesses & D2C Brands</span>
          </div>

          {/* 3-Second Rule Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl tv:text-7xl font-black text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.12] mb-5">
            Get More Customers For Your Business —{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">
              Ads & AI
            </span>{' '}
            That Actually Deliver Results
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl tv:text-2xl text-slate-600 max-w-2xl tv:max-w-3xl font-normal leading-relaxed mb-8 sm:mb-10">
            {AGENCY_CONFIG.subheadline} No vanity metrics or generic agency jargon — just high-converting ad campaigns and 24/7 AI WhatsApp customer booking.
          </p>

          {/* CTA Zone (Mobile Thumb-Reachable & High-Contrast) */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 mb-6">
            {/* Primary Action: WhatsApp */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base sm:text-lg tv:text-xl px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
            >
              <MessageCircle className="w-6 h-6 fill-white shrink-0" />
              <span>WhatsApp Us Now</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </a>

            {/* Secondary Action: See Our Work */}
            <a
              href="#case-study"
              onClick={handleSeeWorkClick}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-surface-100 text-slate-800 font-bold text-base sm:text-lg tv:text-xl px-6 py-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <TrendingUp className="w-5 h-5 text-brand-600 shrink-0" />
              <span>See Our Work</span>
            </a>
          </div>

          {/* Trust Proof Line Under CTA */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm tv:text-base font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Trusted by growing D2C & local Indian brands • Full social media management</span>
          </div>

        </div>
      </div>
    </section>
  );
}
