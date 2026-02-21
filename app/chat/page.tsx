import { redirect } from "next/navigation";
import { normalizeAuthClaims } from "@/lib/auth/claims";
import { auth0 } from "@/lib/auth/session";
import { ChatClient } from "./chat-client";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function ChatPage() {
  const chatAuthBypass = process.env.CHAT_AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production";
  const session = await auth0.getSession();

  if (!chatAuthBypass && !session?.user) {
    redirect("/auth/login?returnTo=/chat");
  }

  const claims = session?.user
      ? normalizeAuthClaims(session.user as Record<string, unknown>)
      : {
          sub: "guest",
          email: null,
          emailVerified: false,
          orgId: "public",
          orgName: "Public",
          roles: ["viewer"]
        };

  if (!chatAuthBypass && !claims.orgId) {
    redirect("/unauthorized");
  }

  return (
    <>
      <SiteNav isAuthenticated={Boolean(session?.user)} email={claims.email} orgLabel={claims.orgName || claims.orgId || "No Org"} />
      <ChatClient
        userEmail={claims.email}
        orgName={claims.orgName}
        orgId={claims.orgId || "public"}
        roles={claims.roles}
      />
      <SiteFooter />
    </>
  );
}
