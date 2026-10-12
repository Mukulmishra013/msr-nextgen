'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { CHECKOUT_OFFICIAL_PACKAGES, getPackageById } from '@/lib/catalogue';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: string;
}

// Fixed-scope packages available for instant gateway checkout
const CHECKOUT_PACKAGES = CHECKOUT_OFFICIAL_PACKAGES.filter((p) => !p.isCustom);

export default function CheckoutModal({ isOpen, onClose, defaultPackageId = 'whatsapp-starter' }: CheckoutModalProps) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState<string>(defaultPackageId);
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Gym & Fitness Center');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (defaultPackageId) {
      setSelectedPkg(defaultPackageId);
    }
  }, [defaultPackageId, isOpen]);

  // Accessibility: Close on Escape key & manage body scroll / widget visibility
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('checkout-modal-open');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('checkout-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePackage = getPackageById(selectedPkg) || CHECKOUT_PACKAGES[0];

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
          handler: async function (response: any) {
            setLoading(true);
            try {
              // Server-side cryptographic signature & payment verification
              const verifyRes = await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  paymentId: response.razorpay_payment_id || '',
                  signature: response.razorpay_signature || '',
                  packageId: selectedPkg,
                  packageName: activePackage.name,
                  amount: activePackage.amount,
                  clientPhone,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                router.push(
                  `/onboarding?token=${encodeURIComponent(verifyData.onboardingToken || '')}&orderId=${encodeURIComponent(orderData.orderId)}&phone=${encodeURIComponent(clientPhone)}`
                );
              } else {
                setErrorMsg(verifyData.error || 'Payment verification failed on server.');
                setLoading(false);
              }
            } catch (err: any) {
              setErrorMsg('Payment verification network error. Please contact Mukul sir (+91 88875 21156).');
              setLoading(false);
            }
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-800">
              Instant Service Activation
            </span>
            <h2 id="checkout-modal-title" className="text-xl sm:text-2xl font-extrabold mt-2">
              Choose Growth Package
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {CHECKOUT_PACKAGES.map((pkg) => {
                const isSelected = selectedPkg === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 right-2.5 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">{pkg.category}</div>
                    <div className="font-bold text-xs text-slate-900 leading-tight mt-0.5">{pkg.name}</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      {pkg.originalAmount && (
                        <span className="text-xs text-slate-400 line-through font-semibold">₹{pkg.originalAmount.toLocaleString('en-IN')}</span>
                      )}
                      <span className="text-sm font-extrabold text-brand-700">₹{pkg.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({pkg.billingCycle === 'monthly' ? '/mo' : pkg.billingCycle === 'setup' ? 'setup' : 'one-time'})
                      </span>
                    </div>
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
                <option value="Gym & Fitness Center">Gym & Fitness Center</option>
                <option value="Salon & Spa">Salon & Spa</option>
                <option value="Clinic & Hospital">Clinic & Hospital</option>
                <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                <option value="Coaching & Institute">Coaching & Institute</option>
                <option value="Real Estate">Real Estate</option>
                <option value="D2C Brand / Retail Store">D2C Brand / Retail Store</option>
              </select>
            </div>

            {/* Price Summary & Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Payable</div>
                <div className="text-xl font-black text-slate-900">
                  ₹{activePackage.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 sm:px-6 py-3 rounded-xl shadow-md transition-all disabled:opacity-50 text-sm shrink-0"
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
          <span>
            Encrypted Gateway Checkout • {activePackage.billingCycle === 'monthly' ? 'Monthly Renewal • No Lock-in' : 'One-time Payment • Zero Hidden Fees'}
          </span>
        </div>
      </div>
    </div>
  );
}
