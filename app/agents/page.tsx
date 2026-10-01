'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  QrCode,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  Utensils,
  GraduationCap,
  Calendar,
  Building2,
  Headphones,
  Zap,
  ChevronRight,
  Smartphone,
  X,
  ExternalLink,
  Lock,
  Layers,
  Check,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { getWhatsAppUrl, AGENCY_CONFIG } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyWhatsApp from '@/components/StickyWhatsApp';

interface AIAgentItem {
  id: string;
  name: string;
  category: 'all' | 'd2c' | 'food' | 'edu' | 'support' | 'realestate';
  categoryLabel: string;
  status: 'live' | 'coming_soon';
  launchTimeline?: string;
  badge: string;
  icon: 'whatsapp' | 'shop' | 'food' | 'school' | 'clinic' | 'building' | 'support';
  description: string;
  capabilities: string[];
  responseSpeed: string;
  accuracy: string;
  preBookMessage: string;
}

const AGENTS_CATALOG: AIAgentItem[] = [
  {
    id: 'whatsapp-autopilot',
    name: 'WhatsApp 24/7 AI Sales Pilot',
    category: 'all',
    categoryLabel: 'Multi-Industry Sales',
    status: 'live',
    badge: '🟢 Live Demo Available (5 Min Free)',
    icon: 'whatsapp',
    description: 'Aapke number par 24/7 active hokar customer queries ka 2 second me answer deta hai, products explain karta hai aur direct order ya booking lock karta hai.',
    capabilities: [
      'Natural Hindi + English (Hinglish) conversation',
      'Instant catalog & pricing distribution',
      'Zero human staff delay (even at 2:00 AM)',
      'Official Anti-Ban & Rate-Limit protection',
    ],
    responseSpeed: '< 2.0s',
    accuracy: '99.4%',
    preBookMessage: 'Hi MSR Next Gen, I want to set up the 24/7 WhatsApp AI Sales Pilot for my business.',
  },
  {
    id: 'd2c-cod-shield',
    name: 'D2C COD Verification & Anti-RTO Shield',
    category: 'd2c',
    categoryLabel: 'E-Commerce / Shopify',
    status: 'coming_soon',
    launchTimeline: 'Launching April 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'shop',
    description: 'Website se aane wale Cash on Delivery orders ko WhatsApp par auto-verify karta hai, fake addresses detect karta hai aur RTO (Return to Origin) 35% tak kam karta hai.',
    capabilities: [
      'Automated 1-click WhatsApp order confirmation',
      'Fake pincode & incomplete address detector',
      'Abandoned checkout recovery auto-ping',
      'Prepaid discount upsell trigger',
    ],
    responseSpeed: '< 1.5s',
    accuracy: '98.9%',
    preBookMessage: 'Hi MSR Next Gen, I want to pre-book the D2C COD Verification & Anti-RTO Shield Agent for my e-commerce store.',
  },
  {
    id: 'restaurant-smart-dine',
    name: 'SmartDine Table & Party Booking Agent',
    category: 'food',
    categoryLabel: 'Restaurants & Cafes',
    status: 'coming_soon',
    launchTimeline: 'Launching April 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'food',
    description: 'Restaurants aur cafes ke liye automatic table reservation, rooftop/booth preference selection, birthday packages aur daily specials recommend karta hai.',
    capabilities: [
      'Real-time seat & table reservation pass generator',
      'Chef special & food menu PDF delivery',
      'Automatic booking reminder 1 hour before arrival',
      'Floor manager instant notification alert',
    ],
    responseSpeed: '< 1.8s',
    accuracy: '99.1%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the SmartDine Table & Party Booking Agent for my restaurant/cafe.',
  },
  {
    id: 'edu-counselor',
    name: 'EduCounselor & Admission Pipeline Agent',
    category: 'edu',
    categoryLabel: 'Schools & Coaching',
    status: 'coming_soon',
    launchTimeline: 'Launching May 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'school',
    description: 'Schools aur coaching institutes ke admission inquiries ko 24 ghante entertain karta hai, fee structure share karta hai aur campus visit schedule karta hai.',
    capabilities: [
      'Curriculum brochure & fee structure distribution',
      'Parent qualification & class-wise inquiry triage',
      'Campus visit scheduling with counselor calendar sync',
      'Instant lead export to Excel/CRM',
    ],
    responseSpeed: '< 2.2s',
    accuracy: '99.5%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the EduCounselor Admission Agent for our school/coaching institute.',
  },
  {
    id: 'clinic-opd-scheduler',
    name: 'CareSlot Clinic & Doctor Appointment Agent',
    category: 'edu',
    categoryLabel: 'Healthcare & Salons',
    status: 'coming_soon',
    launchTimeline: 'Launching May 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'clinic',
    description: 'Doctors, dental clinics aur premium salons ke liye appointment slots check karta hai, digital token number issue karta hai aur location pin bhejta hai.',
    capabilities: [
      'Time slot availability & token generation',
      'Doctor consultation fee & specialization guide',
      'Automatic appointment reminder on WhatsApp',
      'Reception counter sync to avoid waiting queues',
    ],
    responseSpeed: '< 1.7s',
    accuracy: '99.6%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the CareSlot Clinic Appointment Agent for our clinic/hospital.',
  },
  {
    id: 'real-estate-lead-matcher',
    name: 'EstateMatch Property & Lead Qualifier Agent',
    category: 'realestate',
    categoryLabel: 'Real Estate & Builders',
    status: 'coming_soon',
    launchTimeline: 'Launching June 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'building',
    description: 'High-ticket property buyers ka budget aur requirement filter karta hai, floor plan PDFs share karta hai aur verified site visits book karta hai.',
    capabilities: [
      'Budget & BHK requirement instant filtering',
      'Floor plan brochures & project walkthrough links',
      'Site visit booking with sales manager GPS pin',
      'Spam lead filtration to save sales team time',
    ],
    responseSpeed: '< 2.5s',
    accuracy: '98.8%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the EstateMatch Real Estate Qualifier Agent.',
  },
  {
    id: 'omni-support-bot',
    name: 'OmniDesk Tier-1 Customer Support Agent',
    category: 'support',
    categoryLabel: 'Brands & Operations',
    status: 'coming_soon',
    launchTimeline: 'Launching June 2026',
    badge: '⏳ Coming Soon • Pre-Book Open',
    icon: 'support',
    description: 'Aapke business ke 80% common customer queries, refund rules, delivery tracking aur support FAQs ko automatically bina kisi executive ke solve karta hai.',
    capabilities: [
      'Automated live delivery status tracking',
      'Company policy & FAQ instant answering',
      'Smart human escalation when customer is frustrated',
      'WhatsApp + Website dual channel support',
    ],
    responseSpeed: '< 1.4s',
    accuracy: '99.2%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the OmniDesk Tier-1 Customer Support Agent for my business.',
  },
];

