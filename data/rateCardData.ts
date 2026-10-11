export interface FlagshipPackage {
  id: string;
  category: string;
  title: string;
  amount: number;
  originalAmount?: number;
  tagline: string;
  priceDetail: string;
  highlights: string[];
  whatsappMessage: string;
  iconName: 'Globe' | 'Bot' | 'ShoppingBag' | 'MapPin';
  popular?: boolean;
  badge?: string;
}

export interface ServiceTier {
  name: string;
  price: string;
  desc: string;
}

export interface RateCardCategory {
  id: string;
  number: string;
  title: string;
  priceRange: string;
  billingType: string;
  categoryGroup: 'Web & Apps' | 'Marketing & Ads' | 'AI & Automation' | 'Design & Support';
  tiers: ServiceTier[];
  notes: string;
  whatsappMessage: string;
  iconName: string;
}

export const FLAGSHIP_PACKAGES: FlagshipPackage[] = [
  {
    id: 'business-website',
    category: 'WEBSITE LAUNCH',
    title: 'Business Website',
    amount: 14999,
    tagline: 'Professional responsive business website, contact forms, essential on-page SEO and basic analytics integration.',
    priceDetail: 'One-time fee • Hosting/domain extra where applicable',
    highlights: [
      'Custom 5-8 page mobile & tablet responsive layout',
      'Contact forms & 1-tap WhatsApp chat lead capture',
      'Essential On-Page SEO, meta titles & sitemap setup',
      'Google Analytics & Search Console integration',
      'Ultra-fast load speed (Next.js / modern framework)',
    ],
    whatsappMessage: 'Hi Mukul sir, I want to launch my Business Website (₹14,999). Please share more details and portfolio.',
    iconName: 'Globe',
    badge: 'Launch Ready',
  },
  {
    id: 'whatsapp-starter',
    category: 'AUTOMATION',
    title: 'WhatsApp AI Starter',
    amount: 14999,
    tagline: 'Basic WhatsApp automation, FAQs, lead capture and defined setup/testing scope.',
    priceDetail: 'Setup fee • API and usage charges extra',
    highlights: [
      '24/7 Smart AI Auto-Responder (3-second reply time)',
      'Automated product/service catalog & FAQ resolution',
      'Zero lead leakage: Instant hot lead alerts to founder',
      'Continuous prompt tuning & defined handover testing',
      'Integrates directly with official WhatsApp Web / Cloud API',
    ],
    whatsappMessage: 'Hi Mukul sir, I want to deploy the WhatsApp AI Starter package (₹14,999) for my business.',
    iconName: 'Bot',
    popular: true,
    badge: 'Most Popular',
  },
  {
    id: 'shopify-launch',
    category: 'E-COMMERCE',
    title: 'Shopify Launch Pack',
    amount: 19999,
    tagline: 'Store setup, product catalogue configuration, essential checkout setup and shipping integration as agreed in the scope.',
    priceDetail: 'One-time fee • Shopify subscription and other third-party costs extra',
    highlights: [
      'Complete Shopify store theme customization & branding',
      'Product catalogue & category collections configuration',
      'Razorpay, Cashfree & Cash On Delivery (COD) setup',
      'Automated shipping rates & pin-code delivery rules',
      'High-converting mobile checkout & speed optimization',
    ],
    whatsappMessage: 'Hi Mukul sir, I want to launch my online store with the Shopify Launch Pack (₹19,999).',
    iconName: 'ShoppingBag',
    badge: 'E-Com Growth',
  },
  {
    id: 'gbp-growth',
    category: 'LOCAL BUSINESS GROWTH',
    title: 'GBP Audit & Optimization',
    amount: 2999,
    originalAmount: 4999,
    tagline: 'Google Business Profile audit, optimization recommendations and agreed listing improvements.',
    priceDetail: 'One-time fee • Special Discounted Price (Was ₹4,999)',
    highlights: [
      'Deep Google Maps & local ranking competitor audit',
      'Primary & secondary category keyword optimization',
      'Geo-tagged photo uploads & complete listing enhancement',
      'Review booster QR code strategy & custom template kit',
      'No fake ranking claims • 100% pure organic boost',
    ],
    whatsappMessage: 'Hi Mukul sir, I want the GBP Audit & Optimization package for my local business (₹2,999).',
    iconName: 'MapPin',
    badge: 'Save ₹2,000',
  },
];

