'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Send,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { getWhatsAppUrl, AGENCY_CONFIG } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import AIAgentDemo from '@/components/AIAgentDemo';

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
    badge: '🟢 Live Agent • Test Now',
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
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
    icon: 'shop',
    description: 'Website se aane wale Cash on Delivery orders ko WhatsApp par auto-verify karta hai, fake addresses detect karta hai aur RTO (Return to Origin) 35% tak kam karta hai.',
    capabilities: [
      'Automated 1-click WhatsApp order confirmation',
      'Fake pincode & incomplete address detector',
      'Abandoned checkout recovery auto-ping',
      'Prepaid discount upsell trigger (Save RTO)',
    ],
    responseSpeed: '< 1.5s',
    accuracy: '98.9%',
    preBookMessage: 'Hi MSR Next Gen, I want to deploy the D2C COD Verification & Anti-RTO Shield Agent for my e-commerce store.',
  },
  {
    id: 'restaurant-smart-dine',
    name: 'SmartDine Table & Party Booking Agent',
    category: 'food',
    categoryLabel: 'Restaurants & Cafes',
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
    icon: 'food',
    description: 'Instagram bio aur Google Maps se aane wale guests ki table, party space aur food preferences automatically WhatsApp par confirm karta hai.',
    capabilities: [
      'Real-time seating & rooftop booth reservation',
      'Digital food & drink menu PDF delivery',
      'Birthday & anniversary special discount lock',
      'Pre-order food feature to save kitchen prep time',
    ],
    responseSpeed: '< 1.8s',
    accuracy: '99.1%',
    preBookMessage: 'Hi MSR Next Gen, I want to deploy the SmartDine Table Booking Agent for our restaurant/cafe.',
  },
  {
    id: 'clinic-care-slot',
    name: 'CareSlot Clinic & Patient Appointment Agent',
    category: 'edu',
    categoryLabel: 'Healthcare & Doctors',
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
    icon: 'clinic',
    description: 'Clinics aur diagnostic labs ke patient appointments schedule karta hai, doctor token timings share karta hai aur clinic OPD rush 60% tak kam karta hai.',
    capabilities: [
      'Doctor specialist schedule & slot booking',
      'Automated appointment token generation',
      'Clinic Google Maps location dispatch',
      'Automated WhatsApp follow-up for next visit',
    ],
    responseSpeed: '< 1.7s',
    accuracy: '99.6%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the CareSlot Clinic Appointment Agent for our clinic/hospital.',
  },
  {
    id: 'edu-enroll-agent',
    name: 'EduEnroll School & Coaching Admission Agent',
    category: 'edu',
    categoryLabel: 'Education & Academies',
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
    icon: 'school',
    description: 'Schools aur coaching institutes ke parents ke admission queries solve karta hai, fee structure share karta hai aur verified campus visits schedule karta hai.',
    capabilities: [
      'Fee structure & syllabus PDF distribution',
      'Demo class booking & seat reservation',
      'Parent counselor video call slot sync',
      'Automated scholarship test registration',
    ],
    responseSpeed: '< 2.1s',
    accuracy: '99.0%',
    preBookMessage: 'Hi MSR Next Gen, I want early access to the EduEnroll School & Coaching Admission Agent.',
  },
  {
    id: 'real-estate-lead-matcher',
    name: 'EstateMatch Property & Lead Qualifier Agent',
    category: 'realestate',
    categoryLabel: 'Real Estate & Builders',
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
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
    status: 'live',
    badge: '🟢 Live Agent • Test Now',
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

interface ChatMsg {
  sender: 'customer' | 'ai';
  text: string;
  time: string;
  tag?: string;
}

const AGENT_CHAT_PRESETS: Record<string, { initialChat: ChatMsg[]; quickPrompts: string[] }> = {
  'whatsapp-autopilot': {
    initialChat: [
      { sender: 'customer', text: 'Hi, MSR Next Gen kya services provide karti hai? Pricing kya hai?', time: 'Just now' },
      { sender: 'ai', text: 'Namaste! 🙏 Welcome to MSR Next Gen. Hum Indian businesses aur D2C brands ke liye high-converting Meta & Google Ads manage karte hain aur 24/7 AI WhatsApp Chatbot setup karte hain. Packages ₹15,000/month se start hote hain. Aap kis business ke liye dekh rahe hain?', time: 'Just now', tag: 'AI Sales Pilot Replied in 1.4s' },
    ],
    quickPrompts: ['Amparo case study proof dikhao', 'Free 15-min growth audit kaise milega?', 'WhatsApp bot setup me kitna time lagta hai?'],
  },
  'd2c-cod-shield': {
    initialChat: [
      { sender: 'customer', text: 'Hi, kya mera COD order #AMP-8492 confirm ho gaya hai?', time: 'Just now' },
      { sender: 'ai', text: 'Namaste Rahul ji! 🙏 Yes, aapka Cash on Delivery order receive hua hai. Fake delivery prevent karne ke liye please confirm karein: Kya aapka address Flat 402, Sector 14, Noida hai? (Reply 1 to Confirm, 2 to Cancel).', time: 'Just now', tag: 'Anti-RTO Shield Active' },
      { sender: 'customer', text: 'Ha 1 confirm hai', time: 'Just now' },
      { sender: 'ai', text: 'Superb! Order #AMP-8492 verify ho gaya hai. Dispatch tracking link yahi WhatsApp par auto-send hoga. Agar abhi UPI se pay karte hain to ₹50 instant cashback milega!', time: 'Just now', tag: 'Verified & Synced' },
    ],
    quickPrompts: ['Delivery kitne din me hogi?', 'Address change karna hai', 'Prepaid payment discount link bhej do'],
  },
  'restaurant-smart-dine': {
    initialChat: [
      { sender: 'customer', text: 'Hello, aaj sham 8:30 PM 4 logo ke liye table mil sakti hai?', time: 'Just now' },
      { sender: 'ai', text: 'Hello! Bilkul, aaj sham 8:30 PM rooftop lounge aur indoor AC booth dono available hain. Konsa reserve karein aapke liye?', time: 'Just now', tag: 'SmartDine Instant Booking' },
      { sender: 'customer', text: 'Rooftop table kar do, birthday special.', time: 'Just now' },
      { sender: 'ai', text: 'Awesome! 🎉 Table #R-12 booked for 4 guests tonight at 8:30 PM under your name. Complimentary birthday dessert on the house! Food menu: msrnextgen.com/menu', time: 'Just now', tag: 'Table Confirmed' },
    ],
    quickPrompts: ['Veg aur Non-veg menu kya hai?', 'Parking space available hai?', 'Reservation timing reschedule karni hai'],
  },
  'clinic-care-slot': {
    initialChat: [
      { sender: 'customer', text: 'Hello, Dr. Sharma se consult karne ka appointment mil sakta hai kal?', time: 'Just now' },
      { sender: 'ai', text: 'Namaste! Dr. Sharma kal subah 10:30 AM aur sham 5:00 PM dono slots me available hain. OPD consultation fee ₹500 hai. Kaunsa slot book karein?', time: 'Just now', tag: 'Doctor Schedule Synced' },
      { sender: 'customer', text: 'Sham 5:00 PM book kar do.', time: 'Just now' },
      { sender: 'ai', text: 'Booking Confirmed! ✅ Token #14 allocated for tomorrow 5:00 PM. Clinic address: Civil Lines, Gorakhpur. Google Maps pin dispatched. Please reach 10 mins early.', time: 'Just now', tag: 'Token #14 Confirmed' },
    ],
    quickPrompts: ['Doctor ki specialisation kya hai?', 'Online video consult ho sakta hai?', 'Reports WhatsApp par bhej sakta hu?'],
  },
  'edu-enroll-agent': {
    initialChat: [
      { sender: 'customer', text: 'Hello, Class 11th JEE batch ki fee aur timings kya hain?', time: 'Just now' },
      { sender: 'ai', text: 'Namaste! Target JEE 2027 batch evening 4:00 PM to 8:00 PM chalta hai. Free 2-day demo class this Saturday se start ho rahi hai. Kya aap student ka naam register karna chahenge?', time: 'Just now', tag: 'Admission Desk Live' },
      { sender: 'customer', text: 'Ha Aryan Mishra, Class 11th Science.', time: 'Just now' },
      { sender: 'ai', text: 'Registration Successful! 🎓 Aryan ji ka demo seat #D-24 reserve ho gaya hai for Saturday 4 PM. Study module PDF and classroom location link dispatched.', time: 'Just now', tag: 'Seat #D-24 Locked' },
    ],
    quickPrompts: ['Scholarship test kab hai?', 'Past year selection results kya hain?', 'Hostel/Bus facility available hai?'],
  },
  'real-estate-lead-matcher': {
    initialChat: [
      { sender: 'customer', text: 'Hi, mujhe Sector 62 me 3BHK flat dekhna hai. Budget around 1.2 Cr.', time: 'Just now' },
      { sender: 'ai', text: 'Namaste! Hamare paas Sector 62 me 2 premium gated projects hain with 3BHK starting at ₹1.15 Cr with clubhouse & swimming pool. Kya main digital brochure WhatsApp par bhejoon?', time: 'Just now', tag: 'Budget Qualified (1.2 Cr)' },
      { sender: 'customer', text: 'Ha brochure bhej dijiye aur kal site visit kara dijiye.', time: 'Just now' },
      { sender: 'ai', text: 'Brochure PDF dispatched! 🏢 Kal subah 11:30 AM site visit confirm kar di gayi hai. Sales Manager Amit (+91 95193 42440) aapko site reception par receive karenge.', time: 'Just now', tag: 'Site Visit Confirmed' },
    ],
    quickPrompts: ['Bank loan approval process', 'Possession date kab hai?', 'Site visit location pin bhej do'],
  },
  'omni-support-bot': {
    initialChat: [
      { sender: 'customer', text: 'Hi, mera return pickup kab hoga? Order #8921.', time: 'Just now' },
      { sender: 'ai', text: 'Namaste! Order #8921 ka return request verify ho chuka hai. Delivery courier partner kal dopahar 12:00 PM se 3:00 PM ke beech item pick karega. Pickup ke 24 ghante me refund initiate ho jayega.', time: 'Just now', tag: 'Auto Support Resolved' },
    ],
    quickPrompts: ['Refund bank account me kab aayega?', 'Item size exchange kaise karein?', 'Customer care executive se direct call'],
  },
};

export default function AgentsDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // Dedicated Customer Sandbox Demo States
  const [sandboxStatus, setSandboxStatus] = useState<'idle' | 'loading' | 'qr_ready' | 'connected' | 'expired' | 'cloud_ready'>('cloud_ready');
  const [sandboxQrCode, setSandboxQrCode] = useState<string | null>(null);
  const [sandboxUser, setSandboxUser] = useState<{ id?: string; name?: string } | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isDisconnectingSandbox, setIsDisconnectingSandbox] = useState<boolean>(false);
  const { showToast } = useToast();

  // Active Interactive Agent Live Test Modal
  const [activeTestAgent, setActiveTestAgent] = useState<AIAgentItem | null>(null);
  const [testChatMessages, setTestChatMessages] = useState<ChatMsg[]>([]);
  const [testInput, setTestInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
      } else if (data.status === 'initializing' || data.status === 'loading') {
        setSandboxStatus('loading');
      } else if (data.status === 'expired') {
        setSandboxStatus('expired');
      } else {
        // Cloud simulator fallback
        setSandboxStatus('cloud_ready');
      }
    } catch {
      setSandboxStatus('cloud_ready');
    }
  };

  useEffect(() => {
    fetchSandboxStatus();
  }, []);

  // Scroll chat modal when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [testChatMessages, isAiThinking]);

  // Open Interactive Test Modal for any Agent
  const handleOpenAgentTest = (agent: AIAgentItem) => {
    setActiveTestAgent(agent);
    const preset = AGENT_CHAT_PRESETS[agent.id] || AGENT_CHAT_PRESETS['whatsapp-autopilot'];
    setTestChatMessages(preset.initialChat);
    setTestInput('');
    setIsAiThinking(false);
    trackEvent('demo_scenario_change', { scenario: agent.id });
  };

  // Send message in interactive agent test modal
  const handleSendTestMessage = async (customText?: string) => {
    const textToSend = (customText || testInput).trim();
    if (!textToSend || isAiThinking) return;

    const userMsg: ChatMsg = {
      sender: 'customer',
      text: textToSend,
      time: 'Just now',
    };

    setTestChatMessages((prev) => [...prev, userMsg]);
    setTestInput('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...testChatMessages.map((m) => ({
              role: m.sender === 'ai' ? 'assistant' : 'user',
              content: m.text,
            })),
            { role: 'user', content: textToSend },
          ],
        }),
      });

      const data = await res.json();
      const replyText =
        res.ok && data.success && data.reply
          ? data.reply
          : `Namaste! ${activeTestAgent?.name || 'MSR AI'} ne aapka message receive kiya. Hum instant automation deliver karte hain. Call or chat: +91 95193 42440.`;

      setTimeout(() => {
        setTestChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: replyText,
            time: 'Just now',
            tag: `${activeTestAgent?.name || 'AI'} Replied in 1.2s`,
          },
        ]);
        setIsAiThinking(false);
      }, 700);
    } catch {
      setTimeout(() => {
        setTestChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Aapka message receive hua! MSR Next Gen AI agent 24/7 active rehta hai. Founder Mukul se direct WhatsApp par judne ke liye tap karein: +91 95193 42440.',
            time: 'Just now',
            tag: 'Automated Instant Delivery',
          },
        ]);
        setIsAiThinking(false);
      }, 600);
    }
  };

  // Start fresh Customer Sandbox Session
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
      if (data.success && data.qrCode) {
        setSandboxQrCode(data.qrCode);
        setSandboxStatus('qr_ready');
      } else {
        setTimeout(fetchSandboxStatus, 1500);
      }
    } catch {
      setSandboxStatus('cloud_ready');
    }
  };

  const handleDisconnectSandbox = async () => {
    setIsDisconnectingSandbox(true);
    try {
      await fetch('/api/sandbox/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      setSandboxStatus('cloud_ready');
      setSandboxQrCode(null);
      setSandboxUser(null);
      setSecondsRemaining(300);
      showToast({ message: 'WhatsApp Demo safely disconnected.', type: 'info' });
    } catch {
      showToast({ message: 'Disconnected session.', type: 'info' });
    } finally {
      setIsDisconnectingSandbox(false);
    }
  };

  const handleOpenSandboxModal = () => {
    setIsQrModalOpen(true);
    handleStartSandbox();
    trackEvent('whatsapp_click', { source: 'agents_page_sandbox_open' });
  };

  useEffect(() => {
    if (!isQrModalOpen) return;
    const interval = setInterval(fetchSandboxStatus, 2500);
    return () => clearInterval(interval);
  }, [isQrModalOpen]);

  const formatCountdown = (secs: number) => {
    const mins = Math.max(Math.floor(secs / 60), 0);
    const remainder = Math.max(secs % 60, 0);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col w-full selection:bg-brand-600 selection:text-white">
      <Navbar />

      <main className="flex-1 w-full pb-20 sm:pb-28">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-surface-100 to-white pt-10 sm:pt-16 pb-14 border-b border-surface-200">
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
              Har business ki alag requirements hoti hain — D2C Orders, Table Booking, School Admissions ya Clinic Appointments. Choose your specialized AI Agent and test live right now.
            </p>

            {/* Quick Banner: 5-Minute Free Sandbox Demo Button */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-slate-900 text-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-800 max-w-xl mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-emerald-500/20 border-emerald-400 text-emerald-300">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      Instant WhatsApp AI Test Drive
                    </h4>
                    <span className="font-black text-[10px] px-2 py-0.5 rounded-full uppercase bg-emerald-500 text-slate-950 animate-pulse">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test our live WhatsApp AI agent in browser or chat on your phone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleOpenSandboxModal}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Launch Live Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE IN-BROWSER SIMULATOR PLAYGROUND */}
        {/* ========================================================================= */}
        <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-200">
              Interactive Hands-On Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Try Industry AI Agents in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-1">
              Select an industry below and see how the AI agent qualifies leads and closes bookings in 2 seconds.
            </p>
          </div>

          <AIAgentDemo />
        </section>

        {/* Category Filters */}
        <section className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
          <div className="text-center mb-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              All 7 Specialized AI Agents
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Click &ldquo;Test Agent Live&rdquo; on any agent to chat and experience its custom workflow.
            </p>
          </div>

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
              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative group"
                >
                  {/* Top Status & Category Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {agent.categoryLabel}
                      </span>
                      <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{agent.badge}</span>
                      </span>
                    </div>

                    {/* Agent Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-emerald-500/15 border-emerald-300 text-emerald-700">
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
                        <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                          ✓ Ready for Live In-Browser & Phone Test
                        </span>
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

                  {/* Dual Action CTA Buttons: Test Live + WhatsApp Setup */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => handleOpenAgentTest(agent)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>Test Agent Live</span>
                      <ArrowRight className="w-4 h-4 opacity-80" />
                    </button>

                    <a
                      href={getWhatsAppUrl(agent.preBookMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackEvent('whatsapp_click', { source: `agent_setup_${agent.id}` });
                      }}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs py-3.5 px-3.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 border border-slate-700 shrink-0"
                      title="Connect or Setup on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Deploy</span>
                    </a>
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
                  Apne business model ke mutabiq agent select karein (Orders, Table Bookings ya Lead Qualification).
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
                Need a custom AI engine tailored to your unique ERP or CRM?
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

      <Footer />
      <StickyWhatsApp />

      {/* ========================================================================= */}
      {/* MODAL 1: LIVE INTERACTIVE AGENT TEST PLAYGROUND (FOR EVERY AGENT) */}
      {/* ========================================================================= */}
      {activeTestAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* WhatsApp Top Header Bar */}
            <div className="bg-emerald-700 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-500 flex items-center justify-center text-white font-bold relative">
                  <Bot className="w-5 h-5 text-emerald-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-emerald-800 absolute bottom-0 right-0 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    {activeTestAgent.name}
                  </h4>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    <span>Online • Instant Auto-Reply Live</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppUrl(`Hi Mukul, I am testing the ${activeTestAgent.name} and want to see how it works on WhatsApp.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-emerald-400 flex items-center gap-1 transition-all"
                  title="Test on real WhatsApp"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Test On Phone</span>
                </a>
                <button
                  onClick={() => setActiveTestAgent(null)}
                  className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Test Phone Banner */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-900">
              <span className="flex items-center gap-1 font-semibold">
                <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live Interactive Simulation — Type any question or tap prompts below</span>
              </span>
              <span className="text-[10px] font-black uppercase bg-emerald-200/80 px-2 py-0.5 rounded-md text-emerald-900 shrink-0">
                100% Free Test
              </span>
            </div>

            {/* Chat Body (WhatsApp Background look) */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 min-h-[300px] max-h-[420px]"
            >
              {testChatMessages.map((msg, idx) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs ${
                        isAi
                          ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200/60'
                          : 'bg-[#d9fdd3] text-slate-900 rounded-tr-none border border-emerald-200/60'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      
                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400">
                        <span>{msg.time}</span>
                        {!isAi && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>

                    {msg.tag && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                        ✓ {msg.tag}
                      </span>
                    )}
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[200px] shadow-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] font-medium">{activeTestAgent.name} is typing...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2.5 bg-surface-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 pl-1">
                Quick Test:
              </span>
              {(AGENT_CHAT_PRESETS[activeTestAgent.id]?.quickPrompts || []).map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendTestMessage(prompt)}
                  className="shrink-0 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendTestMessage();
                }}
                placeholder="Type question in Hindi or English (e.g. Price kya hai?)..."
                className="flex-1 bg-surface-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />

              <button
                onClick={() => handleSendTestMessage()}
                disabled={!testInput.trim() || isAiThinking}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 text-white p-2.5 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            {/* Bottom 1-Tap Real Phone WhatsApp Link */}
            <div className="bg-slate-900 p-3 text-center text-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">
                Want to test this live on your actual phone WhatsApp?
              </span>
              <a
                href={getWhatsAppUrl(`Hi Mukul, I am testing the ${activeTestAgent.name} on the website and want to test it on my personal WhatsApp.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Chat on Real WhatsApp (+91 95193 42440)</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 5-MINUTE INSTANT WHATSAPP TEST DRIVE SANDBOX */}
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

            {/* CASE 1: Customer Phone Connected */}
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
                </div>
              </div>
            )}

            {/* CASE 2: QR Code Ready (When Baileys worker is linked) */}
            {sandboxStatus === 'qr_ready' && sandboxQrCode && (
              <div className="text-center">
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

                <div className="bg-slate-900 p-5 rounded-3xl text-center text-white relative flex flex-col items-center justify-center mb-5 border border-slate-800 shadow-xl">
                  <div className="w-56 h-56 bg-white p-2.5 rounded-2xl shadow-inner flex items-center justify-center relative">
                    <img
                      src={sandboxQrCode}
                      alt="Real WhatsApp Pairing QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute top-3 left-3 right-3 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10B981] animate-pulse pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 mt-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real WhatsApp QR • Scan Now</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: Cloud Ready / Instant Sandbox Mode (Never hangs on infinite loading) */}
            {(sandboxStatus === 'cloud_ready' || sandboxStatus === 'idle') && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
                  <Bot className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Instant Live AI Testing Ready</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Test Live AI Agent Instantly
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
                  Aap bina kisi QR setup ke direct in-browser interactive simulator me AI test kar sakte hain ya apne real phone se direct WhatsApp par chat kar sakte hain!
                </p>

                <div className="space-y-3 mb-6">
                  {/* Choice 1: In-Browser Playground */}
                  <button
                    onClick={() => {
                      setIsQrModalOpen(false);
                      handleOpenAgentTest(AGENTS_CATALOG[0]);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-yellow-300" />
                      <span>Open Live In-Browser AI Playground</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Choice 2: Test On Phone WhatsApp */}
                  <a
                    href={getWhatsAppUrl('Hi MSR Next Gen, I want to test your live AI WhatsApp sales bot on my phone.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-2xl transition-all flex items-center justify-between border border-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Chat Live On Phone WhatsApp (+91 95193 42440)</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                <div className="p-3 bg-surface-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">
                    💡 Running local Baileys QR Worker?
                  </span>
                  <span>
                    Agar aapka background worker live hai, to{' '}
                    <button
                      onClick={handleStartSandbox}
                      className="text-emerald-700 font-bold underline hover:text-emerald-800"
                    >
                      Click here to refresh QR code
                    </button>
                    .
                  </span>
                </div>
              </div>
            )}

            {/* CASE 4: Loading state */}
            {sandboxStatus === 'loading' && (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-base">
                  Checking Live WhatsApp Engine...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Connecting to live worker session. One moment please...
                </p>
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-1 transition-colors"
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
