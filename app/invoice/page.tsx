'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

function InvoiceView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const paymentId = searchParams.get('paymentId') || 'pay_' + Math.random().toString(36).substring(7);
  const clientName = searchParams.get('name') || 'Valued Business Partner';
  const clientPhone = searchParams.get('phone') || '+91 8887521156';
  const businessName = searchParams.get('business') || 'Your Business';
  const packageName = searchParams.get('package') || 'Growth (Customer Magnet Package)';
  const amount = Number(searchParams.get('amount') || 14999);

  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Brand Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-brand-500/30">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-black text-xl text-white shadow-md">
                M
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                MSR NEXT GEN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Performance Marketing & 24/7 AI WhatsApp Automation
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Uttar Pradesh & Delhi NCR, India • msbestshoopingpro@gmail.com
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full mb-2">
              Payment Confirmed • Official Receipt
            </span>
            <div className="text-xs text-slate-400 font-medium">Receipt No: #{orderId}</div>
            <div className="text-xs text-slate-400 font-medium">Date: {currentDate}</div>
          </div>
        </div>

        {/* Client & Billing Info */}
        <div className="p-6 sm:p-10 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-50/50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Billed To (Client Details):
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{businessName}</h3>
            <p className="text-sm text-slate-600 font-medium">Owner / Contact: {clientName}</p>
            <p className="text-sm text-slate-600 font-medium">Phone: {clientPhone}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Payment Summary:
            </span>
            <div className="text-sm font-semibold text-slate-800 mt-1">
              Method: Razorpay Encrypted Gateway
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Txn ID: {paymentId}</div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paid & Verified</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6 sm:p-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3">Service / Package Description</th>
                <th className="py-3 text-center">Term</th>
                <th className="py-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-4 font-bold text-slate-900">
                  {packageName}
                  <p className="text-xs font-normal text-slate-500 mt-0.5">
                    Includes 24/7 AI WhatsApp bot deployment, hyper-local ads management, creative reels scripts, and priority support.
                  </p>
                </td>
                <td className="py-4 text-center text-slate-600 font-medium">1 Month</td>
                <td className="py-4 text-right font-black text-slate-900">
                  ₹{amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total Summary */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col items-end">
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Processing:</span>
                <span className="font-semibold text-emerald-600">₹0 (Inclusive)</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="text-brand-700">₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee & Terms */}
        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Authorized Digital Receipt issued by MSR Next Gen.</span>
          </div>

          <div className="text-right">
            <span>Support: +91 88875 21156 • Founder: Mukul Mishra</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-600 font-medium">Loading receipt...</div>}>
      <InvoiceView />
    </Suspense>
  );
}
