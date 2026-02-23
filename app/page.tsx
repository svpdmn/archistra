import Link from "next/link";
import { auth0 } from "@/lib/auth/session";
import { normalizeAuthClaims } from "@/lib/auth/claims";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function HomePage() {
  const session = await auth0.getSession();
  const isAuthenticated = Boolean(session?.user);
  const claims = session?.user ? normalizeAuthClaims(session.user as Record<string, unknown>) : null;
  const orgLabel = claims?.orgName || claims?.orgId || "No Org";

  return (
    <>
      <SiteNav isAuthenticated={isAuthenticated} email={claims?.email || null} orgLabel={orgLabel} />
      <main className="archistra-home">
        <section className="home-shell card-strong rounded-xl2">
          <p className="font-mono text-accent-400 text-xs tracking-widest">ENTERPRISE PLATFORM</p>
          <h1 className="home-title font-display">Fragments to Intelligence</h1>
          <p className="lead">
            AI-powered Strategy & Architecture Intelligence platform with secure Auth0 identity for B2C and B2B workflows.
          </p>
          <div className="home-actions">
            <Link
              href="/chat"
              className="btn btn-primary w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
            >
              Continue to Chat
            </Link>
            <Link
              href="/about"
              className="btn btn-ghost w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
            >
              Learn More
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
