import type { Metadata } from "next";
import "./globals.css";
import { AmbientParticles } from "@/components/background/ambient-particles";

function resolveBaseUrl(): URL {
  const value = process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000";
  return new URL(value);
}

const themeInitScript = `
(() => {
  const key = "archistra-theme-mode";
  const valid = { system: true, light: true, dark: true };
  let mode = "system";

  try {
    const stored = localStorage.getItem(key);
    if (stored && valid[stored]) mode = stored;
  } catch (_error) {
    mode = "system";
  }

  const systemPrefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = resolved;
})();
`;

export const metadata: Metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    default: "archistra",
    template: "%s | archistra"
  },
  description: "Enterprise Strategy & Architecture Intelligence"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grid-pattern">
        <AmbientParticles />
        {children}
      </body>
    </html>
  );
}
