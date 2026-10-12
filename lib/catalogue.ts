import { FLAGSHIP_PACKAGES, RATE_CARD_SERVICES, FlagshipPackage, RateCardCategory } from '@/data/rateCardData';

export interface VersionedCatalogue {
  version: string;
  currency: string;
  flagships: FlagshipPackage[];
  services: RateCardCategory[];
  policyNotice: string;
}

export interface CatalogueItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  originalAmount?: number;
  priceDetail: string;
  tagline: string;
  highlights: string[];
  popular?: boolean;
  isCustom: boolean;
  billingCycle: 'one-time' | 'monthly' | 'setup';
}

export const CURRENT_CATALOGUE_VERSION = '2026.1';

export const MASTER_CATALOGUE: VersionedCatalogue = {
  version: CURRENT_CATALOGUE_VERSION,
  currency: 'INR',
  flagships: FLAGSHIP_PACKAGES,
  services: RATE_CARD_SERVICES,
  policyNotice: 'Prices are in Indian Rupees (₹). GST and third-party charges (ad spend, SMS/WhatsApp usage, domains) apply as per scope.',
};

// Official checkout items list
export const CHECKOUT_OFFICIAL_PACKAGES: CatalogueItem[] = [
  {
    id: 'business-website',
    name: 'Business Website',
    category: 'Website Launch',
    amount: 14999,
    priceDetail: 'One-time fee • Hosting/domain extra',
    tagline: 'Professional responsive business website, contact forms, essential SEO & analytics',
    highlights: [
      'Custom 5-8 page responsive layout',
      'Contact forms & 1-tap WhatsApp lead capture',
      'Essential On-Page SEO & sitemap setup',
      'Google Analytics & Search Console integration',
      'Ultra-fast load speed (Next.js)',
    ],
    popular: false,
    isCustom: false,
    billingCycle: 'one-time',
  },
  {
    id: 'whatsapp-starter',
    name: 'WhatsApp AI Starter',
    category: 'Automation',
    amount: 14999,
    priceDetail: 'Setup fee • Usage charges extra',
    tagline: '24/7 AI chatbot engine (3s reply), FAQs & lead capture automation',
    highlights: [
      '24/7 Smart AI Auto-Responder (3s reply)',
      'Automated product catalogue & FAQ resolution',
      'Zero lead leakage: Instant hot lead alerts',
      'Continuous prompt tuning & defined handover testing',
      'Integrates directly with official WhatsApp Web / Cloud API',
    ],
    popular: true,
    isCustom: false,
    billingCycle: 'setup',
  },
  {
    id: 'shopify-launch',
    name: 'Shopify Launch Pack',
    category: 'E-Commerce',
    amount: 19999,
    priceDetail: 'One-time fee • Shopify plan extra',
    tagline: 'Complete Shopify store setup, collections, Razorpay & shipping rules',
    highlights: [
      'Complete Shopify theme branding',
      'Product catalogue & category collections',
      'Razorpay & Cash On Delivery (COD) integration',
      'Automated shipping rates & pin-code delivery rules',
      'High-converting mobile checkout',
    ],
    popular: false,
    isCustom: false,
    billingCycle: 'one-time',
  },
  {
    id: 'gbp-growth',
    name: 'GBP Audit & Optimization',
    category: 'Local Business Growth',
    amount: 2999,
    originalAmount: 4999,
    priceDetail: 'One-time fee • Discounted (Was ₹4,999)',
    tagline: 'Google Business Profile audit, keyword optimization and listing boost',
    highlights: [
      'Deep Google Maps & local ranking competitor audit',
      'Primary & secondary category keyword optimization',
      'Geo-tagged photo uploads & complete listing enhancement',
      'Review booster QR code strategy',
      '100% organic local ranking boost',
    ],
    popular: false,
    isCustom: false,
    billingCycle: 'one-time',
  },
  {
    id: 'starter',
    name: 'Starter (Visibility Retainer)',
    category: 'Monthly Retainer',
    amount: 6999,
    priceDetail: '₹2,999 setup + ₹6,999/mo',
    tagline: 'Google Maps SEO + 4 Reels + Reviews QR & WhatsApp + Monthly Report',
    highlights: ['Google Maps SEO', '4 Reels/mo', 'Reviews QR Booster', 'Monthly Performance Report'],
    popular: false,
    isCustom: false,
    billingCycle: 'monthly',
  },
  {
    id: 'growth',
    name: 'Growth (Customer Magnet)',
    category: 'Monthly Retainer',
    amount: 14999,
    priceDetail: '₹4,999 setup + ₹14,999/mo',
    tagline: 'Local Meta & Google Ads + 8 Reels + 24/7 AI WhatsApp Inquiry Bot + Win-Back CRM',
    highlights: ['Local Ads Management', '8 High-Impact Reels', '24/7 AI WhatsApp Bot', 'Win-Back CRM'],
    popular: false,
    isCustom: false,
    billingCycle: 'monthly',
  },
  {
    id: 'premium',
    name: 'Premium (Full VIP Retainer)',
    category: 'Monthly Retainer',
    amount: 24999,
    priceDetail: '₹9,999 setup + ₹24,999/mo',
    tagline: 'Growth + 12 Reels + Video Shoot + Custom Landing Page + AI Calling Agent + Dedicated Manager',
    highlights: ['12 Reels + Shoot', 'Custom Landing Page', 'AI Calling Agent', 'Dedicated Account Manager'],
    popular: false,
    isCustom: false,
    billingCycle: 'monthly',
  },
];

/**
 * Server-verified package lookup helper
 */
export function getPackageById(packageId: string): CatalogueItem | null {
  // Check official checkout packages first
  const pkg = CHECKOUT_OFFICIAL_PACKAGES.find((p) => p.id === packageId);
  if (pkg) {
    return pkg;
  }

  // Check 11-services for quote routing
  const service = MASTER_CATALOGUE.services.find((s) => s.id === packageId);
  if (service) {
    return {
      id: service.id,
      name: service.title,
      category: service.categoryGroup,
      amount: 0,
      priceDetail: service.priceRange,
      tagline: service.notes,
      highlights: service.tiers.map((t) => `${t.name}: ${t.price} — ${t.desc}`),
      isCustom: true,
      billingCycle: service.billingType.toLowerCase().includes('month') ? 'monthly' : 'one-time',
    };
  }

  return null;
}

/**
 * Returns formatted pricing text for AI assistant consumption
 */
export function getCataloguePromptSummary(): string {
  const flagshipText = MASTER_CATALOGUE.flagships
    .map((f) => `• ${f.title} (${f.category}): ₹${f.amount.toLocaleString('en-IN')} (${f.priceDetail})`)
    .join('\n');

  const servicesText = MASTER_CATALOGUE.services
    .map((s) => `• ${s.title}: ${s.priceRange} (${s.billingType})`)
    .join('\n');

  return `OFFICIAL VERIFIED PRICING CATALOGUE (VERSION ${MASTER_CATALOGUE.version}):\n\nFLAGSHIP BUNDLES:\n${flagshipText}\n\n11 CORE SERVICES (RATE CARD):\n${servicesText}\n\nRULES: Never invent custom discounts, taxes, or refund guarantees. If a customer asks for a custom quote or policy not listed here, say that confirmation is pending with founder Mukul Mishra (+91 88875 21156).`;
}
