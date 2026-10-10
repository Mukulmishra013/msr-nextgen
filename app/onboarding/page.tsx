'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CheckCircle2,
  Building2,
  Phone,
  Instagram,
  MapPin,
  FileText,
  Send,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

function OnboardingForm() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const prefillPhone = searchParams.get('phone') || '';

  const [clientPhone, setClientPhone] = useState(prefillPhone);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Gym & Fitness');
  const [address, setAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [menuOrServicesDoc, setMenuOrServicesDoc] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!clientPhone || !businessName) {
      setErrorMsg('Kripya apna WhatsApp number aur Business Name bharein.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          clientPhone,
          businessName,
          businessType,
          address,
          googleMapsLink,
          instagramHandle,
          managerPhone,
          menuOrServicesDoc,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Submission me problem aayi. Dobara try karein.');
      }
    } catch {
      setErrorMsg('Network error. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-emerald-200 shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Onboarding Details Received! 🎉
        </h2>
        <p className="text-slate-600 text-base mb-6">
          Aapki business profile securely save ho gayi hai. Hamari team (Mukul Mishra & Maya AI) aapka customized setup shuru kar chuki hai.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200 mb-8 space-y-3">
          <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
            <span>Step 1: Setup & Asset Preparation (Underway)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs">2</span>
            <span>Step 2: Quality Testing & Founder Review</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs">3</span>
            <span>Step 3: Official Go-Live on WhatsApp & Google</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`/invoice?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(clientPhone)}&business=${encodeURIComponent(businessName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>View & Download Official Receipt</span>
          </a>

          <a
            href={`https://wa.me/918887521156?text=Namaste%20Mukul%20sir,%20maine%20onboarding%20form%20submit%20kar%20diya%20hai%20(${encodeURIComponent(businessName)})`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl transition-all text-sm"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Notify Mukul Sir on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Step 2: Business Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
            Apne Business Ki Details Share Karein
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Sirf 2 minute lagte hain. Iske baad aapka automated marketing & AI WhatsApp engine setup ho jayega.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Business Category *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium"
              >
                <option value="Gym & Fitness">Gym & Fitness Center</option>
                <option value="Salon & Spa">Salon & Spa / Beauty Clinic</option>
                <option value="Clinic & Healthcare">Clinic & Hospital / Doctor</option>
                <option value="Restaurant & Cafe">Restaurant, Cafe & Cloud Kitchen</option>
                <option value="Coaching & Education">Coaching / Training Institute</option>
                <option value="Real Estate">Real Estate & Property</option>
                <option value="D2C & E-Commerce">D2C Brand / Retail Store</option>
                <option value="Other Business">Other Local Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Business Name *
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. FitZone Gym / Glamour Salon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Owner WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Manager / Staff WhatsApp (Optional)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="Lead alert recipient number"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Instagram Profile / Handle
              </label>
              <div className="relative">
                <Instagram className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. @yourbusiness"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Google Maps Profile Link (Optional)
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Services List / Menu / Special Offers
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                placeholder="Aapke main services, pricing, ya special packages jo AI aur ads me promote karne hain..."
                value={menuOrServicesDoc}
                onChange={(e) => setMenuOrServicesDoc(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 text-slate-900 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Secure & Confidential</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-100">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center">Loading onboarding form...</div>}>
          <OnboardingForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
