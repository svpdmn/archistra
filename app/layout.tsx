import type { Metadata } from "next";
import "./globals.css";

function resolveBaseUrl(): URL {
  const value = process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000";
  return new URL(value);
}

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
    <html lang="en">
      <body className="grid-pattern">{children}</body>
    </html>
  );
}
