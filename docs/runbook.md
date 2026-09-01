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

## IonowuLeadGagalDikirim

**Arti:** ada event outbox berhenti di `failed` — percobaan ulang sudah habis.

**Yang TIDAK perlu dipanikkan:** lead-nya aman. `/api/kontak` menyimpan lead,
audit log, dan event outbox dalam satu transaksi sebelum email dicoba sama
sekali. Yang gagal hanya pemberitahuannya.

1. Lihat penyebabnya:

   ```bash
   docker exec ionowu-postgres psql -U postgres -d ionowu_web \
     -c "select id, status, attempts, last_error_code, created_at from outbox_events where status = 'failed' order by created_at desc limit 10;"
   ```

2. Baca `last_error_code`:
   - `resend_rejected` — Resend menolak. Hampir selalu konfigurasi: domain
     belum terverifikasi, alamat pengirim salah, atau tujuan tidak diizinkan.
     Uji langsung untuk melihat pesan aslinya:

     ```bash
     curl -s -X POST https://api.resend.com/emails -H "Authorization: Bearer $RESEND_API_KEY" -H "Content-Type: application/json" -d '{"from":"Ionowu <onboarding@resend.dev>","to":"io@ionowu.com","subject":"uji","html":"<p>uji</p>"}'
     ```

   - `resend_timeout` / `resend_exception` — gangguan sesaat; biasanya pulih
     sendiri pada percobaan berikutnya.
   - `invalid_payload` — event rusak; tidak akan membaik dengan diulang.

3. **Balas lead-nya secara manual dulu**, jangan menunggu emailnya jalan:

   ```bash
   docker exec ionowu-postgres psql -U postgres -d ionowu_web \
     -c "select name, email, company, service_type, message, created_at from leads order by created_at desc limit 5;"
   ```

4. Setelah penyebabnya diperbaiki, dorong ulang antreannya:

   ```bash
   curl -X POST https://ionowu.com/api/cron/outbox -H "Authorization: Bearer $CRON_SECRET"
   ```

## IonowuLeadTertahanTerlaluLama

**Arti:** ada event belum terkirim lebih dari 30 menit.

1. Paling sering: worker cron berhenti dipanggil. Picu manual dan lihat apakah
   antreannya bergerak:

   ```bash
   curl -X POST https://ionowu.com/api/cron/outbox -H "Authorization: Bearer $CRON_SECRET"
   ```

2. Kalau setelah itu event pindah ke `sent`, berarti masalahnya di penjadwal
   cron, bukan di aplikasi.
3. Kalau tetap tertahan, perlakukan seperti `IonowuLeadGagalDikirim` di atas.

## IonowuMetrikAplikasiHilang

**Arti:** Prometheus gagal scrape `/api/metrics`.

Ini alert tentang alat ukurnya sendiri. Selama menyala, dua alert lead di atas
**tidak bisa menyala sama sekali** — perlakukan sebagai kebutaan, bukan
gangguan kecil.

1. Uji endpointnya:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://ionowu.com/api/metrics -H "Authorization: Bearer $(cat /opt/ionowu-monitoring/secrets/metrics-token)"
   ```

2. `401` berarti token di `/opt/ionowu-monitoring/secrets/metrics-token` tidak
   lagi cocok dengan `METRICS_TOKEN` di Dokploy. Samakan keduanya.
3. `503` berarti aplikasi tidak bisa membaca database — periksa
   `/health/ready`.

## IonowuTracePenampungMati

**Arti:** Prometheus gagal scrape Jaeger selama 10 menit. Trace baru
kemungkinan tidak tersimpan. Situs sendiri tidak terdampak -- aplikasi
tetap melayani permintaan walau ekspor trace gagal.

1. Cek kontainernya:

   ```bash
   docker ps --format '{{.Names}}\t{{.Status}}' | grep jaeger
   docker logs --tail 50 ionowu-jaeger
   ```

2. Kalau kontainer mati, naikkan lagi:

   ```bash
   cd /opt/ionowu-monitoring && docker compose up -d jaeger
   ```

3. Kalau kontainer hidup tapi Prometheus tetap gagal scrape, periksa apakah
   `ionowu-jaeger` masih satu jaringan `ionowu-monitoring` dengan Prometheus.

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

---

## Stack pemantauan

Prometheus, blackbox_exporter, cAdvisor, dan Alertmanager berjalan di host
sebagai stack `ionowu-monitoring`, terpisah dari aplikasi. Berkasnya ada di
`/opt/ionowu-monitoring/` di server, sumbernya di `observability/` di repo ini.

UI Prometheus **tidak** diekspos ke internet — port hanya diikat ke loopback.
Menjangkaunya lewat SSH tunnel:

```bash
ssh -N -L 9090:127.0.0.1:9090 -L 9093:127.0.0.1:9093 -L 16686:127.0.0.1:16686 root@76.13.16.85
```

`http://localhost:9090` Prometheus, `http://localhost:9093` Alertmanager,
`http://localhost:16686` Jaeger (penelusuran trace per permintaan --
cari berdasarkan `trace_id` yang sama seperti di log JSON aplikasi).

Lalu buka `http://localhost:9090` — halaman **Alerts** memperlihatkan status
kelima aturan, **Targets** memperlihatkan apakah probe masih hidup.

Setelah mengubah `prometheus.yml` atau berkas di `alerts/`, muat ulang tanpa
kehilangan riwayat metrik:

```bash
ssh root@76.13.16.85 'curl -s -X POST http://127.0.0.1:9090/-/reload'
```

Berkas konfigurasi di-mount sebagai **direktori**, bukan berkas satuan, supaya
isi baru benar-benar terbaca setelah berkasnya diganti. Kalau suatu saat mount
itu diubah kembali jadi berkas satuan, `/-/reload` akan membalas 200 tanpa
mengubah apa pun — kontainer tetap terikat ke inode yang lama.

Periksa dulu sebelum memuat ulang — konfigurasi yang salah membuat Prometheus
menolak reload dan tetap memakai konfigurasi lama:

```bash
ssh root@76.13.16.85 'cd /opt/ionowu-monitoring && docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml'
```

### Notifikasi Telegram

Alert dikirim ke Telegram lewat Alertmanager. Bot token TIDAK ada di repo — ia
dibaca dari `/opt/ionowu-monitoring/secrets/telegram-bot-token`, yang dibuat
langsung di server.

Menyambungkan pertama kali, atau mengganti bot:

```bash
ssh root@76.13.16.85 'cd /opt/ionowu-monitoring && ./setup-telegram.sh'
```

Skrip itu menanyakan token lewat prompt tersembunyi (tidak masuk riwayat shell),
menguji kirim ke Telegram lebih dulu, dan baru menulis berkas kalau pesan uji
benar-benar sampai.

Memastikan jalurnya masih hidup:

```bash
ssh root@76.13.16.85 'curl -s http://127.0.0.1:9090/api/v1/alertmanagers'
```

Kalau `activeAlertmanagers` kosong, Prometheus sedang tidak punya tempat
mengirim alert — perlakukan itu sebagai gangguan, bukan detail kecil.

Membisukan alert sementara saat pemeliharaan terencana (dari UI Alertmanager di
`http://localhost:9093` lewat tunnel, menu **Silences**). Silence tersimpan di
volume, jadi tetap berlaku setelah restart.

> **Diam bukan berarti aman.** Kalau Alertmanager sendiri mati, tidak akan ada
> yang mengabari bahwa ia mati. Sekali-sekali buka halaman Alerts, dan pastikan
> alert uji masih bisa sampai setelah ada perubahan di stack pemantauan.
