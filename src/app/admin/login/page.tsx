import { signIn } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { isAdminAuthConfigured } from "@/lib/admin/env";

export const metadata = {
  title: "Admin Login · Ionowu",
};

export const dynamic = "force-dynamic";

/** proxy.ts menyimpan halaman tujuan sebelum melempar ke /admin/login lewat
 * `callbackUrl`. Nilainya datang dari URL (bisa dibuat pengunjung), jadi
 * WAJIB diperiksa dulu sebelum dipakai sebagai tujuan redirect — kalau
 * tidak, siapa pun bisa menyusun tautan admin/login yang mengarahkan
 * korban ke situs lain setelah berhasil masuk (open redirect). Hanya path
 * relatif yang diawali "/admin" dan bukan lompatan protokol yang diterima. */
function tujuanAmanSetelahLogin(callbackUrl: string | undefined): string {
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/admin")) {
    return "/admin";
  }
  if (callbackUrl.startsWith("//") || callbackUrl.includes("\\") || callbackUrl.includes("://")) {
    return "/admin";
  }
  return callbackUrl;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const adminAuthReady = isAdminAuthConfigured();
  const { callbackUrl } = await searchParams;
  const redirectTo = tujuanAmanSetelahLogin(callbackUrl);

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
                  await signIn("google", { redirectTo });
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
