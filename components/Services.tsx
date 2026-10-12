'use client';

import React from 'react';
import Link from 'next/link';
import { getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import {
  Globe,
  Bot,
  ShoppingBag,
  MapPin,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  CreditCard,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function Services() {
  const { showToast } = useToast();

  const handleWhatsAppInquiry = (serviceName: string) => {
    trackEvent('whatsapp_click', { source: 'landing_services_preview', service: serviceName });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
      return;
    }
    const url = getWhatsAppUrl(`Hi Mukul sir, I am exploring ${serviceName} for my business. Can we discuss roadmap and pricing?`);
    window.open(url, '_blank');
  };

  const previewServices = [
    {
      id: 'perf-ads',
      tag: 'GROWTH ENGINE',
      title: 'Meta & Google Ads Management',
      desc: 'Hyper-targeted lead generation for local businesses, clinics, salons, and D2C brands. High-converting creative ad hooks with daily optimization.',
      metric: '3.8x Avg ROAS',
      metricLabel: 'Verified client returns',
      icon: TrendingUp,
      gradient: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50/70 border-blue-200/80',
    },
    {
      id: 'ai-whatsapp',
      tag: '24/7 AUTOMATION',
      title: 'WhatsApp AI Sales & Booking Bots',
      desc: 'Autonomous multi-turn AI assistants that qualify incoming leads, share price menus, answer FAQs, and book calendar appointments in seconds.',
      metric: 'Instant Reply',
      metricLabel: 'Zero missed inquiries',
      icon: Bot,
      gradient: 'from-brand-600 to-emerald-600',
      bgLight: 'bg-brand-50/80 border-brand-200/90',
      featured: true,
    },
    {
      id: 'web-d2c',
      tag: 'CUSTOM DEVELOPMENT',
      title: 'Next.js & Shopify High-Speed Stores',
      desc: 'Blazing fast, mobile-first websites and conversion-engineered e-commerce stores designed to turn local visitors into paying customers.',
      metric: '<1.2s Load Time',
      metricLabel: 'SEO & Speed Optimized',
      icon: Globe,
      gradient: 'from-emerald-600 to-teal-700',
      bgLight: 'bg-emerald-50/70 border-emerald-200/80',
    },
    {
      id: 'local-seo',
      tag: 'LOCAL DOMINANCE',
      title: 'Google Maps (GBP) Ranking & Reviews',
      desc: 'Dominate local Google search in your city. Turn nearby customers looking for your services directly into walk-ins and phone calls.',
      metric: '#1 Local Map Pack',
      metricLabel: 'Organic local visibility',
      icon: MapPin,
      gradient: 'from-amber-600 to-orange-600',
      bgLight: 'bg-amber-50/70 border-amber-200/80',
    },
  ];

  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-gradient-to-b from-white via-surface-100 to-white text-slate-900 border-b border-surface-200 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs sm:text-sm font-bold tracking-wide uppercase mb-3 shadow-2xs">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>End-to-End Growth Ecosystem</span>
          </div>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Services Built to Scale Your Revenue
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-3 font-normal max-w-2xl mx-auto">
            From high-converting Meta Ads to 24/7 AI WhatsApp automation and custom tech development — everything engineered for measurable ROI.
          </p>
        </div>

        {/* 4 Core Pillars Preview Grid (Clean White App Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16">
          {previewServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 border bg-white transition-all duration-300 relative group shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                  srv.featured
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-surface-300 hover:border-brand-300'
                }`}
              >
                {srv.featured && (
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* Category Pill & Icon */}
                  <div className="flex items-center justify-between mt-1 mb-4">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-surface-100 px-2.5 py-1 rounded-full border border-surface-200">
                      {srv.tag}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${srv.gradient} shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-2.5">
                    {srv.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                    {srv.desc}
                  </p>
                </div>

                {/* Metric Strip & Quick Action */}
                <div className="pt-4 border-t border-surface-200">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-50 border border-surface-200 mb-4">
                    <div>
                      <div className="text-xs font-black text-slate-900">{srv.metric}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{srv.metricLabel}</div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppInquiry(srv.title)}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-100 hover:bg-brand-50 text-slate-800 hover:text-brand-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-surface-200 hover:border-brand-200 cursor-pointer"
                  >
                    <span>Inquire Scope</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* UNIQUE HERO ACTION BANNER LINKING TO /pricing */}
        {/* ==================================================================== */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 text-white shadow-xl shadow-brand-950/15 border border-brand-700/60">
          {/* Subtle Ambient Particles & Tech Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-400/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
                <CreditCard className="w-3.5 h-3.5 text-brand-300" />
                <span>100% Transparent INR (₹) Rates</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Looking for Detailed Pricing & Service Packages?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-brand-100 font-normal leading-relaxed">
                Explore our full 11-Service Rate Card, 4 Flagship launch packs (₹2,999 to ₹19,999+), and deliverables breakdown with instant Razorpay checkout.
              </p>
            </div>

            {/* The Unique Interactive Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto shrink-0">
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-brand-900 font-black text-sm sm:text-base py-3.5 sm:py-4 px-7 sm:px-8 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
              >
                <SlidersHorizontal className="w-5 h-5 text-brand-700 group-hover:rotate-180 transition-transform duration-500" />
                <span>View Full Service Rate Card</span>
                <ArrowRight className="w-4 h-4 text-brand-700 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
