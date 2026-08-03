import type { DefaultSession } from "next-auth";
import type { AdminRole } from "@/lib/admin/users";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
      role?: AdminRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: AdminRole;
  }
}
