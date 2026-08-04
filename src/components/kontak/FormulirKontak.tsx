"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input, Textarea, Select } from "@/components/ui/Field";
import { daftarLayanan } from "@/lib/data/layanan";
import { copy, type Locale } from "@/lib/i18n";

type Status = "idle" | "mengirim" | "berhasil" | "gagal";

/**
 * Formulir kontak.
 *
 * Pemeriksaan dilakukan dua kali: di sini (supaya pengunjung dapat umpan
 * balik cepat) dan di server (`/api/kontak` — dokumen 05: "jangan percaya
 * pemeriksaan browser"). Kalau JavaScript dimatikan atau pemeriksaan sisi
 * klien dilewati, server tetap menolak data yang tidak valid.
 *
 * STATUS PENGIRIMAN: lihat catatan di `src/app/api/kontak/route.ts` —
 * pesan belum benar-benar terkirim ke email sampai layanan pengirim
 * dipasang.
 */
export function FormulirKontak({ locale = "id" }: { locale?: Locale }) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pesanKesalahan, setPesanKesalahan] = useState("");
  // Pola inisialisasi malas untuk useRef: crypto.randomUUID() di argumen
  // useRef() dihitung ulang di SETIAP render meski hasilnya cuma dipakai
  // sekali — nilainya langsung dibuang React kalau ref sudah terisi. Cek
  // `=== null` di bawah memastikan randomUUID() hanya benar-benar
  // dipanggil sekali, saat pertama kali komponen dirender.
  const requestIdRef = useRef<string | null>(null);
  if (requestIdRef.current === null) {
    requestIdRef.current = crypto.randomUUID();
  }
  const c = copy[locale];
  const layanan = daftarLayanan(locale);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Simpan referensi form SEBELUM `await` di bawah. React mengosongkan
    // `e.currentTarget` begitu event selesai menyebar — dipakai lagi setelah
    // `await` akan bernilai null dan menyebabkan error yang tertangkap diam-diam
    // oleh blok catch (pesan jadi salah: seolah server tidak bisa dihubungi,
    // padahal request sebenarnya berhasil). Ketahuan lewat uji kirim sungguhan.
    const form = e.currentTarget;

    setStatus("mengirim");
    setFieldErrors({});
    setPesanKesalahan("");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.locale = locale;
    payload.request_id = requestIdRef.current!;

    try {
      const res = await fetch("/api/kontak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setPesanKesalahan(data.error ?? c.form.failed);
        setStatus("gagal");
        return;
      }

      setStatus("berhasil");
      form.reset();
      requestIdRef.current = crypto.randomUUID();
    } catch (err) {
      // Dicatat ke konsol supaya kesalahan sungguhan (bukan cuma masalah
      // jaringan) tidak tersembunyi di balik pesan generik di bawah.
      console.error("[FormulirKontak] gagal mengirim:", err);
      setPesanKesalahan(c.form.network);
      setStatus("gagal");
    }
  }

  if (status === "berhasil") {
    return (
      <div className="card flex items-start gap-4">
        <CheckCircle size={28} weight="fill" className="shrink-0 text-accent" aria-hidden />
        <div>
          {/* h2 supaya sejajar dengan judul "Waktu balasan" di halaman kontak —
              keduanya anak langsung dari <h1> halaman. Kalau h3, urutan judul
              melompat dan pembaca layar kehilangan strukturnya. */}
          <h2 className="text-h3 text-ink">{c.form.successTitle}</h2>
          <p className="mt-2 text-ink-muted">
            {c.form.successBody}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-small font-medium text-accent transition-colors duration-mid ease-out hover:text-ink"
          >
            {c.form.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Jebakan robot — disembunyikan secara visual (bukan `hidden`,
          supaya robot pengisi form otomatis tetap mengisinya), dan
          diabaikan pembaca layar. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="situs">{c.form.botField}</label>
        <input id="situs" name="situs" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FieldWrapper id="nama" label={c.form.name} wajib error={fieldErrors.nama}>
          <Input
            id="nama"
            name="nama"
            type="text"
            required
            autoComplete="name"
            error={fieldErrors.nama}
          />
        </FieldWrapper>

        <FieldWrapper id="email" label={c.form.email} wajib error={fieldErrors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
        </FieldWrapper>

        <FieldWrapper id="perusahaan" label={c.form.company} bantuan={c.form.optional}>
          <Input
            id="perusahaan"
            name="perusahaan"
            type="text"
            autoComplete="organization"
            bantuan={c.form.optional}
          />
        </FieldWrapper>

        <FieldWrapper id="kebutuhan" label={c.form.need} wajib error={fieldErrors.kebutuhan}>
          <Select
            id="kebutuhan"
            name="kebutuhan"
            required
            defaultValue=""
            error={fieldErrors.kebutuhan}
          >
            <option value="" disabled>
              {c.form.chooseOne}
            </option>
            {layanan.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.judul}
              </option>
            ))}
            <option value="lainnya">{c.form.other}</option>
          </Select>
        </FieldWrapper>
      </div>

      <div className="mt-6">
        <FieldWrapper
          id="pesan"
          label={c.form.message}
          wajib
          error={fieldErrors.pesan}
        >
          <Textarea
            id="pesan"
            name="pesan"
            required
            minLength={10}
            rows={5}
            error={fieldErrors.pesan}
          />
        </FieldWrapper>
      </div>

      <div className="mt-6">
        <FieldWrapper
          id="anggaran"
          label={c.form.budget}
          bantuan={c.form.budgetHelp}
        >
          <Select
            id="anggaran"
            name="anggaran"
            defaultValue=""
            bantuan={c.form.budgetHelp}
          >
            {c.form.budgets.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      </div>

      {status === "gagal" && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-signal/30 bg-signal/10 p-4">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-signal" aria-hidden />
          <p className="text-small text-ink">{pesanKesalahan}</p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "mengirim"}>
          {status === "mengirim" ? c.form.sending : c.form.submit}
        </Button>
        <p className="text-small text-ink-muted">{copy[locale].common.responseTime}</p>
      </div>
    </form>
  );
}
