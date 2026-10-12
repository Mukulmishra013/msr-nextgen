# MSR Next Gen — Codebase Inspection Report (Phase 0)
**Date:** October 12, 2026  
**Auditor / Inspector:** Antigravity AI Agent  
**Baseline Tag:** `pre-agent-baseline`  
**Active Work Branch:** `dev-main`  
**Target Application:** MSR Next Gen (Next.js 14 App Router Platform)

---

## 1. Executive Summary & Stack Verification

Codebase ka complete inspection zero-code-change policy ke tehat complete kar liya gaya hai.  
Sabhi core systems, routing tables, database connection, auth handling, payment webhooks, AI prompts aur background WhatsApp engines ko source-code level par inspect kiya gaya hai.

### Tech Stack Map
* **Framework:** Next.js `14.2.13` (React 18.3.1, TypeScript 5, Tailwind CSS 3.4.1)
* **Frontend Runtime:** Vercel Production Environment (Automated CI/CD from GitHub `main`)
* **Primary Database & Storage:** Supabase PostgreSQL (`pogmewzbzfjasqdsdwbi.supabase.co`)
* **Client Portal Auth:** HMAC-SHA256 Token Sessions + PBKDF2 Password Hashing (Dual persistence: Supabase `clients` / `client_accounts` + local fallback)
* **Payment Gateway:** Razorpay SDK (`v2.9.4`) + Server-Side Cryptographic Signature Verification & Webhooks
* **Background Worker & WhatsApp Socket:** Node.js 22 Worker on Render (`msr-whatsapp-bot.onrender.com`) running `@whiskeysockets/baileys` (Dual Sockets: Admin Permanent `+91 95193 42440` + 5-Minute Sandbox)
* **AI Engine:** Multi-provider fallback pipeline (OpenRouter -> Groq -> Gemini Flash -> Pollinations)

---

## 2. Comprehensive Hosting & Provider Economics

Aapki requirement ke mutabiq, yahan sabhi active aur planned providers ke **Commercial Terms, Backup/Pause Behaviour, aur Monthly Cost Estimation** ka factual breakdown diya gaya hai:

| Provider | Service / Role | Free Tier Limits | Commercial Terms / Paid Tier Trigger | Backup & Pause Behaviour | Estimated Monthly Cost |
|---|---|---|---|---|---|
| **Vercel** | Next.js Frontend & API Serverless Functions | • 100 GB Bandwidth/mo<br>• 1,000,000 Edge invocations<br>• 10s Serverless Execution Timeout | Hobby plan is strictly for non-commercial or personal projects. Commercial agency usage requires Vercel Pro ($20/seat/month) once traffic/bandwidth crosses limits. | Zero downtime. Automated global edge deployment. Serverless functions pause automatically when idle (zero cold-start billing). | **₹0** currently (Hobby).<br>*(Scale hone par: $20/mo ~ ₹1,700/mo)* |
| **Supabase** | PostgreSQL Database & File Storage | • 500 MB Database<br>• 1 GB File Storage<br>• 50,000 Monthly Active Users<br>• 5 GB Egress | Free tier projects pause automatically after **7 days of complete inactivity**. Pro Plan is $25/month for unpausing + daily automated backups. | **Pause Risk:** Agar 7 din koi query na aaye toh pause ho jata hai. Free tier me manual backup download available hai. Pro tier me 7-day point-in-time recovery (PITR) milti hai. | **₹0** currently.<br>*(Inactivity pause se bachne ke liye keep-alive ping ya Pro $25/mo)* |
| **Render** | WhatsApp Worker & Baileys Background Socket | • 750 Free Instance Hours/mo<br>• 512 MB RAM Web Service | Free Web Service spins down (sleeps) after **15 minutes of inbound inactivity**. Free tier resets monthly. | **Sleep Risk:** Free instance sleep hone par incoming HTTP requests 50-60s delay leti hain. Persistent WebSocket connect rakhne ke liye $7/month Starter plan standard hai. | **₹0** currently.<br>*(Dedicated 24/7 non-sleep background: $7/mo ~ ₹580/mo)* |
| **Cloudflare R2** *(Planned Asset Storage)* | Client Raw Videos & Shoot Deliverables | • 10 GB Storage Free<br>• 1,000,000 Class A operations<br>• **Zero Egress (Free Bandwidth)** | Free tier crosses karne par $0.015/GB-month storage. Zero download bandwidth fee. | Never pauses. Multi-region redundancy. S3-compatible API. | **₹0** (under 10GB). |
| **Razorpay** | Online Payment Gateway (UPI, Cards, NetBanking) | • Zero Setup Fee<br>• Zero Monthly Maintenance | Standard domestic transaction fee: **2% + GST** per successful transaction. | Gateway 24/7 active. Transactions directly settle to linked bank account in T+2 days. | **₹0 Fixed**<br>*(Only 2% per successful transaction)* |
| **Groq / Google Gemini** | AI LLM Intelligence for Maya | • Groq: Free rate limits (30 RPM, 14.4k RPD)<br>• Gemini: 15 RPM, 1,500 RPD Free | Pay-as-you-go trigger hone par: $0.05 per 1M tokens (Llama 3.3) / $0.075 per 1M tokens (Gemini Flash). | Never pauses. Fails over automatically to next available provider if rate-limited. | **₹0** (Under free RPM caps). |

