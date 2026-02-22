import Link from "next/link";
import Image from "next/image";
import { AuthSlot } from "@/components/nav/auth-slot";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type SiteNavProps = {
  isAuthenticated: boolean;
  email: string | null;
  orgLabel: string;
};

export function SiteNav({ isAuthenticated, email, orgLabel }: SiteNavProps) {
  return (
    <nav className="site-nav fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-semibold font-display logo-glow">
              archistra
            </Link>
          </div>

          <div className="flex justify-center">
            <Link href="/" aria-label="Archistra home">
              <Image src="/assets/archistra-logo.svg" alt="Archistra logo" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10" />
            </Link>
          </div>

          <div className="flex items-center justify-end">
            <div className="hidden md:flex items-center justify-end gap-8 font-alt text-xs tracking-wider">
              <Link href="/" className="u-text-2 hover:text-accent-400 u-calm">
                HOME
              </Link>
              <Link href="/about" className="u-text-2 hover:text-accent-400 u-calm">
                ABOUT
              </Link>
              <Link href="/security" className="u-text-2 hover:text-accent-400 u-calm">
                SECURITY
              </Link>
              <Link href="/contact" className="u-text-2 hover:text-accent-400 u-calm">
                CONTACT
              </Link>
              <Link href="/chat" className="u-text-2 hover:text-accent-400 u-calm">
                CHAT
              </Link>
              <ThemeToggle className="theme-toggle-nav" />
              <AuthSlot isAuthenticated={isAuthenticated} email={email} orgLabel={orgLabel} />
            </div>

            <div className="md:hidden">
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <Link href="/" className="u-text-2 hover:text-accent-400 u-calm text-[11px] tracking-wider font-alt">
                  HOME
                </Link>
                <Link href="/about" className="u-text-2 hover:text-accent-400 u-calm text-[11px] tracking-wider font-alt">
                  ABOUT
                </Link>
                <Link href="/contact" className="u-text-2 hover:text-accent-400 u-calm text-[11px] tracking-wider font-alt">
                  CONTACT
                </Link>
                <Link href="/chat" className="u-text-2 hover:text-accent-400 u-calm text-[11px] tracking-wider font-alt">
                  CHAT
                </Link>
                <ThemeToggle />
                <AuthSlot isAuthenticated={isAuthenticated} email={email} orgLabel={orgLabel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
