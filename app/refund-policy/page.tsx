import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | MSR Next Gen',
  description: 'Official refund, cancellation, and revision policies for MSR Next Gen digital packages and automation solutions.',
};

export default function RefundPolicyPage() {
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
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-sm text-[#888888]">
            Effective Date: October 12, 2026 | Last Updated: October 2026
          </p>
          <div className="mt-3 inline-block rounded-md bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-400 border border-amber-500/20">
            TODO_OWNER: Review standard turnaround days (5-7 business days) and non-refundable deposit terms with payment gateway compliance team.
          </div>
        </div>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">1. Nature of Digital & Custom Services</h2>
          <p>
            MSR Next Gen specializes in bespoke digital agency solutions, including web platform development, automated AI agent configuration, CRM integrations, and targeted growth marketing assets. Because our deliverables involve immediate allocation of technical engineering bandwidth, server resources, and custom programming, our refund parameters are strictly defined below.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">2. Standard Package Cancellation Terms</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h3 className="font-semibold text-white text-base mb-1">Prior to Technical Onboarding (Within 24 Hours)</h3>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                If a cancellation request is submitted in writing within 24 hours of package purchase AND prior to the kickoff requirement discovery meeting or deployment sprint initiation, a 90% refund will be issued (deducting the 10% administrative & payment gateway processing fee).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h3 className="font-semibold text-white text-base mb-1">Post-Kickoff & Technical Sprint Commencement</h3>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                Once technical setup, architecture scaffolding, code repository creation, or API credential provisioning has commenced, initial payments and milestone advances become strictly non-refundable due to consumed engineering effort.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h3 className="font-semibold text-white text-base mb-1">Delivered & Deployed Systems</h3>
              <p className="text-xs sm:text-sm text-[#AAAAAA]">
                Completed software builds, deployed automation bots, delivered source code repositories, and running cloud agents are not eligible for any refund once handed over or staged for client testing.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">3. Custom Retainers & Bespoke Projects</h2>
          <p>
            Bespoke enterprise projects and retainer agreements are governed by the dedicated Statement of Work (SOW). Milestone advances, discovery sprints, and monthly retainer fees paid for reserved team allocation are non-refundable. Either party may terminate ongoing retainers by giving a 14-day advance notice in writing.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">4. Revision Guarantee & Defect Remediation</h2>
          <p>
            While monetary refunds are constrained by engineering bandwidth realities, we stand behind the quality of our code:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-[#888888]">
            <li>Each standard package includes dedicated revision cycles as itemized in the Master Service Catalogue.</li>
            <li>Any verified software bugs or technical deviation from the agreed specification reported during the 14-day handover window will be remediated at zero additional charge.</li>
          </ul>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">5. Refund Processing Timeline</h2>
          <p>
            Approved refunds will be processed via the original payment method through Razorpay within <strong className="text-white">5 to 7 business days</strong>. Depending on your issuing bank or card provider, funds may take an additional 3-5 working days to reflect on your statement.
          </p>
        </section>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed text-[#CCCCCC]">
          <h2 className="text-xl font-semibold text-white">6. Raising a Refund or Dispute Request</h2>
          <p>
            To submit an official inquiry regarding cancellations or billing questions, please reach out with your Order ID and transaction proof:
          </p>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs sm:text-sm">
            <p><strong className="text-white">Billing & Accounts Desk</strong></p>
            <p>Email: <a href="mailto:support@msrnextgen.com" className="text-[#00F0FF] underline">support@msrnextgen.com</a></p>
            <p>Subject Line: <span className="text-white font-mono">[Cancellation Request] - Order ID #...</span></p>
            <p>Helpline: <span className="text-white font-mono">+91 95193 42440</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
