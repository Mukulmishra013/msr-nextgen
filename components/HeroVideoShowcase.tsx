'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize2, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function HeroVideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-pause video when scrolled far off screen to save battery & CPU
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (video.paused && isPlaying) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    trackEvent('video_toggle_mute', { muted: nextMuted });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      trackEvent('video_play', { source: 'hero_showcase' });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      trackEvent('video_pause', { source: 'hero_showcase' });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="w-full mt-10 sm:mt-14 max-w-5xl mx-auto px-2 sm:px-0">
      {/* Glow Backdrop */}
      <div className="relative group">
        <div className="absolute -inset-1 sm:-inset-2 rounded-3xl bg-gradient-to-r from-brand-500/25 via-emerald-500/30 to-teal-500/25 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Video Player Card Frame */}
        <div
          ref={containerRef}
          className="relative bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-md"
        >
          {/* Top Glass Mockup Header */}
          <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-950/90 border-b border-slate-800/90 select-none">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Architecture Title Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[200px] xs:max-w-none">
                MSR NEXT GEN • Live Growth Architecture
              </span>
            </div>

            {/* Controls Toolbar (Mute, Play/Pause, Fullscreen) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={togglePlay}
                title={isPlaying ? 'Pause Video' : 'Play Video'}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title="Fullscreen"
                className="hidden xs:inline-flex p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 active:scale-95"
                aria-label="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Video Viewport */}
          <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              src="/videos/msr-growth-showcase.mp4"
              poster="/videos/msr-growth-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIsLoaded(true)}
              className="w-full h-full object-cover select-none"
            />

            {/* Subtle Gradient Overlay on Bottom edge */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />

            {/* Tap to Unmute / Play Prompt on Mobile */}
            {isMuted && (
              <button
                type="button"
                onClick={toggleMute}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 backdrop-blur-md border border-slate-700 text-white text-xs font-semibold shadow-lg transition-transform active:scale-95"
              >
                <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tap for Sound</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Step Flow Highlights Below Video */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-black text-sm shrink-0 border border-brand-200/60">
            01
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Traffic Ingress</span>
            <span className="text-[11px] text-slate-500">High-converting Meta & Google Ads</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200/60">
            05
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Conversion Workflow</span>
            <span className="text-[11px] text-slate-500">Instant AI Chat, Booking & Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-sm shrink-0 border border-teal-200/60">
            08
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Automated Growth</span>
            <span className="text-[11px] text-slate-500">Real-time CRM Sync & WhatsApp Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
