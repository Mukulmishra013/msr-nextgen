'use client';

import React, { useState } from 'react';
import { FLAGSHIP_SERVICES, getWhatsAppUrl, IS_PLACEHOLDER_PHONE } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { useToast } from '@/components/Toast';
import { Megaphone, Bot, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';

export default function Services() {
  const { showToast } = useToast();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleServiceClick = (serviceId: string, whatsappMessage: string) => {
    trackEvent('whatsapp_click', { source: `services_${serviceId}`, service: serviceId });
    if (IS_PLACEHOLDER_PHONE) {
      showToast({
        message: 'Dev Notice: WhatsApp number is currently set to placeholder (+910000000000). Replace with real number in .env or lib/config.ts',
        type: 'warning',
      });
    }
  };

  return (
    <section id="services" className="w-full py-16 sm:py-24 bg-surface-100 border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-full">
            Our Two Flagship Pillars
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl tv:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
            Laser-Focused Growth Solutions
          </h2>
          <p className="text-sm sm:text-base md:text-lg tv:text-xl text-slate-600">
            We don’t overwhelm you with 20 complicated services. We master the two highest-ROI growth drivers for Indian businesses: generating real buyer demand and converting them instantly on WhatsApp.
          </p>
        </div>

        {/* 2 Flagship Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {FLAGSHIP_SERVICES.map((service, index) => {
            const isAds = service.id === 'ads-performance';
            return (
              <div
                key={service.id}
                className="flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
              >
                {/* Accent top gradient bar */}
                <div
                  className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-full ${
                    isAds
                      ? 'bg-gradient-to-r from-brand-600 to-emerald-500'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                  }`}
                />

                <div>
                  {/* Icon Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-700 group-hover:scale-105 transition-transform">
                      {isAds ? (
                        <Megaphone className="w-7 h-7 text-brand-600" />
                      ) : (
                        <Bot className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                        Flagship 0{index + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl tv:text-3xl font-bold text-slate-900 leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-base sm:text-lg tv:text-xl font-medium text-slate-700 mb-6">
                    {service.tagline}
                  </p>

                  {/* 3 Outcome Bullets */}
                  <div className="space-y-3.5 mb-8">
                    {service.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base tv:text-lg text-slate-600 font-normal leading-snug">
                          {outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTAs: 1-Click Activate OR WhatsApp Chat */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent('checkout_modal_open', { service: service.id });
                      setShowCheckout(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base px-5 py-3 rounded-xl sm:rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-600"
                  >
                    <span>Instant Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getWhatsAppUrl(service.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleServiceClick(service.id, service.whatsappMessage)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base px-5 py-3 rounded-xl sm:rounded-2xl transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Catalog Subtext */}
        <div className="text-center mt-10">
          <p className="text-xs sm:text-sm tv:text-base text-slate-500 font-medium">
            💡 Full custom digital marketing, branding & creative reels production are available on request.
          </p>
        </div>
      </div>

      {/* 1-Click Instant Activation Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </section>
  );
}
