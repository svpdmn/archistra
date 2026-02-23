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
              <Link href="/chat">Chat</Link>
              <span className="u-text-2">Templates</span>
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
        <nav aria-label="Social media links" className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-alt">
          <a
            href="https://discord.gg/SZ9PXJfG"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M20.3 4.37A19.8 19.8 0 0 0 15.9 3c-.2.35-.43.82-.58 1.2a18.4 18.4 0 0 0-5.63 0c-.16-.38-.4-.85-.59-1.2a19.7 19.7 0 0 0-4.4 1.37C1.9 8.6 1.18 12.74 1.54 16.82A19.9 19.9 0 0 0 7.45 19.8c.47-.65.9-1.35 1.25-2.09-.7-.27-1.36-.6-1.98-.99.16-.12.32-.24.47-.37 3.8 1.78 7.91 1.78 11.66 0 .16.13.32.25.48.37-.62.4-1.3.72-2 .99.36.74.78 1.43 1.26 2.09a19.8 19.8 0 0 0 5.9-2.98c.42-4.73-.72-8.83-3.18-12.45ZM9.53 14.32c-1.15 0-2.1-1.05-2.1-2.34 0-1.3.93-2.34 2.1-2.34 1.17 0 2.12 1.05 2.1 2.34 0 1.3-.93 2.34-2.1 2.34Zm4.94 0c-1.16 0-2.1-1.05-2.1-2.34 0-1.3.93-2.34 2.1-2.34 1.17 0 2.12 1.05 2.1 2.34 0 1.3-.93 2.34-2.1 2.34Z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/archistraAI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.13V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86V21h-4V9Z" />
            </svg>
          </a>
          <a
            href="https://x.com/archistraAI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.6L6 22H2.8l7.2-8.2L.8 2h6.4l4.5 6 5.2-6Z" />
            </svg>
          </a>
          <a
            href="https://youtube.com/@archistraAI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="u-text-2 hover:text-accent-400 u-calm inline-flex h-8 w-8 items-center justify-center"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1A31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
