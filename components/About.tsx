'use client';

import React from 'react';
import { UserCheck, ShieldCheck, Flame, Briefcase, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="w-full py-16 sm:py-24 bg-surface-100 border-b border-surface-200">
      <div className="max-w-7xl tv:max-w-tv-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-sm">
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Founder Avatar / Credibility Emblem */}
            {/* TODO: Client to provide founder photo if desired */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-700 p-1 shadow-md">
                <div className="w-full h-full rounded-[22px] bg-white flex flex-col items-center justify-center text-center p-3">
                  <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-brand-600 mb-1" />
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">
                    MSR Founder
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold">
                    D2C Operator
                  </span>
                </div>
              </div>
              <span className="mt-3 text-xs font-semibold text-slate-500">
                Founder-Led Execution
              </span>
            </div>

            {/* Narrative & Credibility Copy */}
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200/60">
                <Flame className="w-3.5 h-3.5 text-brand-600" />
                <span>Why We Are Different</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                We Don&apos;t Just Give Advice — We Run Real Businesses Every Day
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed font-normal">
                Unlike typical agencies that hide behind vanity metrics and hollow jargon, our founder actively builds and scales a real Indian D2C brand (<span className="font-bold text-brand-700">Amparo</span>). We experience firsthand the pressure of rising ad costs, inventory velocity, and cash flow.
              </p>

              <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed font-normal">
                Over the past year, MSR Next Gen has taken complete ownership of social media, daily reels, creative production, and ad funnels for 5+ thriving brands across food, restaurant, education, and wellness. We treat your ad budget as if it were our own.
              </p>

              {/* Credibility Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real Skin in the Game</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>5+ Brands Managed 1+ Year</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Transparent ROI Focus</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
