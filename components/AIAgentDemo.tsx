'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  CheckCheck,
  Send,
  Sparkles,
  MessageCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Clock,
  ShoppingBag,
  Utensils,
  GraduationCap,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Play,
} from 'lucide-react';
import { getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';

interface ChatMessage {
  id: number;
  sender: 'customer' | 'ai';
  text: string;
  time: string;
  tag?: string;
}

interface Scenario {
  id: string;
  title: string;
  icon: 'shop' | 'food' | 'school' | 'clinic';
  category: string;
  clientExample: string;
  messages: Array<{
    sender: 'customer' | 'ai';
    text: string;
    tag?: string;
  }>;
  quickChips: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'd2c',
    title: 'D2C Brand & Online Store',
    icon: 'shop',
    category: 'E-Commerce / Retail',
    clientExample: 'e.g. Amparo Wellness',
    messages: [
      {
        sender: 'customer',
        text: 'Hi, do you have the Organic Glow Serum in stock? Price kya hai?',
      },
      {
        sender: 'ai',
        text: 'Namaste! Yes, Organic Glow Serum stock me available hai. Price ₹899 (Free Cash on Delivery all-India). Kya aap review dekhna chahenge ya order karein?',
        tag: 'Replied in 1.8s',
      },
      {
        sender: 'customer',
        text: 'Ha 1 bottle Cash on Delivery book kar do, Delhi address par.',
      },
      {
        sender: 'ai',
        text: 'Superb! [Demo Simulation] Order #AMP-8492 verify ho gaya hai. (Yeh ek interactive simulation demo hai — koi real order ya payment place nahi hua hai). Real bot isi tarah live dispatch aur tracking link WhatsApp par auto-send karta hai!',
        tag: 'Demo Simulation • CRM & Sheets Auto-Sync',
      },
    ],
    quickChips: [
      'Delhi me delivery kitne din me hogi?',
      'Discount coupon code kya hai?',
      'Return policy kya hai?',
    ],
  },
  {
    id: 'food',
    title: 'Restaurant & Cafe',
    icon: 'food',
    category: 'Food & Hospitality',
    clientExample: 'e.g. Nacho G / The Bunker Cafe',
    messages: [
      {
        sender: 'customer',
        text: 'Hello, aaj shaam 8:00 PM 4 logo ke liye table mil sakti hai?',
      },
      {
        sender: 'ai',
        text: 'Hello! Bilkul, aaj sham 8:00 PM indoor booth aur rooftop lounge dono available hain. Konsa preference hai aapka?',
        tag: 'Replied in 2.1s',
      },
      {
        sender: 'customer',
        text: 'Indoor booth table book kar do, Rahul ke naam se.',
      },
      {
        sender: 'ai',
        text: 'Done Rahul ji! [Demo Reservation] Table #04 for 4 Guests aaj sham 8:00 PM confirm ho chuki hai. (Simulation demo — live bot instantly locks table in POS/Calendar & alerts manager). Location pin & digital pass attached!',
        tag: 'Demo Simulation • Table Confirmed',
      },
    ],
    quickChips: [
      'Special menu aur pizza prices bhejo',
      'Birthday party package kitne ka hai?',
      'Live music timing kya hai?',
    ],
  },
  {
    id: 'school',
    title: 'School & Coaching',
    icon: 'school',
    category: 'Education',
    clientExample: 'e.g. Elite Futuristic School',
    messages: [
      {
        sender: 'customer',
        text: 'Class 9th admission open hai kya? Fee structure mil sakta hai?',
      },
      {
        sender: 'ai',
        text: 'Namaste! Yes, Session 2026-27 ke admissions open hain. Humne brochure aur fee details yaha share kar di hai. Kya aap campus visit book karna chahte hain?',
        tag: 'Instant Brochure PDF Sent',
      },
      {
        sender: 'customer',
        text: 'Haan kal dopahar 2 baje visit schedule kar dijiye.',
      },
      {
        sender: 'ai',
        text: '[Demo Visit Scheduled] Kal 2:00 PM Senior Counselor visit confirm ho gayi hai. (Simulation demo — real bot instantly notifies admission office & triggers SMS/WhatsApp reminder).',
        tag: 'Demo Simulation • Admission CRM Locked',
      },
    ],
    quickChips: [
      'School bus facility available hai?',
      'CBSE affiliation hai ya ICSE?',
      'Admission form link bhejo',
    ],
  },
  {
    id: 'clinic',
    title: 'Clinic & Appointment',
    icon: 'clinic',
    category: 'Healthcare & Salons',
    clientExample: 'e.g. Doctors, Dentists, Salons',
    messages: [
      {
        sender: 'customer',
        text: 'Doctor consultation ke liye aaj appointment slot mil sakta hai?',
      },
      {
        sender: 'ai',
        text: 'Namaste! Aaj sham 5:30 PM aur kal subah 11:00 AM do slots available hain. Konsa time aapke liye best rahega?',
        tag: 'Calendar Checked in 1.5s',
      },
      {
        sender: 'customer',
        text: 'Aaj sham 5:30 PM ka slot confirm kar do please.',
      },
      {
        sender: 'ai',
        text: 'Done! [Demo Appointment] Token #08 sham 5:30 PM confirm ho gaya hai. (Simulation demo — real bot auto-syncs clinic calendar & sends token/map link). Kripya 10 min pehle reach karein.',
        tag: 'Demo Simulation • Slot Booked & Reception Notified',
      },
    ],
    quickChips: [
      'Consultation fee kitni hai?',
      'Clinic location pin bhejo',
      'Kya online consultation bhi hoti hai?',
    ],
  },
];

