import { AnalyticsEvent } from '@/types';

/**
 * Unified Analytics Dispatcher for MSR Next Gen
 * Tracks key conversion funnel actions:
 * - WhatsApp button clicks with source location
 * - Lead form submissions (started, success, error)
 * - Brand profile outbound clicks
 * - Case study views
 */
export function trackEvent(name: AnalyticsEvent['name'], properties: Record<string, unknown> = {}): void {
  // Always log to console in development for transparent debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics Event: ${name}]`, properties);
  }

  try {
    // 1. Google Analytics (gtag.js) if present in window
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      (window as unknown as { gtag: Function }).gtag('event', name, properties);
    }

    // 2. Custom dataLayer push if GTM or custom setup is present
    if (typeof window !== 'undefined' && Array.isArray((window as unknown as { dataLayer?: unknown[] }).dataLayer)) {
      (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
        event: name,
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
}
