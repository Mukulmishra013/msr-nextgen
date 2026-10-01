import { BrandClient, ServiceItem, CaseStudyStat } from '@/types';

// ==============================================================================
// 1. WhatsApp & Contact Configuration (Real Brand Details)
// ==============================================================================
export const WHATSAPP_SALES_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER ||
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  '919519342440';

export const CUSTOMER_CARE_NUMBER =
  process.env.NEXT_PUBLIC_CUSTOMER_CARE_NUMBER || '918887521156';

export const BUSINESS_EMAIL =
  process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'msbestshoopingpro@gmail.com';

// Legacy compatibility
export const WHATSAPP_PHONE_RAW = WHATSAPP_SALES_NUMBER;
export const IS_PLACEHOLDER_PHONE = false;

export const DEFAULT_WHATSAPP_MESSAGE = encodeURIComponent(
  'Hi, I want to know more about MSR services for my business.'
);

export function getWhatsAppUrl(customMessage?: string, phoneNumber?: string): string {
  const targetNumber = phoneNumber || WHATSAPP_SALES_NUMBER;
  const message = customMessage ? encodeURIComponent(customMessage) : DEFAULT_WHATSAPP_MESSAGE;
  return `https://wa.me/${targetNumber}?text=${message}`;
}

export function getCustomerCareWhatsAppUrl(customMessage?: string): string {
  const message = encodeURIComponent(
    customMessage || 'Hi MSR Support, I am an existing client and need assistance.'
  );
  return `https://wa.me/${CUSTOMER_CARE_NUMBER}?text=${message}`;
}

// ==============================================================================
// 2. Agency Contact Details & Social Channels
// ==============================================================================
export const AGENCY_CONFIG = {
  name: 'MSR Next Gen',
  tagline: 'Get More Customers For Your Business — Ads & AI That Actually Deliver Results',
  subheadline: 'Built specifically for growing Indian local businesses, retail stores, and ambitious D2C brands.',
  email: BUSINESS_EMAIL,
  salesPhone: WHATSAPP_SALES_NUMBER,
  customerCarePhone: CUSTOMER_CARE_NUMBER,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://msrnextgen.com',
  socials: {
    instagram: 'https://instagram.com/msrnextgen',
    linkedin: 'https://linkedin.com/company/msrnextgen',
    facebook: 'https://facebook.com/msrnextgen',
  },
};

// ==============================================================================
// 3. Flagship Services (Exactly 2 Cards to Reduce Decision Fatigue)
// ==============================================================================
export const FLAGSHIP_SERVICES: ServiceItem[] = [
  {
    id: 'ads-performance',
    title: 'Meta & Google Ads Management',
    tagline: 'We run high-converting ad campaigns that bring real customers, not just clicks.',
    outcomes: [
      'Lower cost per qualified lead through hyper-local precision targeting',
      'Direct WhatsApp and storefront customer footfall campaigns',
      'Continuous creative testing with Reels & high-converting video hooks',
    ],
    icon: 'Megaphone',
    whatsappMessage: 'Hi MSR Next Gen, I want to run high-converting Meta & Google Ads for my business.',
  },
  {
    id: 'ai-whatsapp-agent',
    title: '24/7 AI WhatsApp & Chatbot Agent',
    tagline: 'Smart AI agent that replies to customers instantly, qualifies leads, and books orders automatically.',
    outcomes: [
      'Instant 3-second responses at 2 AM or during peak store rush hours',
      'Automated product catalog sharing, pricing answers & FAQ resolution',
      'Zero lead leakage — hot leads instantly routed to your personal phone',
    ],
    icon: 'Bot',
    whatsappMessage: 'Hi MSR Next Gen, I want to deploy a 24/7 AI WhatsApp Agent for my business.',
  },
];

// ==============================================================================
// 4. Default Managed Brands
// Editable via Admin Dashboard (/admin/dashboard)
// ==============================================================================
export const MANAGED_BRANDS: BrandClient[] = [
  {
    id: 'amparo',
    name: 'Amparo',
    handle: '@amparo.shop.india',
    category: 'D2C Wellness & Skincare',
    url: 'https://www.instagram.com/amparo.shop.india',
    initials: 'AM',
    managedDuration: '1+ Year Client',
  },
  {
    id: 'nacho-g',
    name: 'Nacho G',
    handle: '@nacho_g_gkp',
    category: 'Restaurant & Mexican Cafe',
    url: 'https://www.instagram.com/nacho_g_gkp',
    initials: 'NG',
    managedDuration: '1+ Year Client',
  },
  {
    id: 'dining-venue',
    name: 'Dining Venue',
    handle: '@dining.venue',
    category: 'Fine Dining Restaurant',
    url: 'https://www.instagram.com/dining.venue',
    initials: 'DV',
    managedDuration: '1+ Year Client',
  },
  {
    id: 'the-bunker-cafe',
    name: 'The Bunker Cafe',
    handle: '@thebunkercafe_',
    category: 'Cafe & Rooftop Lounge',
    url: 'https://www.instagram.com/thebunkercafe_',
    initials: 'TB',
    managedDuration: '1+ Year Client',
  },
  {
    id: 'elite-futuristic-school',
    name: 'Elite Futuristic School',
    handle: '@elitefuturisticschool',
    category: 'Modern CBSE Academy',
    url: 'https://www.instagram.com/elitefuturisticschool',
    initials: 'EF',
    managedDuration: '1+ Year Client',
  },
];

// ==============================================================================
// 5. Case Study: Amparo (D2C Wellness Brand)
// Editable via Admin Dashboard (/admin/dashboard)
// ==============================================================================
export const CASE_STUDY_AMPARO = {
  brandName: 'Amparo',
  category: 'D2C Health & Wellness',
  founderOwnership: 'Founder-operated brand with real skin in the game',
  description:
    'Amparo faced high ad fatigue, soaring customer acquisition costs, and frequent RTO (Return to Origin) on COD orders. MSR Next Gen revamped the creative funnel with vernacular UGC reels and connected a WhatsApp AI agent for instant order verification.',
  stats: [
    {
      label: 'ROAS Improvement',
      value: '+340%',
      subtext: 'Across Meta catalog & video ads',
      isPendingVerification: false,
    },
    {
      label: 'RTO Reduction',
      value: '-28%',
      subtext: 'Via instant WhatsApp order confirmation',
      isPendingVerification: false,
    },
    {
      label: 'Monthly Order Growth',
      value: '4.2x',
      subtext: 'Scaled sustainably over 9 months',
      isPendingVerification: false,
    },
  ] as CaseStudyStat[],
  resultsHighlights: [
    'Vernacular video ads with authentic regional hooks drove 3x higher CTR',
    'Instant WhatsApp checkout verification stopped fake orders before dispatch',
    'Automated replenishment reminders brought a 35% repeat purchase rate',
  ],
};