export const RATE_CARD_SERVICES: RateCardCategory[] = [
  {
    id: 'web-development',
    number: '01',
    title: 'Website Development',
    priceRange: '₹7,999 – ₹49,999+',
    billingType: 'One-time project fee',
    categoryGroup: 'Web & Apps',
    tiers: [
      { name: 'Landing Page', price: '₹7,999 – ₹14,999', desc: 'High-converting single page for marketing campaigns & lead funnels' },
      { name: 'Business Website', price: '₹14,999 – ₹29,999', desc: '5-8 pages corporate or local business site with SEO & forms' },
      { name: 'Advanced Website / Portal', price: '₹29,999 – ₹49,999+', desc: 'Interactive client portal, dynamic directory or custom web app' },
    ],
    notes: 'Mobile-first, lightning-fast performance, contact forms and analytics integration.',
    whatsappMessage: 'Hi Mukul sir, I am looking for Website Development (₹7,999 – ₹49,999+). Let us discuss scope.',
    iconName: 'Globe',
  },
  {
    id: 'ecommerce-shopify',
    number: '02',
    title: 'E-commerce & Shopify Development',
    priceRange: '₹19,999 – ₹79,999+',
    billingType: 'One-time project fee',
    categoryGroup: 'Web & Apps',
    tiers: [
      { name: 'Shopify Launch Pack', price: '₹19,999', desc: 'Essential branded store setup with payment gateway & shipping' },
      { name: 'Custom Store Setup', price: '₹29,999 – ₹49,999', desc: 'Customized theme, catalogue filters & high-converting apps' },
      { name: 'Advanced E-commerce', price: '₹49,999 – ₹79,999+', desc: 'High-volume D2C store, custom upsells, ERP/inventory integration' },
    ],
    notes: 'Payment, shipping and product catalogue setup according to package.',
    whatsappMessage: 'Hi Mukul sir, I am interested in E-commerce & Shopify Development. Please share packages.',
    iconName: 'ShoppingBag',
  },
  {
    id: 'mobile-app',
    number: '03',
    title: 'Mobile App Development',
    priceRange: '₹49,999 – ₹4,99,999+',
    billingType: 'One-time project fee',
    categoryGroup: 'Web & Apps',
    tiers: [
      { name: 'App UI/UX Prototype', price: '₹14,999 – ₹39,999', desc: 'Clickable Figma UI prototype, user journeys and interaction maps' },
      { name: 'Basic MVP', price: '₹49,999 – ₹99,999', desc: 'Core feature mobile application for testing market validation' },
      { name: 'Cross-Platform Business App', price: '₹99,999 – ₹2,49,999', desc: 'Flutter/React Native app with push alerts, payments & backend' },
      { name: 'Complex App with Backend', price: '₹2,49,999 – ₹4,99,999+', desc: 'Scalable cloud infrastructure, live tracking & role-based dashboards' },
    ],
    notes: 'Built for Android & iOS with performance optimization and app submission support.',
    whatsappMessage: 'Hi Mukul sir, I have a Mobile App requirement (₹49,999 – ₹4,99,999+). Let us connect.',
    iconName: 'Smartphone',
  },
  {
    id: 'seo-services',
    number: '04',
    title: 'SEO Services',
    priceRange: '₹4,999 – ₹24,999/mo',
    billingType: 'Monthly retainer / One-time audit',
    categoryGroup: 'Marketing & Ads',
    tiers: [
      { name: 'SEO Audit', price: '₹4,999 (one-time)', desc: 'Complete technical SEO audit, site speed check & keyword gaps' },
      { name: 'Local SEO', price: '₹6,999/mo', desc: 'Google Business Profile, local citations & maps 3-pack visibility' },
      { name: 'Business SEO', price: '₹11,999/mo', desc: 'On-page optimization, content cluster planning & monthly ranking reports' },
      { name: 'Advanced SEO', price: '₹24,999/mo', desc: 'National/E-commerce SEO, technical schema & high-authority link building' },
    ],
    notes: 'Technical SEO, on-page optimization, content planning and reporting as per package.',
    whatsappMessage: 'Hi Mukul sir, I want SEO Services for organic Google rank growth. Please share details.',
    iconName: 'Search',
  },
  {
    id: 'smm-services',
    number: '05',
    title: 'Social Media Marketing (SMM)',
    priceRange: '₹6,999 – ₹29,999/mo',
    billingType: 'Monthly management fee',
    categoryGroup: 'Marketing & Ads',
    tiers: [
      { name: 'Starter Management', price: '₹6,999/mo', desc: '8-10 Posts/Reels, bio makeover, caption copy & scheduling' },
      { name: 'Growth Package', price: '₹14,999/mo', desc: '16 High-impact Reels/Carousels, trending audio & community engagement' },
      { name: 'Premium Management', price: '₹29,999/mo', desc: 'Daily posting, viral scriptwriting, custom video shoot & omni-channel growth' },
    ],
    notes: 'Content calendar, creatives, captions, scheduling and analytics; video volume defined per package.',
    whatsappMessage: 'Hi Mukul sir, I want to grow my brand on Instagram with Social Media Marketing.',
    iconName: 'Share2',
  },
  {
    id: 'paid-ads',
    number: '06',
    title: 'Paid Ads Management',
    priceRange: '₹12,000 – ₹39,999/mo',
    billingType: 'Monthly management fee',
    categoryGroup: 'Marketing & Ads',
    tiers: [
      { name: 'Meta Ads Growth Setup/Management', price: '₹12,000/mo', desc: 'Hyper-local Meta Ads targeting real buyers with creative hook testing' },
      { name: 'Google Ads Management', price: '₹12,000/mo', desc: 'Google Search & Call Ads targeting high purchase intent searches' },
      { name: 'Multi-Platform Campaigns', price: '₹24,999 – ₹39,999/mo', desc: 'Omnichannel Meta + Google + Remarketing sales funnels' },
    ],
    notes: 'Ad spend is separate from management fees. No fake sales or ROAS claims. Real tracked performance.',
    whatsappMessage: 'Hi Mukul sir, I want you to run high-converting Meta & Google Ads for my business.',
    iconName: 'TrendingUp',
  },
  {
    id: 'whatsapp-automation',
    number: '07',
    title: 'WhatsApp Automation & AI Chatbots',
    priceRange: '₹14,999 – ₹99,999+',
    billingType: 'Setup fee + optional monthly support',
    categoryGroup: 'AI & Automation',
    tiers: [
      { name: 'WhatsApp AI Starter', price: '₹14,999 setup', desc: '24/7 AI answering, lead capture & defined testing scope' },
      { name: 'Lead Generation Chatbot', price: '₹24,999 – ₹39,999', desc: 'Smart qualification, catalog delivery & automated booking' },
      { name: 'CRM-Integrated Automation', price: '₹49,999 – ₹99,999+', desc: 'HubSpot/Zoho/Sheets sync, dynamic reminders & multi-staff routing' },
      { name: 'Ongoing Support', price: '₹2,999 – ₹14,999/mo', desc: 'Prompt optimization, SLA monitoring & system maintenance' },
    ],
    notes: 'API, messaging and LLM usage charges may be extra.',
    whatsappMessage: 'Hi Mukul sir, I want WhatsApp Automation & AI Chatbots setup for my business.',
    iconName: 'MessageSquare',
  },
  {
    id: 'custom-ai-agents',
    number: '08',
    title: 'Custom AI Agents & Business Automation',
    priceRange: '₹29,999 – ₹2,99,999+',
    billingType: 'Custom solution fee',
    categoryGroup: 'AI & Automation',
    tiers: [
      { name: 'Simple Workflow Automation', price: '₹14,999 – ₹29,999', desc: 'Automate repetitive workflows across forms, email, sheets & invoicing' },
      { name: 'Custom AI Agent', price: '₹49,999 – ₹99,999', desc: 'Trained on company knowledge base with retrieval-augmented generation' },
      { name: 'Multi-Step Agentic Workflow', price: '₹99,999 – ₹2,99,999+', desc: 'Autonomous reasoning agents with human-in-the-loop safeguards' },
    ],
    notes: 'Integrations, approvals, monitoring and safeguards priced by complexity.',
    whatsappMessage: 'Hi Mukul sir, I need Custom AI Agents & Business Automation for my operations.',
    iconName: 'Cpu',
  },
  {
    id: 'crm-lead-systems',
    number: '09',
    title: 'CRM & Lead Management Systems',
    priceRange: '₹19,999 – ₹1,49,999+',
    billingType: 'Implementation fee',
    categoryGroup: 'AI & Automation',
    tiers: [
      { name: 'CRM Setup & Configuration', price: '₹19,999', desc: 'Deal stages, lead statuses, custom properties & team access setup' },
      { name: 'Custom Lead Management', price: '₹39,999 – ₹79,999', desc: 'Lead score tracking, automated WhatsApp follow-up & rep assignment' },
      { name: 'CRM + WhatsApp + Automation', price: '₹79,999 – ₹1,49,999+', desc: 'Unified growth stack: Ads -> CRM -> AI WhatsApp -> Closed Deal' },
    ],
    notes: 'Third-party subscriptions billed separately.',
    whatsappMessage: 'Hi Mukul sir, I want to build a CRM & Lead Management System for my sales team.',
    iconName: 'Database',
  },
  {
    id: 'branding-design',
    number: '10',
    title: 'Branding & Creative Design',
    priceRange: '₹4,999 – ₹39,999+',
    billingType: 'One-time project fee',
    categoryGroup: 'Design & Support',
    tiers: [
      { name: 'Logo & Basic Identity', price: '₹4,999', desc: 'Vector logo, color scheme, typography guidelines & social media kit' },
      { name: 'Brand Identity Package', price: '₹14,999', desc: 'Business cards, letterheads, invoice templates, packaging mockups' },
      { name: 'Complete Brand Kit & Guidelines', price: '₹24,999 – ₹39,999+', desc: 'Complete brand bible, tone of voice, visual rules & master design assets' },
    ],
    notes: 'High-resolution vector files with full commercial intellectual property transfer.',
    whatsappMessage: 'Hi Mukul sir, I need Branding & Creative Design services for my company.',
    iconName: 'Palette',
  },
  {
    id: 'website-maintenance',
    number: '11',
    title: 'Website Maintenance & Technical Support',
    priceRange: '₹2,999 – ₹14,999/mo',
    billingType: 'Monthly support retainer',
    categoryGroup: 'Design & Support',
    tiers: [
      { name: 'Basic Maintenance', price: '₹2,999/mo', desc: 'Weekly backups, security updates, uptime checks & minor fixes' },
      { name: 'Business Support', price: '₹5,999/mo', desc: 'Content updates, speed audits, bug fixing & priority technical support' },
      { name: 'Priority Technical Support', price: '₹14,999/mo', desc: 'Dedicated engineer, emergency phone support & continuous optimizations' },
    ],
    notes: 'Scope includes defined updates, backups, monitoring and support hours; hosting fees may be separate.',
    whatsappMessage: 'Hi Mukul sir, I need Website Maintenance & Technical Support for our site.',
    iconName: 'Shield',
  },
];
