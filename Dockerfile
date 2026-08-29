# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# Ionowu — image produksi untuk aplikasi `ionowu-web`
#
# Kepatuhan standar server:
#   IMG-01  multi-stage: deps -> builder -> runner (+ migrator terpisah)
#   IMG-02  seluruh base image dikunci ke digest, bukan tag mutable
#   IMG-03  digest dicatat lengkap di ARG di bawah supaya mudah dirotasi
#   IMG-05  runtime memakai distroless + output standalone Next.js
#   IMG-06  konteks build dipangkas lewat .dockerignore
#   RUN-01  runtime dan migrator berjalan sebagai UID 65532 (nonroot)
#   DAT-05  migrasi punya stage & service sendiri, bukan menumpang runtime
#
# Base image memakai Debian 13 (trixie), BUKAN Debian 12 (bookworm). Varian
# bookworm distroless masih membawa libssl3 3.0.18 yang kena satu CVE CRITICAL
# dan lima HIGH (CVE-2026-31789 dkk.) -- Trivy menolaknya, dan perbaikannya
# memang belum terbit di image itu. Trixie memakai OpenSSL 3.5 yang tidak
# terdampak. Stage build ikut trixie supaya distro build dan runtime sama.
#
# Rotasi digest: jalankan `npm run img:digests` lalu perbarui dua ARG ini.
# ---------------------------------------------------------------------------

ARG NODE_IMAGE=node:24-trixie-slim@sha256:50c3b2f6988dfc307b86e5301d69611af31f4789bdf232863b07d3b02fe55ae0
ARG RUNTIME_IMAGE=gcr.io/distroless/nodejs24-debian13:nonroot@sha256:774b7d020b24214835769e24c3544835526cd0288f0b094eae48e8b2c2429a79

# --- Stage 1: dependencies -------------------------------------------------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --ignore-scripts

# --- Stage 2: builder ------------------------------------------------------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `next build` menuntut dev dependency (TypeScript, ESLint, Tailwind); itu wajar
# karena stage ini dibuang dan tidak pernah ikut ke image akhir.
RUN npm run build

# --- Stage 3: migrator (DAT-05) -------------------------------------------
# Image terpisah untuk menjalankan migrasi Drizzle sebagai job sekali jalan.
# Sengaja TIDAK distroless karena drizzle-kit butuh node_modules penuh.
FROM ${NODE_IMAGE} AS migrator
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/db ./src/db
# RUN-01: UID/GID 65532 disamakan dengan konvensi distroless nonroot.
RUN groupadd --gid 65532 nonroot \
    && useradd --uid 65532 --gid 65532 --home-dir /home/nonroot --create-home nonroot \
    && chown -R 65532:65532 /app
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/node", "node_modules/drizzle-kit/bin.cjs"]
CMD ["migrate"]

# --- Stage 4: runner -------------------------------------------------------
FROM ${RUNTIME_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Output standalone sudah membawa node_modules seperlunya; public/ dan
# .next/static/ harus disalin manual (lihat docs `output` bawaan Next.js).
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=builder --chown=65532:65532 /app/public ./public
COPY --chown=65532:65532 docker/healthcheck.mjs ./docker/healthcheck.mjs

USER 65532:65532
EXPOSE 3000

# Distroless tidak punya shell/curl, jadi probe dijalankan oleh node itu sendiri.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
    CMD ["/nodejs/bin/node", "docker/healthcheck.mjs"]

CMD ["server.js"]
