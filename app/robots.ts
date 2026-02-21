import type { MetadataRoute } from "next";

function resolveBaseUrl(): string {
  return process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/auth/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
