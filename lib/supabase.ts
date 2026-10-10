import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pogmewzbzfjasqdsdwbi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RYDu6WyUJkbTuGh_oVY-kQ_MrlzC8WB';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public / Browser client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin server client with service role (bypasses RLS safely on server routes only)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export interface LeadDbRecord {
  id?: string;
  phone: string;
  name?: string;
  business_name?: string;
  category?: string;
  budget?: string;
  pain_point?: string;
  website_url?: string;
  audit_findings?: string;
  stage?: string;
  meeting_state?: string;
  psychology_notes?: string;
  history?: any[];
  last_active?: number;
  alert_sent_to_owner?: boolean;
  notes?: string;
  created_at?: string;
}

export interface OrderDbRecord {
  id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  package_id: string;
  package_name: string;
  amount: number;
  currency?: string;
  status: 'payment_pending' | 'paid' | 'failed' | 'refunded';
  client_name?: string;
  client_phone: string;
  client_email?: string;
  business_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingDbRecord {
  id?: string;
  order_id?: string;
  client_phone: string;
  business_name: string;
  business_type: string; // Gym, Salon, Clinic, Restaurant, Coaching, D2C, etc.
  address?: string;
  google_maps_link?: string;
  instagram_handle?: string;
  manager_phone?: string;
  staff_phone?: string;
  assets_urls?: string[];
  menu_or_services_doc?: string;
  status: 'onboarding_pending' | 'setup_running' | 'testing' | 'active' | 'failed';
  owner_approved?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
