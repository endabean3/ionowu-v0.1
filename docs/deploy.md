# Deployment — ionowu-web

## Bentuk artefak

Satu commit menghasilkan dua image, keduanya ditandatangani cosign (IMG-12):

| Image | Stage Dockerfile | Isi |
| --- | --- | --- |
| `ghcr.io/<owner>/ionowu-web` | `runner` | distroless, UID 65532, output standalone Next.js |
| `ghcr.io/<owner>/ionowu-web-migrate` | `migrator` | drizzle-kit untuk job migrasi |

Seluruh base image dikunci ke digest. Untuk merotasinya:

```bash
npm run img:digests
```

## Verifikasi tanda tangan sebelum deploy

```bash
cosign verify ghcr.io/<owner>/ionowu-web@<digest> --certificate-identity-regexp '.*' --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Urutan deploy

`compose.yaml` MENOLAK jalan tanpa `IMAGE_DIGEST` dan `MIGRATE_DIGEST` diisi
(`${IMAGE_DIGEST:?digest wajib}`) — deploy per tag mengambang seperti `latest`
sudah tidak mungkin secara teknis, bukan sekadar konvensi (DEP-01, IMG-09).

1. CI hijau: `npm run check`, `npm run db:check`, `npm audit`, Trivy tanpa
   temuan HIGH/CRITICAL, ukuran image di bawah ambang, UID 65532 terverifikasi.
2. Kedua image didorong dan ditandatangani cosign; catat digest keduanya dan
   commit sha dari keluaran job `Build, scan, sign` di CI.
3. Di server, di `/etc/dokploy/compose/ionowu-web-cfa7zz/code/.env`, isi
   ketiganya sekaligus dari commit yang sama:

   ```bash
   IMAGE_DIGEST="sha256:<digest ionowu-web>"
   MIGRATE_DIGEST="sha256:<digest ionowu-web-migrate>"
   GIT_SHA="<commit sha penuh>"
   ```

   `GIT_SHA` mengisi `APP_VERSION` (lihat `compose.yaml`) — inilah yang
   membuat log dan trace produksi menyebut commit sungguhan, bukan cuma
   "main". Tanpa ini terisi, jatuh ke `IMAGE_TAG` sebagai cadangan supaya
   deploy lama tidak rusak, tapi cadangan itu tidak informatif saat insiden.

4. Tarik image dan jalankan migrasi sampai selesai lebih dulu (DAT-05):

   ```bash
   docker compose pull
   docker compose up migrate --exit-code-from migrate
   ```

   Service `web` juga menunggu `service_completed_successfully` sebelum
   naik — aplikasi versi baru tidak pernah menyentuh skema yang belum
   bermigrasi, sah selama Dokploy masih tipe Compose (lihat catatan DEP-07
   di bawah).

5. Naikkan aplikasi:

   ```bash
   docker compose up -d
   ```

## Deployment tanpa downtime (DEP-07) — BELUM terpenuhi

**Diukur, bukan diasumsikan, saat deploy 30 Agustus 2026:** probe dari luar
tiap 0,4 detik selama rollout mencatat 250 sukses dan **13 gagal, semuanya
502** — sekitar 5 detik situs benar-benar tidak melayani.

Penyebabnya struktural: `deploy.update_config.order: start-first` dan
`failure_action: rollback` di `compose.yaml` adalah direktif **Docker Swarm**.
Dokploy tipe **Compose** (yang dipakai sekarang) mengabaikannya —
`docker compose up -d` membuat ulang kedua replika sekaligus tanpa menunggu
yang baru lulus readiness.

Pindah ke Dokploy tipe **Application** (Swarm) memberi rolling update
sungguhan, tetapi Swarm mengabaikan `depends_on: service_completed_successfully`
secara diam-diam, sehingga jaminan migrasi selesai dulu (langkah 4 di atas)
hilang dan migrasi harus dipindah ke pre-deploy di host. Dua jaminan ini
saling meniadakan di infrastruktur sekarang — pilih salah satu, atau jalankan
rollout bertahap secara manual (matikan satu replika, tunggu yang baru sehat,
baru ganti replika kedua). Ini keputusan arsitektur pemilik, bukan sesuatu
yang bisa ditambal dari `compose.yaml`.

Untuk mengukur ulang downtime pada deploy berikutnya:

```bash
while true; do curl -s -o /dev/null -w "%{http_code} " https://ionowu.com/health/live; sleep 0.4; done
```

Kode selain `200` berarti downtime — hitung berapa banyak dan berapa detik.

## Rollback (DEP-04)

```bash
cd /etc/dokploy/compose/ionowu-web-cfa7zz/code
sed -i "s|^IMAGE_DIGEST=.*|IMAGE_DIGEST=\"sha256:<digest versi sebelumnya>\"|" .env
sed -i "s|^GIT_SHA=.*|GIT_SHA=\"<commit sebelumnya>\"|" .env
docker compose up -d
```

Digest versi sebelumnya selalu dicatat di `.env.bak-<timestamp>` yang dibuat
sebelum setiap deploy — jangan mengandalkan ingatan atau riwayat CI saat
tergesa.

Dua hal yang harus disepakati sebelum rollback dianggap aman:

- **Migrasi harus kompatibel mundur.** Versi aplikasi lama akan bertemu skema
  versi baru. Jadi migrasi tidak boleh menghapus atau mengganti nama kolom
  dalam rilis yang sama dengan kode yang berhenti memakainya — pisahkan jadi
  dua rilis (tulis dulu, hapus belakangan).
- **Rollback harus diuji, bukan diasumsikan.** Jalankan di staging setiap kali
  ada migrasi baru, dan catat hasilnya di tabel di bawah.

| Tanggal | Versi asal → tujuan | Lingkungan | Hasil | Penguji |
| --- | --- | --- | --- | --- |
| _[BELUM ADA]_ | | staging | | |

## Uji pemulihan (DAT-07)

Backup yang belum pernah dipulihkan belum bisa disebut backup. Volume yang
masuk cakupan backup diberi label di `compose.yaml` (DAT-04).

1. Ambil dump dari backup terakhir.
2. Pulihkan ke database sekali pakai:

   ```bash
   createdb ionowu_web_restore_test
   pg_restore --no-owner --dbname ionowu_web_restore_test <berkas-backup>
   ```

3. Periksa data benar-benar utuh, bukan sekadar perintah selesai tanpa error:

   ```sql
   select count(*) from leads;
   select max(created_at) from leads;
   select count(*) from audit_logs;
   select count(*) from tenants;
   ```

4. Bandingkan jumlah lead dan waktu lead terakhir dengan produksi. Selisihnya
   tidak boleh lebih besar dari jeda backup.
5. Hapus database uji, lalu catat hasilnya di tabel berikut.

| Tanggal | Berkas backup | Lag data | Hasil | Penguji |
| --- | --- | --- | --- | --- |
| _[BELUM ADA]_ | | | | |

## Yang masih harus dikerjakan di sisi server

Hal-hal berikut tidak bisa diselesaikan dari repo ini dan menunggu tindakan di
infrastruktur — lihat [docs/kepatuhan-server.md](kepatuhan-server.md).
