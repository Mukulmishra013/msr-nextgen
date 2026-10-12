# MSR Next Gen: Antigravity Agent Brief
_Authoritative build spec. Read fully before touching any file. Owner: Mukul. Language of owner: Hinglish; reply to owner in simple Hinglish, code and docs in English._

> **NOTE:** **STOP RULE:** Your first job is **Phase 0 (inspection only, zero code changes)**. Do not start any later phase until the owner explicitly approves it. Work on ONE phase at a time.

## 1. Mission

Extend the existing MSR Next Gen website into a self-serve agency platform, restaurant/cafe niche first: **restaurant landing page, short assessment, rules-based package recommendation, approved no-call proposal, verified payment, purchase-linked onboarding, production tasks, client approvals, real reporting, renewal.** Human sales calls are optional, human accountability is not.

## 2. Hard rules (never violate)

- **DO NOT change the existing visual design.** Colors, background, gradients, logo, favicon, brand look and the layout of existing pages stay exactly as they are. Extract the existing design tokens (colors, spacing, radius, components) in Phase 0 and **reuse them** for every new page.
- **DO NOT rewrite or replace systems that already work** (Razorpay integration, `/portal` auth redirect, login/signup, AI demos, restaurant demo, existing data). Preserve and extend. No migration or provider swap without owner approval.
- **Add, don't rewrite.** Minimal diffs. If a file needs a large change, explain why and wait for approval.
- **No fakes.** No fake auth, fake payments, sample performance metrics, hardcoded dashboards, or client-side-only persistence presented as production features. If something cannot be built for real, say so.
- **Never invent business facts.** Prices, taxes, refund/cancellation terms, legal entity details, case-study numbers, delivery timelines come only from the approved catalogue or from the owner. Unknown values become `TODO_OWNER` placeholders listed in your report.
- **No real money, no real messages, no external spend.** Payments in gateway **test mode only**. No live WhatsApp/email to real people, no ad spend, no destructive operations (drop/delete data) without explicit approval.
- **Secrets:** never ask the owner to paste keys in chat, never commit secrets. Use env variables; list required variable **names** only.
- **Git discipline:** work on a branch, one commit per logical change, tag before each phase. Everything must be revertable.
- **Report honestly.** If something is unverified, say 'unverified'. Never claim done without evidence (see section 13).

## 3. Allowed vs approval-required changes

| Class | Examples | Rule |
|---|---|---|
| **Fix directly** | Findings F1-F14 in section 5 | Reproduce first, fix, test, report. |
| **Additive** | `/restaurants`, `/assessment`, `/plan/:id`, onboarding, admin dashboard, catalogue, workflows | Reuse existing tokens/components. Do not alter existing pages beyond required links. |
| **Ask first** | Changing fonts (e.g. monospace body to sans-serif), shortening/reordering homepage, navigation redesign, new DB/provider/hosting, new paid tools | Write a proposal with before/after screenshots. Wait for approval. |
| **Never** | Changing brand colors/background, deleting working features, live payments/messages | Not allowed. |

## 4. Phase 0: Inspection (no code changes)

- Create a git tag `pre-agent-baseline` and work branch.
- Produce `INSPECTION_REPORT.md`: tech stack, folder map, routes, database/schema, auth method, payment flow (client and server parts), where prices appear (frontend, AI prompts, checkout), AI provider/prompts, hosting/deploy, env variable **names**, background jobs if any.
- Produce `DESIGN_INVENTORY.md`: color tokens, fonts, spacing, key components, plus desktop (1440) and mobile (390x844) screenshots of every major page, saved as the **baseline**.
- Reproduce every finding in section 5 and mark each: confirmed / not reproducible / already fixed.
- List **unknowns** about the backend explicitly: is there a payment webhook, is signature verified, is there idempotency, is data isolated per client, is storage private, where does Forgot-password stand.
- Propose which existing pieces to reuse for each later phase. Then STOP and wait for approval.

## 5. Findings to fix (Phase 1)

Source: public-browser audit. Backend items are unverified until you inspect them.

