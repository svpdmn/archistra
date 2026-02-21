import Link from "next/link";
import { auth0 } from "@/lib/auth/session";
import { normalizeAuthClaims } from "@/lib/auth/claims";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function NotFoundPage() {
  const session = await auth0.getSession();
  const claims = session?.user ? normalizeAuthClaims(session.user as Record<string, unknown>) : null;
  const isAuthenticated = Boolean(session?.user);
  const orgLabel = claims?.orgName || claims?.orgId || "No Org";

  return (
    <>
      <SiteNav isAuthenticated={isAuthenticated} email={claims?.email || null} orgLabel={orgLabel} />
      <main className="archistra-home">
        <section className="home-shell card-strong rounded-xl2">
          <p className="font-mono text-accent-400 text-xs tracking-widest">404</p>
          <h1 className="home-title font-display">Page not found</h1>
          <p className="lead">The page you requested does not exist or may have moved.</p>
          <div className="home-actions">
            <Link href="/" className="btn btn-primary btn-size-page w-full sm:w-auto font-semibold font-alt">
              Return Home
            </Link>
            <Link href="/contact" className="btn btn-ghost btn-size-page w-full sm:w-auto font-semibold font-alt">
              Contact Support
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
