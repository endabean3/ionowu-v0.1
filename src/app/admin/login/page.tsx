import { signIn } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { isAdminAuthConfigured } from "@/lib/admin/env";

export const metadata = {
  title: "Admin Login · Ionowu",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const adminAuthReady = isAdminAuthConfigured();

  return (
    <main className="flex-1">
      <Section className="border-b border-line bg-surface-1/40">
        <Container>
          <div className="mx-auto max-w-prose">
            <Logo tinggi={32} />
            <h1 className="mt-10 text-h1 text-ink">Ionowu Admin</h1>
            <p className="mt-4 text-body text-ink-muted">
              {adminAuthReady
                ? "Masuk dengan akun Google internal yang sudah masuk allowlist."
                : "Admin belum aktif karena konfigurasi Google OAuth production belum lengkap."}
            </p>
            {adminAuthReady ? (
              <form
                className="mt-8"
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/admin" });
                }}
              >
                <Button type="submit" size="lg">
                  Masuk dengan Google
                </Button>
              </form>
            ) : null}
          </div>
        </Container>
      </Section>
    </main>
  );
}
