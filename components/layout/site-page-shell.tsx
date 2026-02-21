import { ReactNode } from "react";
import { auth0 } from "@/lib/auth/session";
import { normalizeAuthClaims } from "@/lib/auth/claims";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

type SitePageShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export async function SitePageShell({ eyebrow, title, lead, children }: SitePageShellProps) {
  const session = await auth0.getSession();
  const claims = session?.user ? normalizeAuthClaims(session.user as Record<string, unknown>) : null;
  const isAuthenticated = Boolean(session?.user);
  const orgLabel = claims?.orgName || claims?.orgId || "No Org";

  return (
    <>
      <SiteNav isAuthenticated={isAuthenticated} email={claims?.email || null} orgLabel={orgLabel} />
      <main className="content-page-root">
        <section className="content-page-shell card-strong rounded-xl2">
          <header className="content-page-header">
            <p className="font-mono text-accent-400 text-xs tracking-widest">{eyebrow}</p>
            <h1 className="content-page-title font-display">{title}</h1>
            <p className="lead">{lead}</p>
          </header>
          <div className="content-page-body">{children}</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