| ID | Issue | Expected result |
|---|---|---|
| F1 | **P0** Sales-demo agent quotes prices that differ from website (e.g. WhatsApp AI: site shows setup fee; agent said monthly fee; ad management and bundle amounts differ). Agent also stated GST and no-refund rules not backed by any public policy. | One versioned catalogue feeds website, AI Maya, sales agent, proposal, checkout. AI never creates amounts/tax/discount/refund/delivery promises. Unknown policy: 'confirmation pending'. |
| F2 | **P0** Mobile App Development 'Request Quote' opens checkout with WhatsApp AI Starter selected. | Fixed-price service: its own checkout. Custom service: service-specific brief, then reviewed quote. `service_id` and scope preserved end-to-end. |
| F3 | **P0** No discoverable Terms, Privacy, Refund/Cancellation links in footer/checkout. `/privacy`, `/terms`, `/refund-policy` returned 404. | Pages exist, linked from footer and checkout before payment. Content = `TODO_OWNER` structure until owner supplies text. Store record of terms acceptance. |
| F4 | **P1** One-time Business Website checkout shows 'Monthly Renewal'. Retainers do not map clearly to the public rate card. | Per package show: payable today, recurring fee, usage charges, third-party costs, tax, renewal/cancellation terms. 'No Commitment' only if contract matches. |
| F5 | **P1** Mobile checkout (390x844): nested scroll, total and Pay button not visible initially, floating WhatsApp button over modal, low-contrast niche dropdown, rupee glyph rendering as box. | Dedicated mobile checkout page: selected plan, minimal contact, order summary + terms, visible Pay CTA. Hide floating widgets on checkout. Fix font fallback for the rupee sign. Do not change colors; fix contrast only if it fails accessibility, and report it. |
| F6 | **P1** Login has no Forgot password. Signup has about 7 fields, category defaults to Gym. | Password reset with identity verification, show/hide password, 'Select your business' default, account creation separate from business onboarding. Purchase linked to a verified account. |
| F7 | **P1** Footer anchors from `/agents` open `/agents#services` etc. which do not exist. | Shared footer uses `/#services`, `/#brands`, `/#case-study`, `/#about`. |
| F8 | **P1** 'Live' vs 'simulation' confusion; customer-facing modal shows 'Running local Baileys QR Worker?' developer text. | Label separately: Sample conversation / Interactive sandbox (no real transactions) / Connected production agent. Remove developer/worker text from public UI. Do not claim equivalence between Baileys and the official WhatsApp Cloud API. |
| F9 | **P1** Sales-demo answer cut off mid-sentence and shows raw markdown markers. | Proper rendering, incomplete-response handling, short step-by-step answers, structured cards for price/policy. |
| F10 | Checkout dialog lacks accessible dialog semantics; Escape does not close it. | Proper `role=dialog`, focus trap/return, Escape, labelled controls. |
| F11 | Restaurant demo: entry modal (name/WhatsApp/birthday) blocks viewing; cramped mobile header; unclear 'demo only'; no buyer CTA. | Guest access first, details optional, persistent 'Get this for my restaurant' CTA, demo isolated from real kitchen notifications and clearly labelled. |
| F12 | Canonical and sitemap point to `https://msrnextgen.com/`; sitemap has only homepage; audit fetch of that domain failed. | Verify DNS/SSL. Align canonical/sitemap with the real primary domain. Add per-page metadata. Report what you find; do not assume. |
| F13 | Missing baseline headers (`X-Content-Type-Options`, `Referrer-Policy`); homepage hero video autoplay with `preload=auto`. | Add headers. Use `preload=metadata` or equivalent for mobile data. Visuals unchanged. |
| F14 | Unsubstantiated claims: +340% ROAS, -28% RTO, 98-99% accuracy, 'guaranteed', '100% lead capture', universal '2-second' response. | Do not delete or rewrite claims yourself. List them in the report. Owner supplies proof/wording. Support fields for date range, baseline, source, work done, approval. |

## 6. Target architecture

AI converses, database records truth, durable workflows run processes. Payment, notifications, onboarding and task creation must **never** depend on one long AI prompt.

| Layer | Responsibility |
|---|---|
| Website | Landing pages, assessment, proposal, checkout, portal UI |
| Database/CRM | leads, consents, proposals, orders, payment_events, clients, projects, tasks, assets, approvals, tickets, audit_logs |
| Auth | Verified accounts, recovery, role-based access (client, editor, shooter, operations, admin) |
| Payments | Existing Razorpay. Preserve unless inspection shows a blocking problem |
| Private storage | Client assets/footage/deliverables, limited-access links, resumable uploads |
| AI assistant | Conversation and drafting, approved tool actions only |
| Workflow layer | Reminders, retries, scheduled steps, failure recovery, dead-letter queue |
| Communication | Consent-based email/WhatsApp (official API, approved templates) |
| Analytics | Acquisition, conversion, delivery, retention |

Reuse the existing stack. Add a new component only for a missing capability, and propose it first.

## 7. Phase plan with acceptance criteria

