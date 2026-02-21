import type { Metadata } from "next";
import { SitePageShell } from "@/components/layout/site-page-shell";

export const metadata: Metadata = {
  title: "Security",
  description: "Security practices for authentication, access controls, monitoring, and vulnerability reporting."
};

const controls = [
  "Centralized authentication and organization-aware role checks.",
  "Server-side secret handling and guarded API access.",
  "Request validation, rate limiting, and structured security logging.",
  "Operational monitoring for upstream failures and abuse signals."
];

export default async function SecurityPage() {
  return (
    <SitePageShell
      eyebrow="TRUST"
      title="Security posture built into the architecture."
      lead="Security controls are integrated into identity, request handling, and operational workflows."
    >
      <section className="content-section">
        <h2 className="content-section-title font-alt">Application Controls</h2>
        <ul className="content-list u-text-2">
          {controls.map((control) => (
            <li key={control}>{control}</li>
          ))}
        </ul>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Responsible Disclosure</h2>
        <p className="u-text-2">
          If you identify a security issue, report it to security@archistra.app with reproduction details, impact scope,
          and timeline information. Do not publicly disclose vulnerabilities before coordinated remediation.
        </p>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Operational Guidance</h2>
        <ul className="content-list u-text-2">
          <li>Use least privilege roles for all user accounts.</li>
          <li>Rotate API keys and secrets on a defined cadence.</li>
          <li>Review auth and API access logs for anomalous activity.</li>
        </ul>
      </section>
    </SitePageShell>
  );
}