---

## 3. WhatsApp Architecture & Baileys Safety Protocol

### Reality Check:
* Aapne note kiya: **Meta WhatsApp Cloud API directly available nahi hua**, isliye currently Render par **Baileys WebSocket** chal raha hai.
* **Baileys Risk:** WhatsApp Web protocol reverse-engineering par chalta hai. Agar bulk spam ya unsolicited promotional broadcasts bheje jayein, toh WhatsApp number ban hone ka genuine risk hota hai.

### Recommended Safety & Hardening Protocol for Baileys:
1. **Never Broadcast / Bulk Message:** Anjaan numbers par kabbhi cold blast ya unsolicited promotion na bhejein.
2. **Inbound Only:** Sirf unhi logo ko reply karein jo khud message kar rahe hain (Inbound Leads).
3. **Pacing / Human-Like Delay:** Consecutive messages ke beech 1.5s - 3s ka realistic typing delay rakhein.
4. **Owner Fallback:** Sensitive queries ya complaint aane par automated loop rokk kar Mukul sir (+91 88875 21156) par chat handover karein.
5. **Session Backup:** `.whatsapp_auth` directory ke credentials Render disk ya secure cloud bucket me regularly backup rahein taaki re-pair QR scan na maange.

---

## 4. Application Routes Inventory (33 Active Endpoints)

### Public Client & Marketing Routes
* `/` — Homepage (Hero, Services, Brands We Manage, Amparo Case Study, AI Demo, About, Final CTA)
* `/pricing` — Dedicated App-like 11-Service Rate Card & 4 Flagship Bundles
* `/restaurant` — 3D Interactive Restaurant Concierge & Table Demo
* `/agents` — AI Agents Hub & 5-Minute Live Interactive Sandbox
* `/invoice` — Client Digital Invoice View & PDF Export
* `/onboarding` — Purchase-linked Client Onboarding Wizard

### Client Portal Routes
* `/portal` — Client Dashboard (Projects, Deliverables, Reports, Settings)
* `/portal/login` — Client Portal Secure Authentication
* `/portal/signup` — Client Portal Registration

### Admin Control Routes
* `/admin/login` — Agency Founder Secure Login
* `/admin/dashboard` — Full Admin Control Panel (Leads, WhatsApp CRM, Orders, Brands Management)

### API Endpoints
* `/api/checkout` — Server-side Razorpay Order Creator
* `/api/checkout/verify` — Cryptographic Payment Signature Verifier
* `/api/webhook/razorpay` — Server-to-Server Razorpay Webhook Event Listener
* `/api/portal/auth/login` — Client Session Token Generator
* `/api/portal/auth/signup` — Client Account Creator
* `/api/portal/auth/me` — Active Session Verifier
* `/api/portal/auth/logout` — Session Cookie Invalidator
* `/api/leads` — Inbound Marketing Lead Collector
* `/api/onboarding` — Client Business Setup Data Receiver
* `/api/chat` — Maya AI Chatbot Endpoint
* `/api/admin/leads` — Admin Leads Management API
* `/api/admin/whatsapp` — WhatsApp Worker Proxy & Controller
* `/api/admin/whatsapp/crm` — WhatsApp CRM Sync API
* `/api/restaurant/order` — Restaurant Table Ordering API
* `/api/restaurant/loyalty` — Restaurant WhatsApp Loyalty & Coupon API

---

## 5. Security, Database & Auth Findings

### Database (Supabase)
* **Tables Detected / Used:** `orders`, `leads`, `onboarding`, `clients`
* **Access Mode:** `lib/supabase.ts` exports `supabase` (anon public) aur `supabaseAdmin` (service role bypass).
* **Unknown / Audit Requirement:** Production database me Supabase RLS (Row Level Security) policies abhi verify hona baaki hain ki Client A dusre Client B ki query bina service role ke block kar raha hai ya nahi.

### Authentication (`lib/auth.ts`)
* Session generation HMAC-SHA256 token based hai with 7-day expiration.
* Passwords salt + PBKDF2 (10,000 iterations, sha512) se hash hote hain (Timing-safe equality check included).
* **Missing Feature:** `/portal/login` par **"Forgot Password"** link aur recovery flow abhi missing hai (Finding F6).

