import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users, type adminRole } from "@/db/schema";
import { currentTenantId } from "@/db/tenant";

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
  const tenantId = currentTenantId();
  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      email,
      name: input.name ?? null,
      role: input.defaultRole ?? "viewer",
      status: "active",
      lastLoginAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [users.tenantId, users.email],
      set: {
        // `name` HANYA ikut ditulis kalau Google benar-benar mengirimnya.
        // Google tidak selalu menyertakan `name` di setiap login — kalau
        // field ini selalu diikutkan dengan `?? null`, satu kali saja
        // Google tidak mengirim nama, nama yang sudah tersimpan tertimpa
        // jadi kosong.
        ...(input.name ? { name: input.name } : {}),
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
    .where(
      and(
        eq(users.tenantId, currentTenantId()),
        eq(users.email, email.trim().toLowerCase()),
      ),
    )
    .limit(1);

  return user ?? null;
}
