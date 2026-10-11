'use client';

import React, { useState } from 'react';
import {
  FLAGSHIP_PACKAGES,
  RATE_CARD_SERVICES,
  FlagshipPackage,
  RateCardCategory,
} from '@/data/rateCardData';
import { getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import {
  Globe,
  Bot,
  ShoppingBag,
  MapPin,
  Smartphone,
  Search,
  Share2,
  TrendingUp,
  MessageSquare,
  Cpu,
  Database,
  Palette,
  Shield,
  CheckCircle2,
  MessageCircle,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  HelpCircle,
} from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';

export default function Services() {
  const { showToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('whatsapp-starter');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const handleWhatsAppClick = (packageName: string, customMessage: string) => {
    trackEvent('whatsapp_click', { source: 'services_card', package: packageName });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
      return;
    }
    const url = getWhatsAppUrl(customMessage);
    window.open(url, '_blank');
  };

  const handleBuyNow = (pkgId: string) => {
    trackEvent('checkout_modal_open', { packageId: pkgId });
    setSelectedPackageId(pkgId);
    setShowCheckout(true);
  };

  const categories = [
    'All',
    'Web & Apps',
    'Marketing & Ads',
    'AI & Automation',
    'Design & Support',
  ];

  const filteredRateCard =
    activeCategoryFilter === 'All'
      ? RATE_CARD_SERVICES
      : RATE_CARD_SERVICES.filter((s) => s.categoryGroup === activeCategoryFilter);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Search':
        return <Search className="w-5 h-5" />;
      case 'Share2':
        return <Share2 className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'MessageSquare':
      case 'Bot':
        return <Bot className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-slate-950 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ==================================================================== */}
        {/* PART 1: 4 FLAGSHIP PACKAGES (HIGHLIGHTED) */}
        {/* ==================================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs sm:text-sm font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>High-ROI Flagship Offers</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl tv:text-5xl font-black text-white tracking-tight leading-tight">
            Laser-Focused Growth Packages
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 mt-3">
            Choose our 4 battle-tested flagship offers for instant setup. Buy directly online with secure Razorpay checkout or connect directly with Mukul on WhatsApp.
          </p>
        </div>

        {/* 4 Flagship Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 sm:mb-28">
          {FLAGSHIP_PACKAGES.map((pkg) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative group ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-brand-500/60 shadow-xl shadow-brand-500/10 hover:border-brand-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                {/* Popular or Savings Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3 left-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                        isPopular
                          ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Category Pill & Icon */}
                  <div className="flex items-center justify-between mt-2 mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-400">
                      {pkg.category}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                      {getServiceIcon(pkg.iconName)}
                    </div>
                  </div>

                  {/* Title & Price */}
                  <h3 className="text-xl font-black text-white leading-tight mb-2">
                    {pkg.title}
                  </h3>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      {pkg.originalAmount && (
                        <span className="text-sm font-semibold text-slate-500 line-through">
                          ₹{pkg.originalAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        ₹{pkg.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                      {pkg.priceDetail}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                    {pkg.tagline}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="space-y-2.5 mb-8 border-t border-slate-800/80 pt-4">
                    {pkg.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-300 font-normal leading-snug">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dual Action CTAs: Direct Buy + WhatsApp Connect */}
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleBuyNow(pkg.id)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-brand-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Buy Now (Razorpay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppClick(pkg.title, pkg.whatsappMessage)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Connect on WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>


        {/* ==================================================================== */}
        {/* PART 2: COMPLETE HORIZONTAL / TABBED SERVICE RATE CARD (11 CATEGORIES) */}
        {/* ==================================================================== */}
        <div id="rate-card" className="pt-6 border-t border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide uppercase mb-3">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Full Agency Rate Card</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              11 Core Digital & AI Services
            </h3>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Transparent proposed pricing in INR (₹) across Development, Marketing, AI Automation, and Creative Design.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Horizontal / Grid Rate Card Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRateCard.map((srv) => (
              <div
                key={srv.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group shadow-md hover:shadow-xl"
              >
                <div>
                  {/* Top Bar: Number & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      SERVICE #{srv.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {srv.categoryGroup}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                      {getServiceIcon(srv.iconName)}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white leading-tight">
                      {srv.title}
                    </h4>
                  </div>

                  {/* Price Range Banner */}
                  <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight">
                      {srv.priceRange}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {srv.billingType}
                    </span>
                  </div>

                  {/* Detailed Tiers Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Package Tiers & Deliverables:
                    </div>
                    {srv.tiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/70 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white mb-0.5">
                          <span>{tier.name}</span>
                          <span className="text-brand-400 font-extrabold">{tier.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                          {tier.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Scope Note */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 mb-6 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">📌 Scope: </span>
                    {srv.notes}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppClick(srv.title, srv.whatsappMessage)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>Inquire on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Open checkout with closest package or custom consultation
                      handleBuyNow('whatsapp-starter');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                  >
                    <span>Request Quote</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rate Card Bottom Note */}
          <div className="mt-12 text-center max-w-2xl mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-xs text-slate-400 leading-relaxed">
              💡 <span className="font-semibold text-white">Need a customized bundle or enterprise retainer?</span> We create custom proposals based on your exact business requirements, ad spend, and automation workflows. Chat directly with Mukul sir on WhatsApp.
            </p>
          </div>
        </div>

      </div>

      {/* 1-Click Instant Activation Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        defaultPackageId={selectedPackageId}
      />
    </section>
  );
}