| Phase | Scope | Acceptance criteria |
|---|---|---|
| 0 | Inspection (section 4) | Reports delivered, owner approval, zero code diff. |
| 1 | Fix F1-F14 (F14: report only). Versioned catalogue, AI guardrails, policy page structure | All fixes reproduced then verified. Baseline screenshots match except intended fixes. Hardcoded-price grep is clean. |
| 2 | `/restaurants`, `/assessment`, rules engine, `/plan/:id`, demo CTA | New visitor reaches a proposal without any call, on mobile. Recommendation comes from deterministic rules; AI only phrases explanations. |
| 3 | Server-side order, payment verification, webhook, idempotency, recovery, invoices, refund/renewal states | Test-mode scenarios in section 11 all pass with evidence. |
| 4 | Purchase-linked account, onboarding checklist, private uploads, roles | Client A cannot access client B. Progress saved. Targeted reminders. |
| 5 | Project/task generation, shooter and editor cards, approval + revision workflow | Test project goes from brief to approved; no publish without approval. |
| 6 | Consent-based follow-ups, official WhatsApp, real-data reports, renewal reminders | Opt-out stops promotional messages. Reports show 'Data pending' when not connected. |
| 7 | Admin exception dashboard and funnel tracking | Forced failure appears in admin queue. Source-to-payment trace works. |
| 8 | Launch hardening | Section 11 checklist fully passed. Owner signs off. |

## 8. Core specs

### 8.1 Pricing catalogue

- Tables `services` and `price_versions`; every proposal/order stores the `price_version_id` it used.
- Each package fields: included deliverables, revisions, service area/travel, first-delivery timeline and required inputs, setup fee, monthly fee, ad-spend included/separate, usage charges, third-party costs, tax treatment, cancellation/refund rule, exclusions, client responsibilities.
- All consumers read it through one API/module. No amount in frontend strings, AI prompts or checkout code.
- Values the owner has not provided stay `TODO_OWNER`; checkout for such a package is disabled.

### 8.2 AI agent guardrails (Maya, sales agent, proposal assistant)

- Prices, tax, discounts, refunds and timelines are obtained only through a catalogue/policy tool. The model must not generate them.
- Unknown or unapproved item: reply that confirmation is pending and offer human review. No guessing.
- No guarantee language about sales/ROAS. No commitments outside approved scope.
- Allowed automatically: approved FAQs, qualification, catalogue-based recommendation, standard proposal draft, consent-based reminders, task/brief creation, missing-input checks, summaries of real metrics, support routing.
- Needs human approval: launching ads, material budget changes, new commercial offers, public publishing (unless pre-authorized), custom scope.
- Never: invent policies, unlimited discounts, arbitrary refunds, cross-client data, unauthorized messages or account changes.
- Add automated tests: a fixed set of price/policy questions across all agents must return catalogue values or 'pending confirmation'.

### 8.3 Assessment and rules engine

- Questions first: business type, city, goal (enquiries/bookings/content/automation), existing Instagram/website/Google profile, budget range, start preference. Contact and consent come after, to save/send the plan.
- Deterministic rules: service area covered, budget fit, shooting capacity, standard vs custom, required accounts/assets. Output: one recommended package, reason, exclusions.
- Routing: suitable gives recommendation; missing info gives targeted question; custom goes to review queue; unfit gets a helpful alternative or waitlist, never a forced checkout.
- Collect no unnecessary sensitive data.

### 8.4 Payment spec

- Flow: accepted proposal, **server creates order** from catalogue total, gateway checkout, **verified server event**, order paid, workspace and onboarding.
- Verify the payment signature and the webhook signature. Check amount, currency, order id and captured status against the stored order.
- Store every webhook in `payment_events` with the gateway event id (unique). Duplicate or delayed events must not create duplicate invoices/projects.
- Handle pending, failed, cancelled, paid. Show 'Payment verification pending' instead of success while unverified.
- Payment succeeded but onboarding failed: put into a recovery queue and alert admin. Browser closed after paying: order still recoverable.
- Receipt/invoice process, refund and renewal reconciliation. Auto-renewal only with a valid authorized subscription/mandate.
- Never log card data. Test mode only; owner adds live keys.

### 8.5 Onboarding, portal and roles

- Link purchase to a verified account (email/WhatsApp verification). A typed phone number is not ownership proof.
- Checklist with saved progress: business details, brand assets, account permissions, service-specific setup, approval to mark `Ready for production`.
- Never request passwords/OTPs. Use official delegated access.
- Roles: client, editor, shooter, operations, admin. Least privilege (editor/shooter get no payment/admin data, no unneeded client data).
- Private assets with expiring/limited links. Per-client isolation enforced server-side (row-level), not just hidden in UI.
- Client dashboard answers: what is happening, what is pending from me, next deliverable date, results. Reports use real connected data; otherwise 'Not connected / Data pending'.

