import type { Metadata } from "next";
import { SitePageShell } from "@/components/layout/site-page-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact archistra for platform support, enterprise inquiries, and security disclosures."
};

const channels = [
  {
    title: "General Inquiries",
    detail: "hello@archistra.app",
    note: "For partnership, product, and commercial discussions."
  },
  {
    title: "Support",
    detail: "support@archistra.app",
    note: "For workspace, access, and platform troubleshooting."
  },
  {
    title: "Security Reports",
    detail: "security@archistra.app",
    note: "For vulnerability disclosure and incident communication."
  }
];

export default async function ContactPage() {
  return (
    <SitePageShell
      eyebrow="CONTACT"
      title="Reach the team responsible for delivery and trust."
      lead="Choose the channel based on your request type to ensure the fastest resolution path."
    >
      <section className="content-section">
        <h2 className="content-section-title font-alt">Contact Channels</h2>
        <div className="content-grid">
          {channels.map((channel) => (
            <article key={channel.title} className="card content-card">
              <h3 className="font-alt">{channel.title}</h3>
              <p className="u-text-1 font-mono">{channel.detail}</p>
              <p className="u-text-2">{channel.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2 className="content-section-title font-alt">Response Objectives</h2>
        <ul className="content-list u-text-2">
          <li>Support requests: first response target within one business day.</li>
          <li>Security reports: acknowledgement target within 24 hours.</li>
          <li>Enterprise inquiries: triage and owner assignment within two business days.</li>
        </ul>
      </section>
    </SitePageShell>
  );
}
