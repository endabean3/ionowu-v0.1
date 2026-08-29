# Runbook — ionowu-web

Dokumen ini dituju langsung oleh anotasi `runbook_url` di setiap alert
(`observability/alerts/ionowu-web.rules.yaml`, OBS-08). Judul bagian sengaja
sama persis dengan nama alert supaya tautan jangkar tidak pernah patah.

| | |
| --- | --- |
| Aplikasi | `ionowu-web` |
| Jaringan privat | `ionowu-web-internal` |
| Database | `ionowu_web` (role runtime `ionowu_runtime`) |
| Prefiks Redis | `ionowu-web:` |
| Domain | https://ionowu.com |
| Pemilik & on-call | **[BELUM ADA]** — isi setelah rotasi ditetapkan (Tahap 1 no. 3) |

## Perintah dasar

```bash
docker compose -p ionowu-web ps
```

```bash
docker compose -p ionowu-web logs --since 30m web
```

Log aplikasi berbentuk satu baris JSON per kejadian dan selalu memuat
`trace_id`. Untuk menelusuri satu permintaan sampai ke trace-nya:

```bash
docker compose -p ionowu-web logs --since 1h web | grep '"level":"error"' | tail -20
```

---

## IonowuWebTidakSiap

**Arti:** `/health/ready` gagal lebih dari 2 menit. Pengunjung kemungkinan
besar sedang tidak dilayani.

1. Lihat isi balasan probe — endpoint ini menyebutkan pemeriksaan mana yang
   jatuh, tanpa membocorkan rahasia:

   ```bash
   curl -s https://ionowu.com/health/ready | python3 -m json.tool
   ```

2. Kalau `database` yang gagal: periksa kontainer Postgres dan koneksinya.

   ```bash
   docker compose -p ionowu-web exec postgres pg_isready
   ```

3. Kalau `contact_pipeline` atau `admin_auth` yang gagal, berarti ada variabel
   lingkungan yang hilang setelah deploy terakhir — bandingkan dengan
   `.env.example` lalu render ulang secret dari secret manager.

4. Kalau `/health/live` masih 200 sementara `ready` gagal, aplikasinya sehat
   dan masalahnya ada di dependensi. **Jangan** me-restart aplikasi; perbaiki
   dependensinya.

5. Kalau gejalanya muncul tepat setelah deploy, lakukan rollback
   (lihat [docs/deploy.md](deploy.md#rollback-dep-04)).

## IonowuWebLambat

**Arti:** readiness masih lulus tapi lebih dari 3 detik selama 10 menit.

1. Cek beban database — hampir selalu ini sumbernya:

   ```bash
   docker compose -p ionowu-web exec postgres \
     psql -U ionowu_web_owner -d ionowu_web \
     -c "select pid, state, wait_event_type, now() - query_start as lama, left(query, 80) from pg_stat_activity where state <> 'idle' order by lama desc limit 10;"
   ```

2. Cek apakah kontainer sedang mentok CPU atau memori (panel CPU/memori di
   dashboard `ionowu-web`).
3. Kalau antrean outbox menumpuk, cron mungkin berhenti dipanggil:

   ```bash
   docker compose -p ionowu-web exec postgres \
     psql -U ionowu_web_owner -d ionowu_web \
     -c "select status, count(*) from outbox_events group by status;"
   ```

## IonowuWebSeringRestart

**Arti:** kontainer restart 3 kali atau lebih dalam 15 menit — crash loop.

1. Baca alasan matinya:

   ```bash
   docker compose -p ionowu-web logs --tail 200 web
   ```

2. Penyebab paling umum, berurutan: variabel lingkungan wajib hilang, image
   baru yang rusak, dan OOM (cek `IonowuWebMendekatiBatasMemori`).
3. Kalau restart mulai tepat setelah deploy, rollback dulu, baru investigasi.
   Sistem yang stabil lebih penting daripada akar masalah yang cepat ketemu.

## IonowuWebMendekatiBatasMemori

**Arti:** pemakaian memori di atas 90% batas RUN-05.

1. Lihat kontainer mana yang naik di panel memori.
2. Kalau `web`: cek apakah ada lonjakan trafik atau kebocoran memori — bandingkan
   dengan periode 24 jam sebelumnya.
3. Menaikkan batas di `compose.yaml` adalah keputusan sadar, bukan refleks:
   catat alasannya di commit, karena batas itu bagian dari kepatuhan RUN-05.

## IonowuWebSertifikatSegeraKedaluwarsa

**Arti:** sertifikat TLS tersisa kurang dari 14 hari.

1. Perpanjangan ditangani Traefik/Dokploy secara otomatis. Cek log ACME-nya
   lebih dulu sebelum melakukan apa pun secara manual.
2. Kalau perpanjangan otomatis gagal, penyebab tersering adalah rekaman DNS
   yang berubah atau tantangan HTTP-01 yang terhalang.

---

## Kejadian lain yang tidak punya alert sendiri

### Email lead tidak sampai

Lead **tetap aman tersimpan** meski email gagal — pengiriman berjalan lewat
tabel outbox dan diulang cron. Jadi ini bukan kehilangan data.

```bash
curl -X POST https://ionowu.com/api/cron/outbox \
  -H "Authorization: Bearer $CRON_SECRET"
```

Kalau `status = failed` dan `last_error_code = resend_rejected`, masalahnya ada
di sisi Resend (kunci API atau verifikasi domain), bukan di aplikasi.

### Pemulihan database

Prosedur lengkap beserta uji pemulihan wajib ada di
[docs/deploy.md](deploy.md#uji-pemulihan-dat-07).