### 8.6 Delivery workflow

- States: brief approved, shoot scheduled, footage uploaded, editing, internal QC, client approval, scheduled/published.
- Shooter card: client/location, schedule, contact, shot list, deliverables, mood/style, upload instructions. Editor card: footage link, script/selection, aspect ratio/duration, brand assets, subtitles, due date, revision allowance.
- Client asset view: preview, approve, request changes, comments, version history. No publish without approval unless pre-authorization is recorded.
- Repeated reminders without response escalate to the exception queue.

### 8.7 Messaging and consent

- Official WhatsApp Business platform/provider only. No scraping, no bulk unsolicited messages, no unofficial QR-session automation for customer-facing sales.
- Record opt-in with timestamp/source. Respect opt-out immediately. Use approved templates outside the customer-service window. Always provide a human escalation path.
- Follow-up sequence (illustrative): plan sent, next-day case study, scope/FAQ clarification, final reminder, then stop. Reply, payment, decline, opt-out or complaint stops or changes it.
- Niches with sensitive data (clinics, education) are out of scope for the generic restaurant bot.

### 8.8 Tracking

Events: `landing_view, assessment_started, assessment_completed, qualified_lead, proposal_viewed, checkout_started, payment_verified, onboarding_completed, service_live, renewed`. Preserve UTM/campaign source through lead, order and renewal. A WhatsApp click is not a lead or a sale. No passwords or chat PII in analytics. Agency-acquisition campaigns and client's own customer campaigns are separate pipelines and reports.

### 8.9 Admin exception dashboard

Queues: new qualified leads, custom proposals to review, payments needing reconciliation, missing client assets/access, upcoming shoots, overdue edits/approvals, automation failures, complaints/refunds, renewals at risk, campaign limit breached. Every workflow step has status, retry, duplicate protection and failure alert.

## 9. Security and privacy minimums

- Secure sessions, rate limits on auth and AI endpoints, password reset with verification.
- Server-side authorization on every endpoint; test with two accounts.
- Audit trail for approvals, money and account changes.
- Backups with a restore test. No secrets or PII in logs.
- AI endpoints: usage caps and cost alerts.
- This is a baseline, not a security certification. List remaining risks in each report.

## 10. Out of scope (do not build now)

- Other niches and the other services beyond the first restaurant journey.
- Custom app / complex CRM / advanced AI integration as 'Buy Now'. These require reviewed scope.
- Ad launching or budget changes by the AI.
- Redesign of existing visuals.

## 11. Required tests (provide evidence for each)

- Website, chatbots, proposal and checkout show the same price for every package.
- Every service CTA opens the correct journey.
- Mobile (390x844 and a small Android profile): assessment and checkout completable.
- Test payment: success, failure, cancellation, pending.
- Duplicate webhook produces exactly one order/project/invoice.
- Tab closed right after payment: purchase recovered.
- Correct onboarding opens after payment.
- Password reset works.
- Client A cannot read client B project/files; editor cannot open admin/payment pages; private file link fails when logged out.
- Opt-out stops promotional follow-up.
- Missing assets trigger relevant reminders.
- Forced automation failure appears in the admin queue and does not break payment/workspace creation.
- Approval and revision history persisted.
- Campaign source traces to a paid order.
- Refund/cancellation/subscription status update correctly.
- Visual regression: compare to baseline screenshots; report every pixel-level difference you intentionally made.

## 12. Inputs not yet provided by the owner

Use `TODO_OWNER` and list them in the report; do not guess: package sheet and final prices, legal entity/GST/contact details, refund and cancellation rules, service area, shoot capacity, WhatsApp provider, primary domain, operations partner, ad spend cap, approved case-study evidence.

## 13. Evidence standard

For each item claimed done: what changed (files/commits), how it was tested, test output or screen recording, desktop and mobile screenshots where UI is involved. If you could not test something (for example live webhooks), say 'not verified' and why.

## 14. Working style

- Write a short plan first and wait for approval for each phase.
- Keep changes small and reversible. Never mix phases.
- If a requirement conflicts with the hard rules, the hard rules win. Ask the owner.
- Talk to the owner in simple Hinglish, short and clear. No jargon without a one-line explanation.

## 15. Phase report template

| Section | Content |
|---|---|
| Summary | What this phase achieved in 3-5 lines |
| Changes | Files/commits, new routes/tables |
| Protected assets | Confirmation that colors/background/existing systems are untouched, with before/after screenshots |
| Tests | Which tests ran, results, evidence links |
| Not verified | Anything unverified and why |
| TODO_OWNER | Values/decisions still needed |
| Risks | Known remaining risks |
| Next | Proposed next phase, then wait |
