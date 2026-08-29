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

1. CI hijau: `npm run check`, `npm run db:check`, `npm audit`, Trivy tanpa
   temuan HIGH/CRITICAL, ukuran image di bawah ambang, UID 65532 terverifikasi.
2. Image didorong dan ditandatangani.
3. Job `migrate` jalan sampai selesai (DAT-05). Service `web` menunggu
   `service_completed_successfully` — jadi aplikasi versi baru tidak pernah
   menyentuh skema yang belum bermigrasi.
4. Rollout `web` memakai `order: start-first` dengan dua replika (DEP-07):
   instance baru harus lulus `/health/ready` sebelum instance lama dihentikan.

```bash
docker compose -p ionowu-web pull
docker compose -p ionowu-web up -d
```

## Deployment tanpa downtime (DEP-07)

Cara membuktikannya, bukan sekadar mengasumsikan: jalankan pemantau permintaan
selama rollout dan pastikan tidak ada satu pun yang gagal.

```bash
while true; do curl -s -o /dev/null -w "%{http_code} " https://ionowu.com/health/live; sleep 0.5; done
```

Rollout dianggap lulus kalau seluruh keluaran `200` dari awal sampai akhir.

## Rollback (DEP-04)

```bash
IMAGE_TAG=<tag-sebelumnya> docker compose -p ionowu-web up -d
```

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
