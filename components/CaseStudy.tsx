'use client';

import React, { useState, useEffect } from 'react';
import { CASE_STUDY_AMPARO, getWhatsAppUrl } from '@/lib/config';
import { CaseStudyStat } from '@/types';
import { trackEvent } from '@/lib/analytics';
import { TrendingUp, CheckCircle, MessageCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function CaseStudy() {
  const [stats, setStats] = useState<CaseStudyStat[]>(CASE_STUDY_AMPARO.stats);

  useEffect(() => {
    // Dynamic fetch from Firestore with fallback to default config
    fetch('/api/admin/case-study')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats?.length > 0) {
          setStats(data.stats);
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  const handleWhatsAppCaseClick = () => {
    trackEvent('whatsapp_click', { source: 'case_study_amparo' });
  };

  return (
    <section id="case-study" className="w-full py-16 sm:py-24 bg-surface-100 border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/60 px-3 py-1 rounded-full">
            Featured Case Study
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl tv:text-5xl font-black text-slate-900 tracking-tight mt-3 mb-3">
            How We Scaled Amparo (D2C Wellness)
          </h2>
          <p className="text-sm sm:text-base md:text-lg tv:text-xl text-slate-600 font-medium">
            {CASE_STUDY_AMPARO.founderOwnership} — tackling real operational bottlenecks with high-converting ads and automated WhatsApp lead qualification.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm max-w-5xl mx-auto mb-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Story Column */}
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>The Challenge & Strategy</span>
              </div>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                {CASE_STUDY_AMPARO.description}
              </p>

              {/* Execution Highlights */}
              <div className="space-y-3 pt-2">
                {CASE_STUDY_AMPARO.resultsHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-slate-600 font-medium">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="w-full lg:w-72 bg-surface-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Strategy Blueprint</span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1 mb-2">
                  Want the exact playbook for your business?
                </h4>
                <p className="text-xs text-slate-600 mb-4">
                  We customize the ads creative hooks and WhatsApp automation specifically for your category.
                </p>
              </div>
              <a
                href={getWhatsAppUrl('Hi MSR Next Gen, I saw the Amparo case study and want a custom growth plan for my business.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppCaseClick}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Discuss On WhatsApp</span>
              </a>
            </div>

          </div>
        </div>

        {/* 3 Outcome Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-brand-500 transition-colors"
            >

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl sm:text-5xl tv:text-6xl font-black text-brand-600 tracking-tight">
                  {stat.value}
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug mb-1">
                {stat.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
