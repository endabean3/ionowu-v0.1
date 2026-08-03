import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { AdminRole } from "@/lib/admin/users";

export type Permission =
  | "admin:read"
  | "lead:read"
  | "lead:write"
  | "lead:export"
  | "content:read"
  | "content:write"
  | "content:publish"
  | "user:manage"
  | "audit:read"
  | "outbox:process";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  owner: [
    "admin:read",
    "lead:read",
    "lead:write",
    "lead:export",
    "content:read",
    "content:write",
    "content:publish",
    "user:manage",
    "audit:read",
    "outbox:process",
  ],
  sales: ["admin:read", "lead:read", "lead:write"],
  editor: ["admin:read", "content:read", "content:write"],
  viewer: ["admin:read"],
};

export function hasPermission(role: AdminRole | undefined, permission: Permission) {
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

export async function requireAdmin(permission: Permission = "admin:read") {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !hasPermission(role, permission)) {
    redirect("/admin/login");
  }

  return session;
}
