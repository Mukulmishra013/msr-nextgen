import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Admin Command Center | MSR Next Gen',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black text-white">
              M
            </div>
            <div>
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                MSR NEXT GEN
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-brand-900/80 text-brand-300 font-semibold border border-brand-700/50">
                Solo Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
