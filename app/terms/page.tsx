import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | MSR Next Gen',
  description: 'Terms of service and commercial agreement for MSR Next Gen digital growth and AI automation services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 mb-8 px-3 py-1.5 rounded-full bg-surface-100 border border-surface-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-surface-200 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Last Updated: October 2026 • Legal Entity: MSR Next Gen (Founder: Mukul Mishra)
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
            <p className="font-bold mb-1">📌 Regulatory & Owner Notice (TODO_OWNER):</p>
            <p>
              The specific commercial agreement, registered legal entity details, state jurisdiction, and GSTIN are subject to final onboarding documentation provided by MSR Next Gen upon invoice generation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Scope of Services</h2>
            <p>
              MSR Next Gen provides digital performance marketing, creative content production, local search optimization (Google Business Profile), website development, and 24/7 AI WhatsApp automation. Deliverables, timelines, and review cycles are defined per purchased package or approved custom scope.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Payment & Billing Terms</h2>
            <p>
              Payments for one-time setups and recurring service retainers are processed securely via authorized payment gateways (e.g., Razorpay). Third-party advertising budgets (Meta Ads, Google Ads spend) and official WhatsApp messaging fees are separate from agency management fees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Client Responsibilities & Approvals</h2>
            <p>
              Clients agree to provide required brand assets (logos, menus, product photos, business access) in a timely manner. Ad campaigns and public creatives are published only following client review or explicit pre-authorization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Performance & Disclaimer</h2>
            <p>
              Digital marketing performance (leads, sales, walk-ins) depends on regional market demand, client pricing, operational execution, and advertising budget. MSR Next Gen commits to rigorous optimization and transparent reporting but does not guarantee fixed financial ROAS or sales figures.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Governing Law & Contact</h2>
            <p>
              These terms are governed by the laws of India. For any commercial or contractual clarifications, please contact Mukul Mishra at msbestshoopingpro@gmail.com or WhatsApp +91 88875 21156.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
