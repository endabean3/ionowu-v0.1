// Probe HEALTHCHECK untuk image distroless (tanpa shell, tanpa curl).
// Menembak /health/ready supaya kontainer baru dianggap sehat setelah
// dependensi wajibnya benar-benar siap, bukan sekadar proses hidup (RUN-08).
const port = process.env.PORT ?? "3000";
const url = `http://127.0.0.1:${port}/health/ready`;

try {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(4000),
    headers: { "user-agent": "ionowu-healthcheck" },
  });
  process.exit(response.ok ? 0 : 1);
} catch {
  process.exit(1);
}
