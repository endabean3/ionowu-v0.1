import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type adminRole } from "@/db/schema";

export type AdminRole = (typeof adminRole.enumValues)[number];

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  status: "active" | "disabled";
};

export async function upsertAdminUser(input: {
  email: string;
  name?: string | null;
  defaultRole?: AdminRole;
}): Promise<AdminUser | null> {
  const email = input.email.trim().toLowerCase();
  const [user] = await db
    .insert(users)
    .values({
      email,
      name: input.name ?? null,
      role: input.defaultRole ?? "viewer",
      status: "active",
      lastLoginAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: input.name ?? null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
    });

  return user ?? null;
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  return user ?? null;
}
