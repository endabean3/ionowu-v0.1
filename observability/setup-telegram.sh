#!/usr/bin/env bash
# Menyambungkan Alertmanager ke Telegram.
#
# Dijalankan LANGSUNG DI SERVER oleh pemilik bot. Bot token dibaca dari prompt
# tersembunyi, bukan dari argumen perintah — argumen akan tersimpan di riwayat
# shell dan terlihat di `ps` oleh proses lain di host yang sama.
#
#   ssh root@76.13.16.85
#   cd /opt/ionowu-monitoring && ./setup-telegram.sh
#
# Sebelum menjalankan, siapkan dua hal dari Telegram:
#   1. Bot token — chat @BotFather, kirim /newbot, ikuti langkahnya.
#   2. Chat ID   — kirim satu pesan ke bot itu, lalu buka
#      https://api.telegram.org/bot<TOKEN>/getUpdates dan ambil
#      angka di "chat":{"id": ...}. Untuk grup, angkanya diawali tanda minus.

set -euo pipefail

cd "$(dirname "$0")"

TEMPLATE=alertmanager.yml.template
SECRETS=secrets
TOKEN_FILE="$SECRETS/telegram-bot-token"
RENDERED="$SECRETS/alertmanager.yml"

[ -f "$TEMPLATE" ] || { echo "Templat $TEMPLATE tidak ditemukan."; exit 1; }

read -rsp "Bot token Telegram: " BOT_TOKEN; echo
read -rp  "Chat ID           : " CHAT_ID

[ -n "$BOT_TOKEN" ] || { echo "Token kosong."; exit 1; }
# Chat ID grup diawali minus, chat pribadi tidak — dua-duanya sah.
[[ "$CHAT_ID" =~ ^-?[0-9]+$ ]] || { echo "Chat ID harus berupa angka (grup diawali tanda minus)."; exit 1; }

echo
echo "==> Menguji kredensial ke Telegram sebelum apa pun ditulis"
# Diuji lebih dulu supaya token yang salah ketahuan sekarang, bukan nanti saat
# situs benar-benar mati dan notifikasinya diam-diam gagal terkirim.
RESP=$(curl -s --max-time 15 -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  -d "parse_mode=HTML" \
  --data-urlencode 'text=<b>Ionowu</b> — uji sambungan Alertmanager. Kalau pesan ini sampai, jalur notifikasi sudah benar.')

if ! echo "$RESP" | grep -q '"ok":true'; then
  echo "GAGAL. Telegram menolak permintaan:"
  echo "$RESP" | head -c 400; echo
  echo
  echo "Tidak ada berkas yang ditulis. Periksa lagi token dan chat ID-nya."
  exit 1
fi
echo "    Terkirim. Cek Telegram Anda."

echo "==> Menulis rahasia"
# Direktori ikut dimiliki UID 65534, bukan cuma berkasnya. Kontainer
# Alertmanager berjalan sebagai pengguna itu, dan direktori 700 milik root
# membuatnya tidak bisa MENELUSURI folder -- berkas di dalamnya jadi tak
# terbaca walau kepemilikan berkasnya sendiri sudah benar. Ini sudah terbukti
# menjegal Prometheus pada 31 Agustus 2026.
install -d -m 700 -o 65534 -g 65534 "$SECRETS"
printf '%s' "$BOT_TOKEN" > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
# UID 65534 = pengguna nonroot di dalam kontainer Alertmanager.
chown 65534:65534 "$TOKEN_FILE" 2>/dev/null || true

echo "==> Merender konfigurasi"
sed "s/GANTI_CHAT_ID/${CHAT_ID}/" "$TEMPLATE" > "$RENDERED"
chmod 640 "$RENDERED"
chown 65534:65534 "$RENDERED" 2>/dev/null || true

echo "==> Memeriksa konfigurasi dengan amtool"
docker run --rm --entrypoint amtool \
  -v "$(pwd)/$SECRETS:/cfg:ro" \
  prom/alertmanager:v0.34.0@sha256:690c7b525f4367aa91f73e2f91c632206d32e97c6384bdbf2fb7a861b420340d \
  check-config /cfg/alertmanager.yml

echo "==> Menyalakan Alertmanager"
docker compose up -d alertmanager
docker compose exec -T prometheus wget -q -O /dev/null --post-data='' http://127.0.0.1:9090/-/reload 2>/dev/null \
  || curl -s -o /dev/null -X POST http://127.0.0.1:9090/-/reload

echo
echo "Selesai. Periksa hasilnya:"
echo "  docker compose ps"
echo "  curl -s http://127.0.0.1:9090/api/v1/alertmanagers | head -c 200"
