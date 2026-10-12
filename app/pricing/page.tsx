'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import AIChatWidget from '@/components/AIChatWidget';
import CheckoutModal from '@/components/CheckoutModal';
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
  ArrowLeft,
  Check,
  CreditCard,
  PhoneCall,
  Layers,
  HelpCircle,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export default function PricingPage() {
  const { showToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('whatsapp-starter');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'flagship' | 'catalog'>('all');

  const handleWhatsAppClick = (packageName: string, customMessage: string) => {
    trackEvent('whatsapp_click', { source: 'pricing_page', package: packageName });
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
    trackEvent('checkout_modal_open', { packageId: pkgId, source: 'pricing_page' });
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

  // Filtered Services based on category and search query
  const filteredServices = useMemo(() => {
    return RATE_CARD_SERVICES.filter((srv) => {
      const matchesCategory =
        activeCategory === 'All' || srv.categoryGroup === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.tiers.some(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar />

      <main className="flex-1 w-full pb-20">
        {/* ==================================================================== */}
        {/* APP-LIKE HERO BANNER */}
        {/* ==================================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-surface-100 to-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-surface-200">
          {/* Subtle Grid Ambient Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(#0f6e56 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb / Back button */}
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/#services"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-surface-300 shadow-2xs hover:shadow-xs transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs sm:text-sm font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Service Rate Card & Pricing
              </span>
            </div>

            {/* Title & Headline */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-300/80 text-brand-800 text-xs sm:text-sm font-extrabold uppercase tracking-wide mb-3">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>100% Transparent Pricing • INR (₹)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                MSR Next Gen — Complete Service & Pricing Rate Card
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Everything you need to launch, scale, and automate your business. Pick from ready flagship bundles or choose custom services with clear transparent deliverables.
              </p>
            </div>

            {/* Quick Stats / Highlights Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-surface-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fast Turnaround</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">3 – 10 Days</div>
                <div className="text-[11px] text-emerald-600 font-medium">Quick Launch Scope</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-surface-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">UPI / Razorpay</div>
                <div className="text-[11px] text-emerald-600 font-medium">100% Secure Checkout</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-surface-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Support</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">24/7 Dedicated</div>
                <div className="text-[11px] text-brand-600 font-medium">Direct WhatsApp Access</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-surface-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Founder-Led</div>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">Mukul Mishra</div>
                <div className="text-[11px] text-brand-600 font-medium">Personal Strategy Call</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* INTERACTIVE CONTROLS: VIEW SWITCHER + SEARCH BAR */}
        {/* ==================================================================== */}
        <div className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-surface-200 py-3 shadow-2xs">
          <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-100 rounded-xl border border-surface-200 w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-white text-brand-800 shadow-xs border border-surface-300/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ All Packages & Services
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('flagship')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'flagship'
                      ? 'bg-white text-brand-800 shadow-xs border border-surface-300/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎯 4 Flagship Bundles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'catalog'
                      ? 'bg-white text-brand-800 shadow-xs border border-surface-300/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 11-Service Rate Card
                </button>
              </div>

              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service, package (e.g. Salon, SEO, Shopify, Meta Ads)..."
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-surface-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 1: 4 FLAGSHIP OFFERS (APP-LIKE CARDS) */}
        {/* ==================================================================== */}
        {(activeTab === 'all' || activeTab === 'flagship') && (
          <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 text-brand-600" />
                  <span>Flagship Instant Launch</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  High-ROI Turnkey Packages
                </h2>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  Direct online buy via Razorpay or instant activation on WhatsApp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FLAGSHIP_PACKAGES.map((pkg) => {
                const isPopular = pkg.popular;
                return (
                  <div
                    key={pkg.id}
                    className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative group bg-white ${
                      isPopular
                        ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-xl shadow-brand-500/10 hover:shadow-2xl'
                        : 'border-surface-300 hover:border-brand-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div className="absolute -top-3 left-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                            isPopular
                              ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Category & Icon */}
                      <div className="flex items-center justify-between mt-2 mb-4">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                          {pkg.category}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform">
                          {getServiceIcon(pkg.iconName)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
                        {pkg.title}
                      </h3>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          {pkg.originalAmount && (
                            <span className="text-sm font-semibold text-slate-400 line-through">
                              ₹{pkg.originalAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                          <span className="text-3xl font-black text-slate-900 tracking-tight">
                            ₹{pkg.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                          {pkg.priceDetail}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-5 pb-5 border-b border-surface-200">
                        {pkg.tagline}
                      </p>

                      {/* Deliverables Checklist */}
                      <ul className="space-y-2.5 mb-6">
                        {pkg.highlights.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="pt-4 border-t border-surface-200 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleBuyNow(pkg.id)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm ${
                          isPopular
                            ? 'bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white shadow-brand-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>Instant Checkout (₹{pkg.amount.toLocaleString('en-IN')})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppClick(pkg.title, pkg.whatsappMessage)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================================================================== */}
        {/* SECTION 2: COMPLETE 11-SERVICE DETAILED RATE CARD */}
        {/* ==================================================================== */}
        {(activeTab === 'all' || activeTab === 'catalog') && (
          <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
            {/* Header & Category Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-surface-100 px-2.5 py-1 rounded-md border border-surface-300 uppercase tracking-wider mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                  <span>Full Service Directory</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Detailed Service Breakdown & Rate Card
                </h2>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  Transparent price ranges and deliverable scopes across all 11 core competencies.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-surface-100 rounded-2xl border border-surface-200">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-white text-brand-700 shadow-xs border border-surface-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Search Result Fallback */}
            {filteredServices.length === 0 && (
              <div className="text-center py-16 bg-surface-50 rounded-3xl border border-surface-200">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No services match your query</h3>
                <p className="text-xs text-slate-500 mt-1">Try another search term or clear the filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* 11 Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-white border border-surface-300 hover:border-brand-400 shadow-xs hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Number & Category */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-surface-100 border border-surface-200 text-slate-700 font-black text-xs flex items-center justify-center">
                          {srv.number}
                        </span>
                        <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                          {srv.categoryGroup}
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform">
                        {getServiceIcon(srv.iconName)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                      {srv.title}
                    </h3>

                    {/* Price Range Banner */}
                    <div className="mb-5 p-3 rounded-2xl bg-surface-100 border border-surface-200">
                      <div className="text-lg sm:text-xl font-black text-brand-800 tracking-tight">
                        {srv.priceRange}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {srv.billingType}
                      </span>
                    </div>

                    {/* Tier Breakdown */}
                    <div className="space-y-2.5 mb-5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Package Tiers & Deliverables:
                      </div>
                      {srv.tiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-0.5">
                            <span>{tier.name}</span>
                            <span className="text-emerald-700 font-black">{tier.price}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                            {tier.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Scope Note */}
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 mb-6 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-900">📌 Scope: </span>
                      {srv.notes}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppClick(srv.title, srv.whatsappMessage)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Inquire on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBuyNow('whatsapp-starter')}
                      className="inline-flex items-center justify-center gap-1 bg-surface-100 hover:bg-surface-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer border border-surface-300"
                    >
                      <span>Request Quote</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Bundle Consultation Callout */}
            <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-50 via-emerald-50 to-brand-50 border border-brand-200 text-center max-w-3xl mx-auto shadow-xs">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white mb-3 shadow-sm">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                Need a Custom Bundle or Enterprise Retainer?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-5">
                We craft tailor-made growth roadmaps combining performance ads, WhatsApp CRM bots, and custom web apps designed specifically for your monthly sales target.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleWhatsAppClick('Custom Retainer', 'Hi Mukul sir, I want to discuss a custom growth retainer for my business.')}
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Mukul on WhatsApp</span>
                </button>
                <Link
                  href="/#ai-demo"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm py-2.5 px-5 rounded-full border border-surface-300 transition-all"
                >
                  <span>Try AI Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating 24/7 AI Chatbot Agent (Maya) */}
      <AIChatWidget />

      {/* Mobile-first Thumb-Zone Floating WhatsApp Action */}
      <StickyWhatsApp />

      {/* 1-Click Instant Activation Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        defaultPackageId={selectedPackageId}
      />
    </div>
  );
}
