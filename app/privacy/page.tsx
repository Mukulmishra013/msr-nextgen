import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | MSR Next Gen',
  description: 'Privacy Policy and data protection terms for MSR Next Gen clients and platform users.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-[#FAFAFA] transition-colors mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#888888]">
            Effective Date: October 12, 2026 | Last Updated: October 2026
          </p>
          <div className="mt-3 inline-block rounded-md bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-400 border border-amber-500/20">
            TODO_OWNER: Verify registered entity name and grievance officer email address.
          </div>
        </div>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">1. Introduction & Overview</h2>
          <p>
            MSR Next Gen (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting the personal data of our users, clients, and website visitors. This Privacy Policy outlines how we collect, store, process, and protect your information when you access our website, client portal, automated agents, and API integrations.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
          <p>We collect information in the following categories:</p>
          <ul className="list-disc pl-6 space-y-2 text-[#888888]">
            <li>
              <strong className="text-white">Account & Contact Data:</strong> Name, business name, phone number, email address, industry category, and onboarding responses when you register or initiate service requests.
            </li>
            <li>
              <strong className="text-white">Payment & Billing Data:</strong> Transaction ID, order amount, and payment status collected securely through our payment processing partner (Razorpay). We do not store complete debit/credit card numbers or CVV on our servers.
            </li>
            <li>
              <strong className="text-white">WhatsApp & Messaging Interactions:</strong> Inbound query content, message timestamps, sender phone numbers, and operational lead responses generated during customer automation sessions.
            </li>
            <li>
              <strong className="text-white">Usage & Diagnostic Information:</strong> Log files, browser user-agent strings, referral sources, and platform interaction telemetry used strictly to optimize performance and uptime.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">3. How We Use Collected Data</h2>
          <p>We process your data for the following legitimate business purposes:</p>
          <ul className="list-disc pl-6 space-y-2 text-[#888888]">
            <li>To provision and deploy digital services, automation agents, and dashboard analytics.</li>
            <li>To verify identities, process subscription or one-time milestone payments, and issue invoices.</li>
            <li>To communicate onboarding milestones, system maintenance notices, and customer support resolutions.</li>
            <li>To safeguard platform integrity, detect fraudulent abuse, and fulfill Indian statutory compliance requirements.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">4. Third-Party Service Providers</h2>
          <p>
            To deliver enterprise-grade automation reliably, we engage trusted infrastructure partners under strict confidentiality and processing agreements:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="font-semibold text-white block text-sm">Supabase</span>
              <span className="text-xs text-[#888888]">PostgreSQL database storage & secure authentication infrastructure.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="font-semibold text-white block text-sm">Razorpay</span>
              <span className="text-xs text-[#888888]">PCI-DSS compliant payment processing and automated settlement gateways.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="font-semibold text-white block text-sm">Render / Cloud Workers</span>
              <span className="text-xs text-[#888888]">Automated message processing & secure microservice task runners.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="font-semibold text-white block text-sm">Vercel</span>
              <span className="text-xs text-[#888888]">Global edge hosting, CDN delivery, and web platform hosting.</span>
            </div>
          </div>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">5. Data Retention & Security Safeguards</h2>
          <p>
            We implement industry-standard encryption protocols (TLS/HTTPS in transit and AES encryption at rest) across all operational databases. Client lead data and transactional logs are retained for the duration of the active service engagement plus any statutory compliance retention period mandated by Indian tax and commercial laws.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
          <p>
            You possess the right to access, review, modify, or request deletion of your personal account data stored in our systems, subject to legal retention constraints. To exercise these rights, submit a written request to our grievance contact listed below.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">7. Grievance Officer & Contact</h2>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs sm:text-sm">
            <p><strong className="text-white">MSR Next Gen Support Desk</strong></p>
            <p>Email: <a href="mailto:support@msrnextgen.com" className="text-[#00F0FF] underline">support@msrnextgen.com</a></p>
            <p>WhatsApp Official Desk: <span className="text-white font-mono">+91 95193 42440</span></p>
            <p>Country of Jurisdiction: <span className="text-white">India</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
