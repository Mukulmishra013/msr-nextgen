export interface BrandMediaItem {
  id: string;
  type: 'reel' | 'post';
  title: string;
  caption: string;
  thumbnailUrl: string;
  views?: string;
  likes?: string;
  metric?: string;
  hook?: string;
  instagramUrl?: string;
}

export interface BrandClient {
  id: string;
  name: string;
  handle: string;
  category: string;
  url: string;
  logoUrl?: string;
  initials: string;
  bio?: string;
  growthHighlight?: string;
  managedDuration?: string;
  reelsCount?: string;
  media?: BrandMediaItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  outcomes: string[];
  icon: string;
  whatsappMessage: string;
}

export interface CaseStudyStat {
  label: string;
  value: string;
  subtext: string;
  isPendingVerification?: boolean;
}

export interface LeadSubmission {
  name: string;
  businessName: string;
  phone: string;
  source?: string;
  honeypot?: string;
  submittedAt?: string;
}

export interface LeadRecord extends LeadSubmission {
  id: string;
  source: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  aiScore?: 'hot' | 'warm' | 'cold';
  aiSummary?: string;
  aiSuggestedReply?: string;
  autoSent?: boolean;
  providerUsed?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type AnalyticsEvent = 
  | { name: 'whatsapp_click'; properties: { source: string; service?: string } }
  | { name: 'lead_form_submit'; properties: { status: 'started' | 'success' | 'error'; error?: string } }
  | { name: 'portfolio_outbound_click'; properties: { brand: string; url: string } }
  | { name: 'case_study_view'; properties: { brand: string } }
  | { name: 'demo_scenario_change'; properties: { scenario: string } }
  | { name: 'ai_chat_open'; properties?: Record<string, unknown> }
  | { name: 'ai_chat_message'; properties?: Record<string, unknown> }
  | { name: 'video_play'; properties?: Record<string, unknown> }
  | { name: 'video_pause'; properties?: Record<string, unknown> }
  | { name: 'video_toggle_mute'; properties?: Record<string, unknown> };
