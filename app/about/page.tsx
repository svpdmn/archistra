import type { Metadata } from "next";
import Link from "next/link";
import { SitePageShell } from "@/components/layout/site-page-shell";

export const metadata: Metadata = {
  title: "About",
  description: "How archistra helps organizations convert fragmented context into coherent strategic execution."
};

const pillars = [
  {
    title: "Strategy Alignment",
    description: "Map intent to capabilities, systems, and operating model decisions with explicit traceability."
  },
  {
    title: "Architecture Integrity",
    description: "Preserve coherence across business, data, application, and technology layers as the enterprise evolves."
  },
  {
    title: "Operational Discipline",
    description: "Move from ad hoc delivery to measurable execution patterns with clear ownership and feedback loops."
  },
  {
    title: "Risk-Aware Governance",
    description: "Identify and manage security, compliance, and delivery risks before they become structural failures."
  }
];

const principles = [
  "Model decisions explicitly and keep assumptions visible.",
  "Design for change by default, not as a late-stage exception.",
  "Use AI to accelerate analysis, but keep human accountability for final decisions.",
  "Treat security, privacy, and compliance as architecture constraints."
];

export default async function AboutPage() {
  return (
    <SitePageShell
      eyebrow="COMPANY"
      title="Enterprise intelligence with architectural rigor."
      lead="archistra is built for teams that need strategic speed without sacrificing system integrity."
    >
      <section className="content-section">
        <h2 className="content-section-title font-alt">What We Solve</h2>
        <p className="u-text-2">
          Most organizations struggle with fragmented planning, disconnected architecture artifacts, and execution drift.
          archistra provides a unified workspace to align strategy, capabilities, and implementation paths.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Core Pillars</h2>
        <div className="content-grid">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="card content-card">
              <h3 className="font-alt">{pillar.title}</h3>
              <p className="u-text-2">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Operating Principles</h2>
        <ul className="content-list u-text-2">
          {principles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="content-cta card">
        <p className="u-text-2">Ready to move from fragmented context to coherent execution?</p>
        <div className="home-actions">
          <Link href="/chat" className="btn btn-primary btn-size-page font-semibold font-alt">
            Open Chat Workspace
          </Link>
          <Link href="/contact" className="btn btn-ghost btn-size-page font-semibold font-alt">
            Contact Team
          </Link>
        </div>
      </section>
    </SitePageShell>
  );
}
