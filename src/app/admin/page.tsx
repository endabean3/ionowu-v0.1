import { requireAdmin } from "@/lib/admin/policy";
import { Container, Section } from "@/components/ui/Container";

export const metadata = {
  title: "Admin · Ionowu",
};

export default async function AdminPage() {
  const session = await requireAdmin("admin:read");

  return (
    <main className="flex-1">
      <Section className="border-b border-line bg-surface-1/40">
        <Container>
          <p className="text-small font-medium text-accent">Admin</p>
          <h1 className="mt-3 text-h1 text-ink">Fondasi operasional</h1>
          <p className="mt-4 max-w-prose text-body text-ink-muted">
            Login, role, database lead, audit log, dan outbox sudah menjadi
            batas awal sebelum workspace lead dibangun.
          </p>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="card">
              <dt className="text-small text-ink-muted">Akun</dt>
              <dd className="mt-2 text-body text-ink">{session.user?.email}</dd>
            </div>
            <div className="card">
              <dt className="text-small text-ink-muted">Role</dt>
              <dd className="mt-2 text-body capitalize text-ink">
                {session.user?.role}
              </dd>
            </div>
            <div className="card">
              <dt className="text-small text-ink-muted">Status</dt>
              <dd className="mt-2 text-body text-ink">Protected</dd>
            </div>
          </dl>
        </Container>
      </Section>
    </main>
  );
}
