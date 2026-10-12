# MSR Next Gen — Design Inventory & Baseline Protection (Phase 0)
**Date:** October 12, 2026  
**Auditor:** Antigravity AI Agent  
**Baseline Git Tag:** `pre-agent-baseline`  
**Target:** Design Integrity & Anti-Regression Rules

---

## 1. Protected Design Tokens (DO NOT MODIFY)

Ye design tokens hamari agency website ke core visual DNA hain. Future me banne wale sabhi naye pages (`/restaurants`, `/assessment`, `/plan/:id`) inhi tokens ko strictly reuse karenge.

### Color Palette (Tailwind CSS)
* **Brand Primary:** `#0f6e56` (`brand-600` - Deep Teal)
* **Brand Dark:** `#0a3d31` (`brand-900`)
* **Brand Deep Base:** `#03231c` (`brand-950`)
* **Brand Light Background Tint:** `#eaf6f2` / `#f0fdf9` (`brand-50`)
* **Brand Glow Accent:** `#10b981` (`emerald-500`) & `#0d9488` (`teal-600`)

### Surface & Neutral Tones
* **Surface Background Base:** `#fcfdfd` (`surface-50`)
* **Surface Background Secondary:** `#f8faf9` (`surface-100`)
* **Surface Border Subdued:** `#f1f5f3` (`surface-200`)
* **Surface Border Strong:** `#e5ece8` (`surface-300`)
* **Text Heading:** `#0f172a` (`slate-900` - Black/Dark Slate)
* **Text Body:** `#334155` / `#475569` (`slate-700` / `slate-600`)
* **Text Muted:** `#64748b` (`slate-500`)

### Dark Mode / Accent Cards
* **Dark Contrast Surface:** `#020617` (`slate-950`) / `#0f172a` (`slate-900`)
* **Dark Card Border:** `#1e293b` (`slate-800`)

---

## 2. Typography & Font System
* **Primary Sans:** Inter / System UI fallback (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
* **Headings:** `font-black` / `font-extrabold` with `tracking-tight`
* **Feature Badges:** `text-[10px]` / `text-xs` with `font-bold uppercase tracking-wider`
* **Body Text:** `text-sm` / `text-base` with `leading-relaxed`

---

## 3. UI Component Baseline Archetypes

1. **Pill Badges:**
   `px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shadow-2xs`
2. **Interactive Cards:**
   `rounded-3xl p-6 sm:p-7 bg-white border border-surface-300 hover:border-brand-300 shadow-xs hover:shadow-md transition-all`
3. **Primary Action Buttons:**
   `py-3 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer`
4. **WhatsApp Buttons:**
   `py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all`

---

## 4. Page Baseline Layout Registry (Phase 0 Snapshots)

* **Homepage (`/`):**
  - Hero with Ambient Dot Grid & Video Showcase Frame
  - Clean White Services Section with 4 Pillar Cards & Banner to Rate Card
  - Brands We Manage with Social Media Proof Cards
  - Case Study (Amparo D2C 3.8x ROAS)
  - 3D Interactive Growth Rocket & 24/7 Maya Chatbot Widget
* **Rate Card & Pricing (`/pricing`):**
  - Dedicated App-like Light Theme Header
  - Tab Switcher (All / Flagship / 11-Service Rate Card)
  - Live Search Filter
  - Dual CTAs (Instant Checkout & WhatsApp Consultation)
* **Restaurant Concierge (`/restaurant`):**
  - 3D Table QR Simulation
  - Digital Menu & Loyalty Voucher Generator
* **Agents Hub (`/agents`):**
  - Interactive Multi-Niche AI WhatsApp Demonstration Sandbox
* **Client Portal (`/portal`):**
  - Private Client Operations Dashboard

---

## 5. Strict Design Rules for Upcoming Phases
* **No Dark Mode Swapping on Marketing Pages:** Landing pages must strictly preserve the clean white & light teal surface styling.
* **Component Reuse:** Any new step in `/restaurants` or `/assessment` must reuse existing button classes, input styles, and card radiuses from this inventory.
