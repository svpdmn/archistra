import Link from "next/link";
import { auth0 } from "@/lib/auth/session";
import { normalizeAuthClaims } from "@/lib/auth/claims";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function UnauthorizedPage() {
  const session = await auth0.getSession();
  const claims = session?.user ? normalizeAuthClaims(session.user as Record<string, unknown>) : null;
  const isAuthenticated = Boolean(session?.user);
  const orgLabel = claims?.orgName || claims?.orgId || "No Org";

  return (
    <>
      <SiteNav isAuthenticated={isAuthenticated} email={claims?.email || null} orgLabel={orgLabel} />
      <main className="archistra-home">
        <section className="home-shell card-strong rounded-xl2">
          <p className="font-mono text-accent-400 text-xs tracking-widest">ACCESS CONTROL</p>
          <h1 className="home-title font-display">Unauthorized</h1>
          <p className="lead">Your account is authenticated but does not have access to this workspace.</p>
          <div className="home-actions">
            <Link
              href="/"
              className="btn btn-primary w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
            >
              Return Home
            </Link>
            <a
              href="/auth/logout"
              className="btn btn-primary w-full sm:w-auto px-4 py-2.5 text-[0.8125rem] leading-[1.125rem] font-semibold font-alt"
            >
              Sign Out
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
