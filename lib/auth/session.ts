import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { NextRequest, NextResponse } from "next/server";
import { AuthClaims, normalizeAuthClaims, AppRole, hasAnyRole } from "@/lib/auth/claims";

type AuthContext = {
  claims: AuthClaims;
};

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN,
  appBaseUrl: process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL,
  authorizationParameters: {
    scope: process.env.AUTH0_SCOPE || "openid profile email",
    ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {})
  },
  signInReturnToPath: "/chat"
});

function logAuthDenial(event: string, request: NextRequest, requestId: string, claims?: AuthClaims) {
  console.warn(
    JSON.stringify({
      event,
      requestId,
      path: request.nextUrl.pathname,
      sub: claims?.sub ?? null,
      orgId: claims?.orgId ?? null,
      roles: claims?.roles ?? [],
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    })
  );
}

export async function getSessionFromRequest(request?: NextRequest): Promise<SessionData | null> {
  if (request) return auth0.getSession(request);
  return auth0.getSession();
}

export async function requireApiAuth(
  request: NextRequest,
  options: {
    requestId: string;
    allowedRoles: readonly AppRole[];
    requireOrg?: boolean;
    requireVerifiedEmail?: boolean;
  }
): Promise<{ ok: true; context: AuthContext } | { ok: false; response: NextResponse }> {
  const session = await getSessionFromRequest(request);
  if (!session?.user) {
    logAuthDenial("auth_denied_unauthenticated", request, options.requestId);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required.", requestId: options.requestId },
        { status: 401 }
      )
    };
  }

  const claims = normalizeAuthClaims(session.user);

  if (!claims.sub) {
    logAuthDenial("auth_denied_invalid_identity", request, options.requestId, claims);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid session identity.", requestId: options.requestId },
        { status: 401 }
      )
    };
  }

  if (options.requireVerifiedEmail && !claims.emailVerified) {
    logAuthDenial("auth_denied_unverified_email", request, options.requestId, claims);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Email verification is required.", requestId: options.requestId },
        { status: 403 }
      )
    };
  }

  if (options.requireOrg !== false && !claims.orgId) {
    logAuthDenial("auth_denied_missing_org", request, options.requestId, claims);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Organization membership is required.", requestId: options.requestId },
        { status: 403 }
      )
    };
  }

  if (!hasAnyRole(claims, options.allowedRoles)) {
    logAuthDenial("auth_denied_insufficient_role", request, options.requestId, claims);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Insufficient permissions.", requestId: options.requestId },
        { status: 403 }
      )
    };
  }

  return {
    ok: true,
    context: { claims }
  };
}
