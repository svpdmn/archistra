import { NextRequest, NextResponse } from "next/server";

function withQuery(pathname: string, request: NextRequest): string {
  const query = request.nextUrl.search;
  return query ? `${pathname}${query}` : pathname;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string }> }
) {
  const { auth0: action } = await params;

  const allowed = new Set([
    "login",
    "logout",
    "callback",
    "me",
    "profile",
    "access-token",
    "backchannel-logout"
  ]);
  if (!allowed.has(action)) {
    return NextResponse.json({ error: "Unsupported auth action." }, { status: 404 });
  }

  const targetAction = action === "me" ? "profile" : action;

  // Compatibility route: delegates /api/auth/* style calls to /auth/* handled by Auth0 middleware.
  return NextResponse.redirect(new URL(withQuery(`/auth/${targetAction}`, request), request.url));
}
