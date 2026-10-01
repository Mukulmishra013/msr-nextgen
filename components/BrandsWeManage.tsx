'use client';

import React, { useState, useEffect } from 'react';
import { MANAGED_BRANDS } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { BrandClient } from '@/types';
import { getWhatsAppUrl } from '@/lib/config';
import {
  Instagram,
  ExternalLink,
  Award,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export default function BrandsWeManage() {
  const [brands, setBrands] = useState<BrandClient[]>(MANAGED_BRANDS);

  useEffect(() => {
    fetch('/api/admin/brands')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.brands?.length > 0) {
          setBrands(data.brands);
        }
      })
      .catch(() => {
        // Fallback to MANAGED_BRANDS
      });
  }, []);

  const handleBrandClick = (brandName: string, url: string) => {
    trackEvent('portfolio_outbound_click', { brand: brandName, url });
  };

  // Distinct brand color palettes for clean, authentic identity monograms
  const brandThemes: Record<string, { gradient: string; text: string; bg: string }> = {
    amparo: {
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    'nacho-g': {
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      text: 'text-orange-700',
      bg: 'bg-orange-50 border-orange-200',
    },
    'dining-venue': {
      gradient: 'from-amber-600 via-yellow-600 to-amber-800',
      text: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
    },
    'the-bunker-cafe': {
      gradient: 'from-slate-800 via-zinc-800 to-black',
      text: 'text-slate-800',
      bg: 'bg-slate-100 border-slate-300',
    },
    'elite-futuristic-school': {
      gradient: 'from-blue-600 via-indigo-600 to-sky-700',
      text: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
    },
  };

  return (
    <section id="brands" className="w-full py-16 sm:py-24 bg-gradient-to-b from-white via-surface-50 to-white border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subline */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold mb-3 border border-emerald-200/80 shadow-2xs">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Real & Verified Work</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Brands We&apos;ve Been Growing Since Day One
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Full social media management — daily creative reels, content strategy, and performance ads.
            <span className="text-slate-900 font-bold block mt-1">
              Tap any brand to verify their real Instagram presence and live reels directly on Instagram.
            </span>
          </p>
        </div>

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
          {brands.map((brand) => {
            const theme = brandThemes[brand.id] || {
              gradient: 'from-brand-600 to-emerald-600',
              text: 'text-brand-700',
              bg: 'bg-brand-50 border-brand-200',
            };

            return (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleBrandClick(brand.name, brand.url)}
                className="group relative flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-brand-500 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {/* 1+ Year Client Badge */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>1+ Yr Client</span>
                </div>

                {/* Branded Avatar Monogram */}
                <div className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr ${theme.gradient} mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-xl text-slate-900 overflow-hidden shadow-inner">
                    <span className="tracking-tight font-black text-slate-900 group-hover:scale-110 transition-transform">
                      {brand.initials || brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Brand Name & Verified Instagram Badge */}
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-1.5">
                  <span>{brand.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                </h3>

                {/* Category Badge */}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1.5 mb-3 border ${theme.bg} ${theme.text}`}>
                  {brand.category}
                </span>

                {/* What MSR Next Gen Does */}
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4 line-clamp-2">
                  Social media management, high-converting video reels, and localized customer campaigns.
                </p>

                {/* Direct Live Instagram Verification Button */}
                <div className="mt-auto w-full pt-2">
                  <div className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs group-hover:shadow-md active:scale-95">
                    <Instagram className="w-3.5 h-3.5 shrink-0" />
                    <span>Verify on Instagram</span>
                    <ExternalLink className="w-3 h-3 opacity-80 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Instagram Handle Line */}
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-slate-600">
                  <span className="truncate">{brand.handle}</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* 100% Real Guarantee Callout Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left max-w-4xl mx-auto shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-white">
                Zero Fake Claims. 100% Verifiable Work on Live Instagram.
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Every business listed above is an active, real brand. Click any profile to view their real followers, recent reels, and genuine customer engagement.
              </p>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <a
              href={getWhatsAppUrl('Hi Mukul, I saw the real brands you manage and want to discuss marketing for my business.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Discuss On WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
