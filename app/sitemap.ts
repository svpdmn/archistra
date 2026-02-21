import type { MetadataRoute } from "next";

function resolveBaseUrl(): string {
  return process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveBaseUrl();
  const now = new Date();

  return ["/", "/about", "/contact", "/security", "/privacy", "/terms", "/chat"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now
  }));
}
