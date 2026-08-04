import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedAdminEmail } from "@/lib/admin/env";
import { getAdminUserByEmail, upsertAdminUser } from "@/lib/admin/users";

if (!process.env.AUTH_URL && process.env.NODE_ENV === "production") {
  process.env.AUTH_URL = "https://ionowu.com";
}

/* Callback jwt() dulu memanggil getAdminUserByEmail() di SETIAP permintaan
   ke /admin (proxy.ts memanggil auth() tiap request). Database dibebani
   tanpa perlu, dan kalau database sedang mati, semua admin langsung
   terkunci keluar. Sekarang role hanya dicek ulang tiap 5 menit — status
   nonaktif/role berubah tetap kepakai dalam waktu wajar, tapi tidak
   query di setiap klik. */
const ROLE_RECHECK_INTERVAL_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: Boolean(process.env.AUTH_URL) || process.env.NODE_ENV !== "production",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [Google],
  callbacks: {
    async signIn({ profile }) {
      const email = typeof profile?.email === "string"
        ? profile.email.toLowerCase()
        : "";
      if (!isAllowedAdminEmail(email)) return false;

      if ("email_verified" in (profile ?? {}) && profile?.email_verified !== true) {
        return false;
      }

      const user = await upsertAdminUser({
        email,
        name: profile?.name,
        defaultRole: "viewer",
      });

      return user?.status === "active";
    },
    async jwt({ token, trigger }) {
      if (!token.email) return token;

      if (!isAllowedAdminEmail(token.email)) {
        delete token.userId;
        delete token.role;
        delete token.roleCheckedAt;
        return token;
      }

      const isFresh =
        typeof token.roleCheckedAt === "number" &&
        Date.now() - token.roleCheckedAt < ROLE_RECHECK_INTERVAL_MS;

      if (trigger !== "signIn" && isFresh && token.userId) {
        return token;
      }

      const user = await getAdminUserByEmail(token.email);
      if (user?.status === "active") {
        token.userId = user.id;
        token.role = user.role;
      } else {
        delete token.userId;
        delete token.role;
      }
      token.roleCheckedAt = Date.now();

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        const role =
          token.role === "owner" ||
          token.role === "sales" ||
          token.role === "editor" ||
          token.role === "viewer"
            ? token.role
            : undefined;
        if (role) {
          session.user.role = role;
        }
      }
      return session;
    },
  },
});