export default function AIAgentDemo() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('d2c');
  // Pre-render default scenario immediately so page load is instant with 0 lag and 0 scroll jumps
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>(() => {
    return SCENARIOS[0].messages.map((m, idx) => ({
      id: idx + 1,
      sender: m.sender,
      text: m.text,
      time: '11:42 PM',
      tag: m.tag,
    }));
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [customInput, setCustomInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const simulationTimers = useRef<NodeJS.Timeout[]>([]);
  const { showToast } = useToast();

  const currentScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  // Helper to clear existing timers
  const clearTimers = () => {
    simulationTimers.current.forEach((t) => clearTimeout(t));
    simulationTimers.current = [];
  };

  // Run realistic animated message-by-message playback
  const playScenarioSimulation = (scenario: Scenario) => {
    clearTimers();
    setDisplayedMessages([]);
    setIsPlayingSimulation(true);
    setIsTyping(false);
    setCurrentStep(1);

    const now = new Date();
    const baseHour = now.getHours();
    const baseMin = now.getMinutes();
    const timeStr = `${baseHour > 12 ? baseHour - 12 : baseHour || 12}:${baseMin < 10 ? '0' + baseMin : baseMin} ${baseHour >= 12 ? 'PM' : 'AM'}`;

    // Step 1: Customer asks query (immediate)
    const t1 = setTimeout(() => {
      setDisplayedMessages([
        {
          id: 1,
          sender: 'customer',
          text: scenario.messages[0].text,
          time: timeStr,
        },
      ]);
      setCurrentStep(1);
    }, 300);

    // Step 2: AI starts typing...
    const t2 = setTimeout(() => {
      setIsTyping(true);
      setCurrentStep(2);
    }, 1100);

    // Step 3: AI answers with tag
    const t3 = setTimeout(() => {
      setIsTyping(false);
      setDisplayedMessages((prev) => [
        ...prev,
        {
          id: 2,
          sender: 'ai',
          text: scenario.messages[1].text,
          time: timeStr,
          tag: scenario.messages[1].tag,
        },
      ]);
      setCurrentStep(2);
    }, 2200);

    // Step 4: Customer confirms order/booking
    const t4 = setTimeout(() => {
      setDisplayedMessages((prev) => [
        ...prev,
        {
          id: 3,
          sender: 'customer',
          text: scenario.messages[2].text,
          time: timeStr,
        },
      ]);
    }, 3400);

    // Step 5: AI types confirmation
    const t5 = setTimeout(() => {
      setIsTyping(true);
      setCurrentStep(3);
    }, 4200);

    // Step 6: AI locks order into CRM
    const t6 = setTimeout(() => {
      setIsTyping(false);
      setDisplayedMessages((prev) => [
        ...prev,
        {
          id: 4,
          sender: 'ai',
          text: scenario.messages[3].text,
          time: timeStr,
          tag: scenario.messages[3].tag,
        },
      ]);
      setIsPlayingSimulation(false);
      setCurrentStep(3);
    }, 5200);

    simulationTimers.current = [t1, t2, t3, t4, t5, t6];
  };

  // Only run animated simulation when scenario changes or user explicitly replays (never on initial page load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    playScenarioSimulation(currentScenario);
    return () => clearTimers();
  }, [activeScenarioId]);

  // Auto-scroll ONLY inside the chat container (NEVER scrolls the window/page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping]);

  // Handle custom user live testing message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;
    clearTimers();
    setIsPlayingSimulation(false);

    const now = new Date();
    const timeStr = `${now.getHours() > 12 ? now.getHours() - 12 : now.getHours() || 12}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const userMsgId = Date.now();
    setDisplayedMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'customer',
        text: textToSend.trim(),
        time: timeStr,
      },
    ]);
    setCustomInput('');
    setIsTyping(true);
    setCurrentStep(2);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentScenario?.id,
          agentName: currentScenario?.title,
          messages: [
            ...displayedMessages.map((m) => ({
              role: m.sender === 'ai' ? ('assistant' as const) : ('user' as const),
              content: m.text,
            })),
            { role: 'user' as const, content: textToSend.trim() },
          ],
        }),
      });
      const data = await res.json();
      const aiReply =
        data.success && data.reply
          ? data.reply
          : 'Namaste! Hum aapke business ke mutabiq products, prices aur bookings is AI agent me 24 ghante me live integrate kar dete hain.';

      setDisplayedMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiReply,
          time: timeStr,
          tag: `Live AI Response (${data.provider || 'Smart Assistant'})`,
        },
      ]);
      setCurrentStep(3);
    } catch {
      setDisplayedMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Namaste! MSR Next Gen ka yeh AI Agent aapke customer ki har query ka 2 second me accurate jawab deta hai aur CRM me sync karta hai.',
          time: timeStr,
          tag: 'Live AI Engine',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleWhatsAppDemoClick = () => {
    trackEvent('whatsapp_click', { source: 'ai_agent_demo' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000).',
        type: 'warning',
      });
    }
  };

  return (
    <section id="ai-demo" className="w-full py-16 sm:py-24 bg-gradient-to-b from-white via-surface-100 to-white border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-bold mb-3 border border-emerald-200/80 shadow-2xs">
            <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Live Interactive AI Simulation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Dekhiye AI Agent Kaise 2 Second Me Lead & Order Handle Karta Hai
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Jab aap so rahe honge ya busy honge, yeh AI WhatsApp par customer se baat karega, catalog dikhayega aur order book karega — <span className="text-slate-900 font-bold">bina kisi staff ke.</span>
          </p>
        </div>

        {/* Industry Selector Tabs: Choose Your Business */}
        <div className="mb-8">
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Apna Business Type Select Karein (Live Simulation Check Karein)
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-4xl mx-auto">
            {SCENARIOS.map((sc) => {
              const isSelected = sc.id === activeScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenarioId(sc.id);
                    trackEvent('demo_scenario_change', { scenario: sc.id });
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  {sc.icon === 'shop' && <ShoppingBag className="w-4 h-4 shrink-0" />}
                  {sc.icon === 'food' && <Utensils className="w-4 h-4 shrink-0" />}
                  {sc.icon === 'school' && <GraduationCap className="w-4 h-4 shrink-0" />}
                  {sc.icon === 'clinic' && <Calendar className="w-4 h-4 shrink-0" />}
                  <span>{sc.title}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Visual 3-Step Live Guide & Explainer */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  3-Step Automation Workflow
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  Zero Human Delay
                </span>
              </div>

              {/* Step 1 */}
              <div className={`pt-4 transition-all duration-300 ${currentStep === 1 ? 'opacity-100 scale-101' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    currentStep === 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}>
                    1
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Customer Inquires Anytime (24/7)
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                      Customer raat ke 12 baje WhatsApp par product price, table ya service ke baare me poochta hai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`pt-4 transition-all duration-300 ${currentStep === 2 ? 'opacity-100 scale-101' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    currentStep === 2 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}>
                    2
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <span>Instant 2-Sec AI Response</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Fast</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                      AI bina rukiye natural Hindi/English me exact prices, photos aur options provide karta hai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`pt-4 transition-all duration-300 ${currentStep === 3 ? 'opacity-100 scale-101' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    currentStep === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}>
                    3
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Lead Qualified & Synced to CRM
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                      Customer ka address/phone lekar order ya appointment confirm karta hai aur aapke mobile pe alert bhejta hai.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 text-center">
                <span className="block text-xl sm:text-2xl font-black text-emerald-700">&lt; 2 Sec</span>
                <span className="text-[11px] font-bold text-emerald-900">Reply Time</span>
              </div>
              <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/60 text-center">
                <span className="block text-xl sm:text-2xl font-black text-teal-700">100%</span>
                <span className="text-[11px] font-bold text-teal-900">Lead Capture</span>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60 text-center">
                <span className="block text-xl sm:text-2xl font-black text-amber-700">₹0</span>
                <span className="text-[11px] font-bold text-amber-900">Night Staff Cost</span>
              </div>
            </div>

            {/* Trust Note */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Official Meta Business Standards & WhatsApp Policy-Compliant Architecture strictly followed.</span>
            </div>

          </div>

          {/* Right Column: Realistic Animated WhatsApp Phone Simulation */}
          <div className="lg:col-span-7">
            <div className="bg-slate-950 rounded-[2.5rem] p-3 sm:p-4 shadow-2xl border-4 border-slate-800 relative">
              
              {/* Phone Camera Notch Simulation */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 hidden sm:block" />

              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white px-4 py-3.5 rounded-t-[2rem] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-[#075E54]">
                      <Bot className="w-6 h-6 text-[#075E54]" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm sm:text-base leading-none">MSR AI Assistant</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                    <span className="text-[11px] text-emerald-200 font-medium">
                      {isTyping ? 'typing...' : 'Online 24/7 • Replies in 2s'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playScenarioSimulation(currentScenario)}
                    title="Replay simulated conversation"
                    className="p-1.5 px-2.5 hover:bg-white/10 rounded-full text-emerald-100 transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/10"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isPlayingSimulation ? 'animate-spin' : ''}`} />
                    <span>Replay Demo</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Chat Messages Canvas */}
              <div
                ref={chatContainerRef}
                className="bg-[#EFEAE2] p-4 sm:p-5 min-h-[380px] max-h-[440px] overflow-y-auto space-y-3.5 rounded-b-none transition-all scroll-smooth"
              >
                
                {/* Prominent Simulation & Demo Notice Banner */}
                <div className="text-center my-1.5">
                  <div className="bg-amber-100/95 border border-amber-300/80 text-amber-950 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>INTERACTIVE DEMO SIMULATION • No real orders or transactions placed</span>
                  </div>
                </div>

                {displayedMessages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} animate-chat-in`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] px-3.5 py-2.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                          isCustomer
                            ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-none'
                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                        }`}
                      >
                        <p className="font-normal whitespace-pre-line">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                        </div>
                      </div>

                      {/* AI Response Micro-Tag */}
                      {msg.tag && (
                        <div className="mt-1 ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{msg.tag}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 italic bg-white/90 w-fit px-3.5 py-2 rounded-2xl rounded-tl-none shadow-xs">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="font-medium text-[11px] ml-1">AI is preparing response...</span>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips to Test Live */}
              <div className="bg-slate-900/95 px-3 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">Try Asking:</span>
                {currentScenario.quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="shrink-0 text-[11px] text-emerald-300 hover:text-white bg-slate-800 hover:bg-emerald-800/60 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    &ldquo;{chip}&rdquo;
                  </button>
                ))}
              </div>

              {/* Live Interactive Input Bar */}
              <div className="bg-slate-900 p-2.5 rounded-b-[2rem] border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(customInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Type in Hindi or English to test this AI live..."
                    className="flex-1 bg-slate-950 text-white placeholder:text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!customInput.trim() || isTyping}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                  <span className="text-slate-400">💡 Live Test Mode: AI replies dynamically</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Interactive
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Direct CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-block bg-surface-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Want This 24/7 AI WhatsApp Agent For Your Business?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
              Hum aapke catalog, menu ya services ke mutabiq yeh exact AI Agent aapke number par setup karenge — zero technical hassle.
            </p>
            <a
              href={getWhatsAppUrl('Hi MSR Next Gen, I want to set up this exact 24/7 AI WhatsApp Agent for my business.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppDemoClick}
              className="inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Deploy This AI Agent For Your Business</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
