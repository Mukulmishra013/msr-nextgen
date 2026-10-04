'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';

export default function ScrollRocket3D() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  const lastScrollY = useRef(0);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(currentScrollY / docHeight, 0), 1) : 0;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollProgress(progress);
          setIsVisible(currentScrollY > 150);

          if (Math.abs(currentScrollY - lastScrollY.current) > 3) {
            if (currentScrollY > lastScrollY.current) {
              setScrollDirection('down');
            } else {
              setScrollDirection('up');
            }

            if (idleTimeout.current) clearTimeout(idleTimeout.current);
            idleTimeout.current = setTimeout(() => {
              setScrollDirection('idle');
            }, 600);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, []);

  const handleLaunchToTop = () => {
    setIsBoosting(true);
    setScrollDirection('up');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setIsBoosting(false);
    }, 1200);
  };

  if (!isVisible && !isBoosting) return null;

  // Calculate rocket vertical travel range on the screen
  // Travel between 15% and 80% of the viewport height to avoid overlapping header and bottom bars
  const topPercent = 15 + scrollProgress * 64;

  // Rotation based on scroll direction
  // Down: Rotates 180deg (facing down, flame on top)
  // Up: Rotates 0deg (facing up, flame on bottom)
  // Idle: Tilts slightly (-15deg) in hover mode
  const rotationDeg = isBoosting
    ? 0
    : scrollDirection === 'down'
    ? 180
    : scrollDirection === 'up'
    ? 0
    : -12;

  return (
    <div
      className="fixed right-2 sm:right-6 z-40 pointer-events-none transition-opacity duration-500 block"
      style={{
        top: `${topPercent}vh`,
        transform: 'translateY(-50%)',
      }}
      aria-label="3D Scroll Rocket Progress"
    >
      {/* Flight Altitude Track Indicator */}
      <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 pointer-events-auto">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold backdrop-blur-md border shadow-lg transition-all duration-300 ${
            isHovered || isBoosting
              ? 'bg-slate-900 text-emerald-300 border-emerald-500 scale-105'
              : 'bg-white/90 text-slate-700 border-slate-200/90 shadow-emerald-500/10'
          }`}
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{Math.round(scrollProgress * 100)}%</span>
          <span className="hidden sm:inline text-[9px] uppercase tracking-wider text-slate-400">Orbit</span>
        </div>
      </div>

      {/* 3D Rocket Container */}
      <button
        onClick={handleLaunchToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="MSR Growth Rocket • Click to Launch to Top!"
        className="relative group pointer-events-auto cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40 rounded-full p-1 sm:p-2 transition-transform duration-300 active:scale-95 touch-manipulation"
        style={{
          transform: `rotate(${rotationDeg}deg) scale(${isBoosting ? 1.3 : isHovered ? 1.15 : 1})`,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Glow halo behind rocket */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${
            isBoosting
              ? 'bg-amber-400/80 opacity-100 scale-150'
              : scrollDirection !== 'idle'
              ? 'bg-emerald-400/50 opacity-90 scale-125'
              : 'bg-emerald-500/20 opacity-40'
          }`}
        />

        {/* 3D SVG Rocket Artwork */}
        <div className="relative w-10 h-14 sm:w-14 sm:h-20 drop-shadow-2xl">
          <svg
            viewBox="0 0 64 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(15,110,86,0.35)]"
          >
            {/* Defs for realistic 3D gradients */}
            <defs>
              {/* Metallic Body Gradient */}
              <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#F1F5F9" />
                <stop offset="85%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Agency Brand Nosecone Gradient */}
              <linearGradient id="rocketNose" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#0F6E56" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>

              {/* Wings Gradient */}
              <linearGradient id="rocketWings" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="60%" stopColor="#0F6E56" />
                <stop offset="100%" stopColor="#042F2E" />
              </linearGradient>

              {/* Cockpit Glass Gradient */}
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="40%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>

              {/* Fire Flame Outer */}
              <linearGradient id="flameOuter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="40%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Fire Flame Core */}
              <linearGradient id="flameCore" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FDE047" />
                <stop offset="80%" stopColor="#F97316" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Left Wing */}
            <path
              d="M18 52 L6 68 C4 72 8 76 14 74 L22 66 Z"
              fill="url(#rocketWings)"
              stroke="#042F2E"
              strokeWidth="1"
            />
            {/* Right Wing */}
            <path
              d="M46 52 L58 68 C60 72 56 76 50 74 L42 66 Z"
              fill="url(#rocketWings)"
              stroke="#042F2E"
              strokeWidth="1"
            />

            {/* Main Rocket Fuselage Body */}
            <path
              d="M32 8 C22 18 18 36 18 64 C18 67 22 69 32 69 C42 69 46 67 46 64 C46 36 42 18 32 8 Z"
              fill="url(#rocketBody)"
              stroke="#94A3B8"
              strokeWidth="1"
            />

            {/* Nosecone Tip (MSR Emerald Brand Color) */}
            <path
              d="M32 8 C27 15 23 23 22 28 C28 30 36 30 42 28 C41 23 37 15 32 8 Z"
              fill="url(#rocketNose)"
            />

            {/* Center Fin (3D Spine) */}
            <path
              d="M31 32 L33 32 L34 68 L30 68 Z"
              fill="#0F6E56"
              opacity="0.85"
            />

            {/* Cockpit Window Porthole */}
            <circle cx="32" cy="40" r="7.5" fill="#0F172A" />
            <circle cx="32" cy="40" r="6" fill="url(#glassGradient)" />
            {/* Window Light Reflection */}
            <ellipse cx="30" cy="38" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.8" transform="rotate(-30 30 38)" />

            {/* Rocket Exhaust Nozzle */}
            <path
              d="M26 69 L24 74 L40 74 L38 69 Z"
              fill="#334155"
              stroke="#1E293B"
              strokeWidth="1"
            />

            {/* Dynamic Animated Rocket Thruster Flame */}
            {(scrollDirection !== 'idle' || isBoosting) && (
              <g className="animate-pulse">
                {/* Outer Flame */}
                <path
                  d={`M25 74 Q32 ${isBoosting ? '106' : scrollDirection === 'down' ? '92' : '98'} 39 74 Q32 80 25 74 Z`}
                  fill="url(#flameOuter)"
                  opacity="0.95"
                />
                {/* Inner Core Jet */}
                <path
                  d={`M28 74 Q32 ${isBoosting ? '98' : '88'} 36 74 Q32 77 28 74 Z`}
                  fill="url(#flameCore)"
                />
                {/* Spark particles */}
                <circle cx="32" cy={isBoosting ? "96" : "84"} r="1.5" fill="#FEF08A" />
                <circle cx="29" cy={isBoosting ? "90" : "80"} r="1" fill="#FEF08A" />
                <circle cx="35" cy={isBoosting ? "92" : "82"} r="1" fill="#FEF08A" />
              </g>
            )}

            {/* Idle Hover Spark */}
            {scrollDirection === 'idle' && !isBoosting && (
              <path
                d="M28 74 Q32 80 36 74 Z"
                fill="#F59E0B"
                opacity="0.75"
              />
            )}
          </svg>
        </div>

        {/* Hover / Boost Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-1.5">
          <ArrowUp className="w-3 h-3 text-emerald-400" />
          <span>Click to Boost to Top</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>
      </button>
    </div>
  );
}
