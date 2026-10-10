'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Building2,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  ExternalLink,
  LogOut,
  Sparkles,
  Bot,
  RefreshCw,
  Send,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/portal/auth/me');
      if (res.status === 401) {
        router.push('/portal/login');
        return;
      }
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load profile');
      }
    } catch {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' });
      router.push('/portal/login');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading your Growth Engine...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
            <p className="text-xs text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/portal/login')}
              className="bg-brand-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            >
              Re-login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { client, orders = [], onboarding, botStatus } = data;
  const hasOrders = orders && orders.length > 0;
  const isOnboarded = Boolean(onboarding);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-black text-xl shrink-0">
              {client.businessName ? client.businessName.substring(0, 2).toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Verified Client
                </span>
                <span className="text-xs text-slate-400">{client.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {client.businessName || client.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Welcome, {client.name} • {client.phone} • {client.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <a
              href="https://wa.me/918887521156?text=Namaste%20Mukul%20sir,%20main%20client%20portal%20se%20connect%20kar%20raha%20hu."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Direct Founder Chat</span>
            </a>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 4-Step Onboarding Milestone Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Service Onboarding & Go-Live Tracker
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time milestone progress managed by Mukul Mishra & Maya AI
              </p>
            </div>
            {!isOnboarded && (
              <a
                href="/onboarding"
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
              >
                <span>Fill Onboarding Form</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className={`p-4 rounded-2xl border ${isOnboarded ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Step 1</span>
                {isOnboarded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </div>
              <h3 className="font-bold text-sm text-white">Business Details</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isOnboarded ? 'Form submitted & profile secured' : 'Pending submission'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl border bg-slate-950 border-slate-800 text-slate-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Step 2</span>
                <Clock className="w-4 h-4 text-brand-400 animate-pulse" />
              </div>
              <h3 className="font-bold text-sm text-white">Strategy & Assets</h3>
              <p className="text-xs text-slate-400 mt-1">
                Founder review & high-converting reel scripts
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border bg-slate-950 border-slate-800 text-slate-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Step 3</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="font-bold text-sm text-white">Maya AI WhatsApp Engine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Custom trained bot setup & qualification test
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl border bg-slate-950 border-slate-800 text-slate-400">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Step 4</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-sm text-white">Official Go-Live</h3>
              <p className="text-xs text-slate-400 mt-1">
                Meta/Google Ads live & automated lead conversion
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Orders & WhatsApp Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders & Invoices (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Active Orders & Official Invoices</h2>
                  <p className="text-xs text-slate-400">Your verified packages & downloadable receipts</p>
                </div>
              </div>
              <a
                href="/#pricing"
                className="text-xs font-bold text-brand-400 hover:underline"
              >
                Upgrade Plan
              </a>
            </div>

            {hasOrders ? (
              <div className="space-y-4">
                {orders.map((ord: any, idx: number) => (
                  <div
                    key={ord.id || idx}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-brand-400">
                          {ord.package_name || ord.package_id || 'MSR Package'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 uppercase">
                          {ord.status || 'paid'}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white mt-1">
                        ₹{Number(ord.amount || 0).toLocaleString('en-IN')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Order ID: {ord.razorpay_order_id || ord.id} • {new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <a
                      href={`/invoice?orderId=${encodeURIComponent(ord.razorpay_order_id || ord.id)}&phone=${encodeURIComponent(client.phone)}&business=${encodeURIComponent(client.businessName)}&amount=${ord.amount || 14999}&package=${encodeURIComponent(ord.package_name || 'Growth Package')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all border border-slate-700 shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Download Invoice</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">No active online orders recorded</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Agar aapne offline payment ya direct transfer kiya hai, Mukul sir se link verify karwayein.
                </p>
                <a
                  href="/#pricing"
                  className="inline-flex items-center gap-2 bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Choose Growth Package
                </a>
              </div>
            )}
          </div>

          {/* WhatsApp Engine Health (1 Col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Maya AI Engine</h2>
                  <p className="text-xs text-slate-400">24/7 WhatsApp Growth Assistant</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Agent Status</span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Active 24/7
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold mt-2">
                    Dedicated WhatsApp Agent active on +91 95193 42440
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Lead Response Speed</span>
                    <span className="font-bold text-emerald-400">&lt; 3.5 Seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Qualification Logic</span>
                    <span className="font-bold text-brand-400">Meta Ads Psychology</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Meeting Scheduling</span>
                    <span className="font-bold text-white">Calendar Guard Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <a
                href="https://wa.me/919519342440?text=Hi%20Maya,%20testing%20from%20client%20dashboard!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Live WhatsApp Bot Ping</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