export default function AgentsDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // Dedicated Customer Sandbox Demo States (Port 5001 /sandbox - completely isolated from Admin WhatsApp)
  const [sandboxStatus, setSandboxStatus] = useState<'idle' | 'loading' | 'qr_ready' | 'connected' | 'expired'>('idle');
  const [sandboxQrCode, setSandboxQrCode] = useState<string | null>(null);
  const [sandboxUser, setSandboxUser] = useState<{ id?: string; name?: string } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isDisconnectingSandbox, setIsDisconnectingSandbox] = useState<boolean>(false);
  const { showToast } = useToast();

  const filteredAgents =
    selectedCategory === 'all'
      ? AGENTS_CATALOG
      : AGENTS_CATALOG.filter((a) => a.category === selectedCategory);

  // Poll live Customer Sandbox status from /api/sandbox/whatsapp
  const fetchSandboxStatus = async () => {
    try {
      const res = await fetch('/api/sandbox/whatsapp');
      const data = await res.json();
      if (data.status === 'connected') {
        setSandboxStatus('connected');
        setSandboxUser(data.user || null);
        setSandboxQrCode(null);
        if (data.secondsLeft !== undefined) setSecondsRemaining(data.secondsLeft);
      } else if (data.status === 'qr_ready' && data.qrCode) {
        setSandboxStatus('qr_ready');
        setSandboxQrCode(data.qrCode);
        setSandboxUser(null);
      } else if (data.status === 'initializing') {
        setSandboxStatus('loading');
      } else if (data.status === 'expired') {
        setSandboxStatus('expired');
      } else {
        setSandboxStatus('idle');
      }
    } catch {
      // Sandbox worker offline
    }
  };

  // Check sandbox status once on component mount
  useEffect(() => {
    fetchSandboxStatus();
  }, []);

  // Start fresh Customer Sandbox Session (Generates real on-demand Baileys QR for customer phone)
  const handleStartSandbox = async () => {
    setSandboxStatus('loading');
    setSandboxQrCode(null);
    setSecondsRemaining(300);

    try {
      const res = await fetch('/api/sandbox/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(fetchSandboxStatus, 1500);
      }
    } catch {
      showToast({ message: 'Sandbox service error. Please try again.', type: 'error' });
      setSandboxStatus('idle');
    }
  };

  // Disconnect Sandbox Session
  const handleDisconnectSandbox = async () => {
    setIsDisconnectingSandbox(true);
    try {
      const res = await fetch('/api/sandbox/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      const data = await res.json();
      setSandboxStatus('idle');
      setSandboxQrCode(null);
      setSandboxUser(null);
      setSecondsRemaining(300);
      showToast({ message: 'WhatsApp Demo safely disconnected.', type: 'info' });
    } catch {
      showToast({ message: 'Failed to disconnect sandbox demo.', type: 'error' });
    } finally {
      setIsDisconnectingSandbox(false);
    }
  };

  // Open Modal and trigger fresh QR generation
  const handleOpenSandboxModal = () => {
    setIsQrModalOpen(true);
    handleStartSandbox();
    trackEvent('whatsapp_click', { source: 'agents_page_sandbox_open' });
  };

  // Poll while modal is open
  useEffect(() => {
    if (!isQrModalOpen) return;
    const interval = setInterval(fetchSandboxStatus, 1800);
    return () => clearInterval(interval);
  }, [isQrModalOpen]);

  const formatCountdown = (secs: number) => {
    const mins = Math.max(Math.floor(secs / 60), 0);
    const remainder = Math.max(secs % 60, 0);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col w-full selection:bg-brand-600 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar />

      <main className="flex-1 w-full pb-20 sm:pb-28">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-surface-100 to-white pt-10 sm:pt-16 pb-14 border-b border-surface-200">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold mb-4 border border-emerald-200/80 shadow-2xs">
              <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>MSR AI Agent Marketplace • 24/7 Business Autopilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 max-w-4xl mx-auto">
              Specialized AI Agents That Run Your Business on Autopilot
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
              Har business ki alag requirements hoti hain — D2C Orders, Table Booking, School Admissions ya Clinic Appointments. Choose your specialized AI Agent and connect in seconds.
            </p>

            {/* Quick Banner: 5-Minute Free Sandbox Demo Button */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-900 text-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-800 max-w-xl mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  sandboxStatus === 'connected'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                }`}>
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      {sandboxStatus === 'connected' ? 'WhatsApp Demo Active' : '5-Minute WhatsApp AI Test Drive'}
                    </h4>
                    <span className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase ${
                      sandboxStatus === 'connected' ? 'bg-emerald-400 text-slate-950 animate-pulse' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {sandboxStatus === 'connected' ? `Live • ${formatCountdown(secondsRemaining)}` : 'Live'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sandboxStatus === 'connected'
                      ? `Linked as ${sandboxUser?.name || sandboxUser?.id || 'Your Phone'}. AI replies active.`
                      : 'Scan QR code & automate your WhatsApp for 5 minutes without setup.'}
                  </p>
                </div>
              </div>

              {sandboxStatus === 'connected' ? (
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-3 rounded-2xl transition-all border border-slate-700"
                  >
                    Status
                  </button>
                  <button
                    onClick={handleDisconnectSandbox}
                    disabled={isDisconnectingSandbox}
                    className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs px-4 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isDisconnectingSandbox ? 'Disconnecting...' : 'Disconnect'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleOpenSandboxModal}
                  className="w-full sm:w-auto shrink-0 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Connect & Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </section>

        {/* Category Filters */}
        <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-8">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'All Agents (7)' },
              { id: 'd2c', label: '🛍️ E-Commerce & D2C' },
              { id: 'food', label: '🍕 Food & Cafes' },
              { id: 'edu', label: '🎓 Edu & Healthcare' },
              { id: 'realestate', label: '🏢 Real Estate' },
              { id: 'support', label: '💬 Support & Desk' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Agents Grid Showcase */}
        <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAgents.map((agent) => {
              const isLive = agent.status === 'live';

              return (
                <div
                  key={agent.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative group ${
                    isLive
                      ? 'border-emerald-300 shadow-md shadow-emerald-500/5 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  {/* Top Status & Category Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {agent.categoryLabel}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                          isLive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200/80'
                        }`}
                      >
                        {agent.badge}
                      </span>
                    </div>

                    {/* Agent Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isLive
                            ? 'bg-emerald-500/15 border-emerald-300 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {agent.icon === 'whatsapp' && <MessageCircle className="w-6 h-6 fill-current" />}
                        {agent.icon === 'shop' && <ShoppingBag className="w-6 h-6" />}
                        {agent.icon === 'food' && <Utensils className="w-6 h-6" />}
                        {agent.icon === 'school' && <GraduationCap className="w-6 h-6" />}
                        {agent.icon === 'clinic' && <Calendar className="w-6 h-6" />}
                        {agent.icon === 'building' && <Building2 className="w-6 h-6" />}
                        {agent.icon === 'support' && <Headphones className="w-6 h-6" />}
                      </div>

                      <div>
                        <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-snug">
                          {agent.name}
                        </h3>
                        {agent.launchTimeline && (
                          <span className="text-xs text-amber-600 font-bold block mt-0.5">
                            {agent.launchTimeline}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                      {agent.description}
                    </p>

                    {/* Capabilities List */}
                    <div className="space-y-2 mb-6 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Core Superpowers:
                      </span>
                      {agent.capabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>

                    {/* Speed & Accuracy Pill Bar */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Reply Time</span>
                        <strong className="text-xs font-black text-slate-900">{agent.responseSpeed}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Accuracy</span>
                        <strong className="text-xs font-black text-emerald-700">{agent.accuracy}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div>
                    {isLive ? (
                      <button
                        onClick={handleOpenSandboxModal}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Test Drive Live (5 Min Free)</span>
                        <ArrowRight className="w-4 h-4 opacity-80" />
                      </button>
                    ) : (
                      <a
                        href={getWhatsAppUrl(agent.preBookMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          trackEvent('whatsapp_click', { source: `prebook_${agent.id}` });
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                      >
                        <span>Pre-Book / Reserve Access</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </a>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* 3-Step Setup Guarantee */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              Simple 3-Step Onboarding
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 mb-3">
              How We Launch Your Custom AI Agent in 24 Hours
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-8">
              Aapko koi complex software seekhne ki zaroorat nahi hai. Sab kuch hamari team setup karegi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-5 rounded-2xl bg-surface-50 border border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center mb-3">
                  1
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">
                  Choose Your Agent & Voice
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apne business model ke mutabiq agent select karein (e.g. Orders, Bookings ya Lead Qualification).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-50 border border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  2
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">
                  Upload Products & Rules
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apna menu, pricing sheet ya FAQs hume WhatsApp par share karein — AI 1 ghante me train ho jayega.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-50 border border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center mb-3">
                  3
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1">
                  Connect & Go 24/7 Live
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aapke official WhatsApp number par live connect ho jayega. Har lead aur order aapke phone par sync hoga.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="text-xs font-semibold text-slate-500">
                Need a fully customized AI engine for your CRM or database?
              </span>
              <a
                href={getWhatsAppUrl('Hi Mukul, I need a custom AI agent tailored for my company workflow.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors"
              >
                <span>Talk to Founder Mukul on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Action */}
      <StickyWhatsApp />

      {/* ========================================================================= */}
      {/* 5-MINUTE INSTANT WHATSAPP QR SCANNER DEMO MODAL (FOR CUSTOMERS) */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsQrModalOpen(false);
                if (sandboxStatus === 'connected') {
                  handleDisconnectSandbox();
                }
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CASE 1: Customer Phone is CONNECTED for 5-Minute Sandbox Demo */}
            {sandboxStatus === 'connected' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sandbox Active • Auto-Disconnects in {formatCountdown(secondsRemaining)}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Aapka WhatsApp AI Se Connect Ho Gaya!
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Linked as: <strong className="text-slate-900 font-bold">{sandboxUser?.name || sandboxUser?.id || 'Your Phone'}</strong>. Agle 5 minute ke liye aapke number par aane wale customer messages ka AI auto-reply karega.
                </p>

                {/* Instructions to Test */}
                <div className="bg-surface-100 p-4 rounded-2xl border border-slate-200 text-left mb-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Abhi Live Test Karein:</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Apne kisi dost ya dusre phone se <strong>apne is number par WhatsApp message bhejiye</strong> (e.g. &ldquo;Hello, kya price hai?&rdquo;). Dekhiye MSR AI Agent turant 2 second me live auto-reply dega!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={async () => {
                      await handleDisconnectSandbox();
                      setIsQrModalOpen(false);
                    }}
                    disabled={isDisconnectingSandbox}
                    className="w-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isDisconnectingSandbox ? 'Disconnecting...' : 'Disconnect WhatsApp Demo Now'}</span>
                  </button>
                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-full sm:w-auto text-xs font-semibold text-slate-600 hover:text-slate-900 py-3 px-4 transition-colors"
                  >
                    Keep Running in Background
                  </button>
                </div>
              </div>
            )}

            {/* CASE 2: REAL SCANNABLE QR CODE READY */}
            {sandboxStatus === 'qr_ready' && sandboxQrCode && (
              <div className="text-center">
                {/* Countdown Header */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5-Minute Free Test Drive Sandbox</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                  Scan With Your Phone Camera
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5">
                  Apne WhatsApp se scan karein — agle 5 minute ke liye aapka number AI se automate ho jayega.
                </p>

                {/* Real Live Baileys Scannable QR Code Image */}
                <div className="bg-slate-900 p-5 rounded-3xl text-center text-white relative flex flex-col items-center justify-center mb-5 border border-slate-800 shadow-xl">
                  <div className="w-56 h-56 bg-white p-2.5 rounded-2xl shadow-inner flex items-center justify-center relative">
                    {/* Real Base64 Scannable QR Code */}
                    <img
                      src={sandboxQrCode}
                      alt="Real WhatsApp Pairing QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    {/* Laser scan animation overlay */}
                    <div className="absolute top-3 left-3 right-3 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10B981] animate-pulse pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 mt-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real WhatsApp QR • Scan Now</span>
                  </div>
                </div>

                {/* 3-Step Clear Instructions */}
                <div className="space-y-2 text-xs text-slate-700 mb-5 bg-surface-50 p-3.5 rounded-2xl border border-slate-100 text-left">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Apne phone me WhatsApp open karein ➔ <strong>3-dots / Settings</strong> ➔ <strong>Linked Devices</strong>.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>Link a Device</strong> par tap karein aur screen par diye QR code ko scan karein.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Scan hote hi ye screen automatically connect ho jayegi!</span>
                  </div>
                </div>

                {/* Privacy Assurance & Refresh / Cancel */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mb-4">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Private Sandbox (Auto-expires after 5 mins)</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartSandbox}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Refresh QR</span>
                    </button>
                    <button
                      onClick={async () => {
                        await handleDisconnectSandbox();
                        setIsQrModalOpen(false);
                      }}
                      className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: Loading / Initializing Sandbox Socket */}
            {(sandboxStatus === 'loading' || sandboxStatus === 'idle') && (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-base">
                  Generating Real WhatsApp Pairing QR Code...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Customer demo engine initialize ho raha hai. 2 second me real scannable QR display hoga.
                </p>
              </div>
            )}

            {/* CASE 4: Expired Sandbox */}
            {sandboxStatus === 'expired' && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg mb-1">
                  5-Minute Demo Time Completed!
                </h4>
                <p className="text-xs text-slate-600 mb-6 max-w-xs mx-auto">
                  Aapka WhatsApp number demo sandbox se safely disconnect ho chuka hai.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleStartSandbox}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md"
                  >
                    Test Again (New 5 Mins)
                  </button>
                  <a
                    href={getWhatsAppUrl('Hi Mukul, I tested the 5-minute WhatsApp AI demo and want to deploy this permanently for my business.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md"
                  >
                    Deploy Permanent AI For My Business
                  </a>
                </div>
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsQrModalOpen(false);
                  if (sandboxStatus === 'connected') {
                    handleDisconnectSandbox();
                  }
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-1.5 transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
