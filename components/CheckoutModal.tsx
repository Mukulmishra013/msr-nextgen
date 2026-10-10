'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, CheckCircle2, Loader2, Sparkles, CreditCard, Lock } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: 'starter' | 'growth' | 'premium';
}

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter (Visibility)',
    amount: 6999,
    setupFee: 2999,
    highlights: ['Google Maps SEO + 4 Reels', 'Reviews Booster QR + WhatsApp', 'Monthly Report'],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth (Customer Magnet)',
    amount: 14999,
    setupFee: 4999,
    highlights: ['Local Meta & Google Ads', '8 High-Impact Reels', '24/7 AI WhatsApp Inquiry Bot', 'Loyalty & Win-Back Offers'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium (Full Automation VIP)',
    amount: 24999,
    setupFee: 9999,
    highlights: ['Growth + 12 Reels + Shoot', 'Custom Web / Booking Page', 'AI Calling Agent + Dedicated Manager'],
    popular: false,
  },
];

export default function CheckoutModal({ isOpen, onClose, defaultPackageId = 'growth' }: CheckoutModalProps) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState<string>(defaultPackageId);
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Gym & Fitness');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const activePackage = PACKAGES.find((p) => p.id === selectedPkg) || PACKAGES[1];

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientPhone || clientPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Server-Side Order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg,
          clientPhone,
          clientName,
          businessCategory,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate order');
      }

      // 2. Ensure Razorpay Checkout script is loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && (window as any).Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MSR Next Gen',
          description: orderData.packageName,
          order_id: orderData.orderId.startsWith('order_') ? orderData.orderId : undefined,
          prefill: {
            name: clientName,
            contact: clientPhone,
          },
          theme: { color: '#0f172a' },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
          handler: function (response: any) {
            // Redirect to verified onboarding ONLY after payment is completed
            router.push(`/onboarding?orderId=${orderData.orderId}&paymentId=${response.razorpay_payment_id || ''}&phone=${clientPhone}`);
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMsg(resp.error?.description || 'Payment Failed. Please try another method.');
          setLoading(false);
        });
        rzp.open();
      } else {
        setErrorMsg('Razorpay payment gateway load nahi ho paya. Kripya refresh karein.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-800">
              Instant Service Activation
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2">Choose Growth Package</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Package Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPkg === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="font-bold text-xs text-slate-900 leading-tight">{pkg.name}</div>
                    <div className="text-base font-extrabold text-brand-700 mt-1">₹{pkg.amount.toLocaleString('en-IN')}<span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Package Deliverables Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Deliverables Included:
            </div>
            <div className="space-y-1.5">
              {activePackage.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handlePayNow} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Business Niche
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 font-medium"
              >
                <option value="Gym & Fitness">Gym & Fitness Center</option>
                <option value="Salon & Spa">Salon & Spa</option>
                <option value="Clinic & Healthcare">Clinic & Hospital</option>
                <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                <option value="Coaching & Education">Coaching & Institute</option>
                <option value="Real Estate">Real Estate</option>
                <option value="D2C & Retail">D2C Brand / Retail Store</option>
              </select>
            </div>

            {/* Price Summary & Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Payable</div>
                <div className="text-xl font-black text-slate-900">
                  ₹{activePackage.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay & Onboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Gateway Checkout • No Commitment • Monthly Renewal</span>
        </div>
      </div>
    </div>
  );
}