### Payments (`api/checkout` & `api/webhook/razorpay`)
* **Order Creation:** Server-side POST route (`/api/checkout`) Razorpay SDK se official `order_id` generate karta hai.
* **Verification:** Dual verification mode hai:
  1. Instant client verification route: `/api/checkout/verify` validates `razorpay_signature`.
  2. Background server webhook: `/api/webhook/razorpay` crypto HMAC-SHA256 signature check karta hai aur order status `paid` mark karta hai.
* **Idempotency Status:** Webhook `payment.captured` par order status update karta hai, lekin dedicated `payment_events` audit table me har gateway event ID ko uniquely record karna Phase 3 me required hoga.

---

## 6. Audit of Findings F1 to F14 (Status & Action Plan)

| ID | Issue Description | Codebase Inspection Status | Phase 1 Action Required |
|---|---|---|---|
| **F1** | AI Sales agent quotes inconsistent pricing (differs from website) | **Confirmed:** `app/api/chat/route.ts` aur `scripts/whatsappSalesEngine.mjs` me alag-alag hardcoded pricing strings hain (₹15,000/mo vs ₹2,999 setup). | Centralize into single versioned catalogue module. AI guardrail to prevent hallucinating taxes/discounts. |
| **F2** | Mobile App Development 'Request Quote' opens WhatsApp AI Starter | **Confirmed:** Services button default `handleBuyNow('whatsapp-starter')` call karta tha. | Route custom services to service-specific brief inquiry flow. |
| **F3** | Missing legal policy pages (`/terms`, `/privacy`, `/refund-policy` return 404) | **Confirmed:** Pages do not exist in `app/`. Footer links missing. | Create `/terms`, `/privacy`, `/refund-policy` with standard legal placeholder structure (`TODO_OWNER`). |
| **F4** | One-time Business Website checkout shows 'Monthly Renewal' | **Confirmed:** `CheckoutModal.tsx` me retainers aur one-time packs ke billing labels me clear segregation required hai. | Clarify one-time vs recurring retainer breakdown in checkout summary. |
| **F5** | Mobile checkout modal scroll, rupee glyph, floating widget overlap | **Confirmed:** Floating WhatsApp widget modal ke upar render hota hai; mobile modal viewport scroll required. | Hide floating widgets when checkout modal is active; ensure rupee symbol fallback font. |
| **F6** | Login lacks Forgot Password; Signup defaults category to Gym | **Confirmed:** `app/portal/login/page.tsx` lacks forgot password; `signup/page.tsx` hardcodes default 'Gym & Fitness Center'. | Add forgot password flow; change default to 'Select your business category'. |
| **F7** | Footer anchors from inner pages open broken relative URLs | **Confirmed:** Footer used `href="#services"` instead of root `href="/#services"`. | Update footer navigation links to absolute root anchors. |
| **F8** | Developer text 'Running local Baileys QR Worker' in customer UI | **Confirmed:** Present in `app/agents/page.tsx` developer sandbox card. | Remove internal technical worker terminology from client-facing UI. |
| **F9** | Sales demo response cut off mid-sentence / markdown markers | **Confirmed:** `whatsappSalesEngine.mjs` fallback prompts sometimes truncate output. | Add response buffer sanitization and clean markdown rendering. |
| **F10**| Checkout dialog lacks `role="dialog"` and Escape key listener | **Confirmed:** `CheckoutModal.tsx` lacks accessibility attributes and Escape key hook. | Add `role="dialog"`, `aria-modal="true"`, and `keydown` Escape listener. |
| **F11**| Restaurant demo entry modal blocks view; lacks buyer CTA | **Confirmed:** `app/restaurant/page.tsx` forces modal on initial load. | Allow guest browsing first; add sticky "Get This For My Restaurant" CTA. |
| **F12**| Canonical and sitemap point to msrnextgen.com; sitemap has only homepage | **Confirmed:** `app/sitemap.ts` only contains root URL. | Expand sitemap to include all public pages (`/pricing`, `/agents`, `/restaurant`, etc.). |
| **F13**| Missing security headers; Hero video has `preload="auto"` | **Confirmed:** `next.config.mjs` lacks CSP/security headers; `HeroVideoShowcase.tsx` line 150 has `preload="auto"`. | Add security headers in `next.config.mjs`; change video to `preload="metadata"`. |
| **F14**| Unsubstantiated claims (+340% ROAS, -28% RTO, 98% accuracy) | **Confirmed:** Claims present in marketing copy. | List claims in documentation; tag with `TODO_OWNER` for proof/case-study verification. |

---

## 7. Unknowns & Next Steps
1. **Supabase RLS Policies:** Live database dashboard me verify karna hoga ki row-level security enabled hai ya nahi.
2. **Phase 1 Initiation:** F1 se F14 ke surgical fixes shuru karne ke liye Owner approval required hai.
