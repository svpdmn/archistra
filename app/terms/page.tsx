import type { Metadata } from "next";
import { SitePageShell } from "@/components/layout/site-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of archistra services, acceptable use, and account responsibilities."
};

export default async function TermsPage() {
  return (
    <SitePageShell
      eyebrow="LEGAL"
      title="Terms of Service"
      lead="Effective date: February 21, 2026. By using archistra, you agree to these terms."
    >
      <section className="content-section">
        <h2 className="content-section-title font-alt">Use of Service</h2>
        <ul className="content-list u-text-2">
          <li>You must use the platform in compliance with applicable law and contractual obligations.</li>
          <li>You are responsible for account security and activities performed under your credentials.</li>
          <li>You may not attempt to bypass access controls, abuse rate limits, or disrupt service availability.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Acceptable Use</h2>
        <ul className="content-list u-text-2">
          <li>No malicious code, unauthorized scanning, or exploitation attempts.</li>
          <li>No unlawful, infringing, or abusive content.</li>
          <li>No use of the service to violate confidentiality, privacy, or intellectual property rights.</li>
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Service Changes and Availability</h2>
        <p className="u-text-2">
          We may update features, limits, and provider integrations to maintain reliability and security. Availability may
          depend on third-party infrastructure and model providers.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Liability and Warranty</h2>
        <p className="u-text-2">
          The service is provided on an as-available basis. Except where prohibited by law, liability is limited to the
          maximum extent permitted under applicable regulations.
        </p>
      </section>
    </SitePageShell>
  );
}
