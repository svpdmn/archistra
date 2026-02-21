import { z } from "zod";

export const ROLE_VALUES = ["owner", "admin", "member", "viewer"] as const;
export type AppRole = (typeof ROLE_VALUES)[number];

export type AuthClaims = {
  sub: string;
  email: string | null;
  emailVerified: boolean;
  orgId: string | null;
  orgName: string | null;
  roles: AppRole[];
};

const roleSchema = z.enum(ROLE_VALUES);
const rolesSchema = z.array(roleSchema);

const DEFAULT_NAMESPACE = "https://archistra.app";

function normalizeNamespace(raw: string): string {
  const namespace = raw.trim();
  return namespace.endsWith("/") ? namespace.slice(0, -1) : namespace;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function readNamespacedClaim(user: Record<string, unknown>, key: string): unknown {
  const namespace = normalizeNamespace(process.env.AUTH0_CLAIMS_NAMESPACE || DEFAULT_NAMESPACE);
  return user[`${namespace}/${key}`];
}

export function normalizeAuthClaims(user: Record<string, unknown>): AuthClaims {
  const rawRoles = readNamespacedClaim(user, "roles");
  const parsedRoles = rolesSchema.safeParse(rawRoles);
  const roles = parsedRoles.success ? parsedRoles.data : [];

  return {
    sub: asString(user.sub) || "",
    email: asString(user.email),
    emailVerified: asBoolean(user.email_verified),
    orgId: asString(readNamespacedClaim(user, "org_id")) || asString(user.org_id),
    orgName: asString(readNamespacedClaim(user, "org_name")) || asString(user.org_name),
    roles
  };
}

export function hasAnyRole(claims: AuthClaims, allowedRoles: readonly AppRole[]): boolean {
  return claims.roles.some((role) => allowedRoles.includes(role));
}
