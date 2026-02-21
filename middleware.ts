import { NextRequest, NextResponse } from "next/server";
import { auth0, getSessionFromRequest } from "@/lib/auth/session";
import { normalizeAuthClaims } from "@/lib/auth/claims";

const PROTECTED_PAGE_PATHS = new Set(["/chat"]);
const PROTECTED_API_PREFIXES = ["/api/chat", "/api/health/openai"];
const CHAT_AUTH_BYPASS = process.env.CHAT_AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production";

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let SDK handle auth lifecycle routes and cookie/session maintenance.
  const authResponse = await auth0.middleware(request);

  const requiresPageAuth = PROTECTED_PAGE_PATHS.has(pathname) && !(CHAT_AUTH_BYPASS && pathname === "/chat");
  const requiresApiAuth = isProtectedApi(pathname) && !(CHAT_AUTH_BYPASS && pathname.startsWith("/api/chat"));

  if (!requiresPageAuth && !requiresApiAuth) {
    return authResponse;
  }

  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    if (requiresApiAuth) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const returnTo = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/auth/login?returnTo=${returnTo}`, request.url));
  }

  const claims = normalizeAuthClaims(session.user);
  if (!claims.orgId) {
    if (requiresApiAuth) {
      return NextResponse.json({ error: "Organization membership is required." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/chat",
    "/api/chat/:path*",
    "/api/health/openai/:path*",
    "/auth/:path*"
  ]
};
