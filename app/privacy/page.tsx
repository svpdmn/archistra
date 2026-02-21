import type { Metadata } from "next";
import { SitePageShell } from "@/components/layout/site-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for archistra platform usage, identity handling, and data protection practices."
};

export default async function PrivacyPage() {
  return (
    <SitePageShell
      eyebrow="LEGAL"
      title="Privacy Policy"
      lead="Effective date: February 21, 2026. This policy describes what we collect, why we process it, and how we protect it."
    >
      <section className="content-section">
        <h2 className="content-section-title font-alt">Data We Collect</h2>
        <ul className="content-list u-text-2">
          <li>Account identity data from your identity provider (for example: email and organization context).</li>
          <li>Workspace interaction data required to operate chat and related platform functions.</li>
          <li>Operational telemetry used for reliability, abuse prevention, and security monitoring.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">How We Use Data</h2>
        <ul className="content-list u-text-2">
          <li>Authenticate users, enforce role-based access controls, and secure tenant boundaries.</li>
          <li>Provide AI-assisted responses and maintain service reliability.</li>
          <li>Detect, investigate, and mitigate misuse, fraud, and security incidents.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Retention and Sharing</h2>
        <ul className="content-list u-text-2">
          <li>We retain data only as long as required for service delivery, security, and legal obligations.</li>
          <li>We may use subprocessors to operate infrastructure and model services under contractual safeguards.</li>
          <li>We do not sell personal information.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Your Controls</h2>
        <p className="u-text-2">
          You may request access, correction, or deletion where applicable law permits. For privacy requests, contact
          privacy@archistra.app.
        </p>
      </section>
    </SitePageShell>
  );
}
