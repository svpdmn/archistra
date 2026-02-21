import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-shell card rounded-xl2">
        <div className="site-footer-grid">
          <section>
            <h2 className="site-footer-heading font-alt">Company</h2>
            <div className="site-footer-links">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </section>

          <section>
            <h2 className="site-footer-heading font-alt">Platform</h2>
            <div className="site-footer-links">
              <Link href="/chat">Chat Workspace</Link>
              <Link href="/security">Security</Link>
            </div>
          </section>

          <section>
            <h2 className="site-footer-heading font-alt">Legal</h2>
            <div className="site-footer-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </section>
        </div>

        <p className="site-footer-copy u-text-3 font-alt">© {year} archistra. Built on first principles.</p>
      </div>
    </footer>
  );
}
