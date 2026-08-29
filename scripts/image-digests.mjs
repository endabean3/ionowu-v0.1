/**
 * IMG-02/IMG-03 — pembantu rotasi digest base image.
 *
 * Seluruh image dikunci ke digest, jadi memperbaruinya tidak bisa cuma
 * "tarik tag terbaru". Skrip ini menanyakan digest yang sedang ditunjuk
 * setiap tag ke registry, lalu membandingkannya dengan yang tertulis di
 * Dockerfile dan compose.yaml. Tidak ada file yang diubah otomatis:
 * mengganti base image adalah keputusan sadar yang harus terlihat di diff.
 *
 *   npm run img:digests
 */
import { readFileSync } from "node:fs";

const IMAGES = [
  { registry: "registry-1.docker.io", auth: "docker", repo: "library/node", tag: "24-bookworm-slim" },
  { registry: "gcr.io", auth: "gcr", repo: "distroless/nodejs24-debian12", tag: "nonroot" },
  { registry: "registry-1.docker.io", auth: "docker", repo: "library/postgres", tag: "17-alpine" },
  { registry: "registry-1.docker.io", auth: "docker", repo: "library/redis", tag: "7-alpine" },
];

const ACCEPT = [
  "application/vnd.oci.image.index.v1+json",
  "application/vnd.docker.distribution.manifest.list.v2+json",
  "application/vnd.oci.image.manifest.v1+json",
  "application/vnd.docker.distribution.manifest.v2+json",
].join(",");

async function token({ auth, repo }) {
  const url =
    auth === "docker"
      ? `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repo}:pull`
      : `https://gcr.io/v2/token?service=gcr.io&scope=repository:${repo}:pull`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`gagal ambil token untuk ${repo}`);
  const body = await response.json();
  return body.token ?? body.access_token;
}

async function digest(image) {
  const bearer = await token(image);
  const response = await fetch(
    `https://${image.registry}/v2/${image.repo}/manifests/${image.tag}`,
    { method: "HEAD", headers: { Authorization: `Bearer ${bearer}`, Accept: ACCEPT } },
  );
  if (!response.ok) throw new Error(`gagal ambil manifest ${image.repo}:${image.tag}`);
  return response.headers.get("docker-content-digest");
}

const pinned = [readFileSync("Dockerfile", "utf8"), readFileSync("compose.yaml", "utf8")].join("\n");

let stale = 0;
for (const image of IMAGES) {
  const name = `${image.repo}:${image.tag}`;
  try {
    const current = await digest(image);
    const inSync = pinned.includes(current);
    if (!inSync) stale += 1;
    console.log(`${inSync ? "OK   " : "USANG"} ${name}\n      ${current}`);
  } catch (err) {
    stale += 1;
    console.log(`GAGAL ${name}\n      ${err.message}`);
  }
}

if (stale > 0) {
  console.log(
    `\n${stale} image belum sinkron. Perbarui digest di Dockerfile/compose.yaml, lalu jalankan ulang CI supaya Trivy memindai base image yang baru.`,
  );
  process.exit(1);
}
console.log("\nSemua digest sudah sinkron.");
