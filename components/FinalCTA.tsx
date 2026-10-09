'use client';

import React, { useState } from 'react';
import { getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { MessageCircle, Send, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function FinalCTA() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    honeypot: '', // Anti-spam hidden honeypot
  });
  const [formStartedAt] = useState<number>(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const finalWaUrl = getWhatsAppUrl('Hi MSR Next Gen, I would like to explore your ads and AI agent services for my business.');

  const handleWhatsAppFinalClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent('whatsapp_click', { source: 'final_cta' });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
      return;
    }
    try {
      if (typeof window !== 'undefined' && !e.defaultPrevented) {
        window.open(finalWaUrl, '_blank');
        e.preventDefault();
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    trackEvent('lead_form_submit', { status: 'started' });

    // Client-side quick 10-digit Indian phone check
    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|91|0)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setLoading(false);
      setErrorMsg('Please enter a valid 10-digit Indian phone number (e.g. 9876543210).');
      trackEvent('lead_form_submit', { status: 'error', error: 'invalid_phone' });
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          businessName: formData.businessName,
          phone: formData.phone,
          honeypot: formData.honeypot,
          submittedAt: String(formStartedAt),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        trackEvent('lead_form_submit', { status: 'success' });
        showToast({
          message: 'Inquiry received! Our team will contact you via WhatsApp shortly.',
          type: 'success',
        });
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please reach us via WhatsApp directly.');
        trackEvent('lead_form_submit', { status: 'error', error: data.error });
      }
    } catch {
      setErrorMsg('Unable to submit right now. Please connect with us directly on WhatsApp.');
      trackEvent('lead_form_submit', { status: 'error', error: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full py-16 sm:py-24 bg-gradient-to-b from-white to-surface-100 border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full">
            Fastest Path to Growth
          </span>
          <h2 className="text-3xl xs:text-4xl sm:text-5xl tv:text-6xl font-black text-slate-900 tracking-tight mt-3 mb-4">
            Ready to Get More Paying Customers?
          </h2>
          <p className="text-base sm:text-lg tv:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Skip the endless agency pitches. Send us a quick WhatsApp message and let&apos;s review your current ads and customer response funnel today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-center">
          
          {/* PRIMARY PATH: WhatsApp Direct Card (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col justify-between">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Primary & Instant Response Channel</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                Chat Directly With Us on WhatsApp
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                Get an honest, straight-to-the-point assessment of your ads, creative hooks, and customer conversion. We typically reply in under 15 minutes during business hours.
              </p>
            </div>

            <div>
              <a
                href={finalWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppFinalClick}
                className="w-full inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-lg sm:text-xl px-8 py-4.5 rounded-2xl shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 fill-slate-950 shrink-0" />
                <span>WhatsApp Us Now</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <p className="text-center text-xs text-slate-400 mt-4">
                No obligations • Free 20-min strategy audit for your brand
              </p>
            </div>
          </div>

          {/* BACKUP PATH: Simple Lead Capture Form (5 cols on desktop) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
            
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Backup Inquiries
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-1">
                Prefer Us to Call You?
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Leave your business details and our team will get in touch.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-chat-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h5 className="font-extrabold text-emerald-950 text-base">Inquiry Submitted!</h5>
                <p className="text-xs text-emerald-800">
                  Thank you! We will reach out on your mobile/WhatsApp number shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', businessName: '', phone: '', honeypot: '' });
                  }}
                  className="text-xs font-bold text-emerald-700 underline pt-1"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Invisible Anti-Spam Honeypot Field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="_gotcha">Leave this empty</label>
                  <input
                    type="text"
                    id="_gotcha"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  />
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Business Name Field */}
                <div>
                  <label htmlFor="businessName" className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Store Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    required
                    placeholder="e.g. Jaipur Sweets / Amparo D2C"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                    {errorMsg}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-brand-700 active:scale-98 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request a Callback</span>
                    </>
                  )}
                </button>

                {/* DPDP Act Compliant Consent Line */}
                <p className="text-[11px] text-slate-500 leading-tight pt-1 text-center">
                  🔒 By submitting, you consent to MSR Next Gen contacting you via WhatsApp/phone regarding your business inquiry. No spam, ever.
                </p>

              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
