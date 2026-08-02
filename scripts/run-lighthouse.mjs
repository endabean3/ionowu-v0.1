import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const port = Number(process.env.QA_PORT ?? 3002);
const baseUrl = process.env.QA_BASE_URL ?? `http://127.0.0.1:${port}`;
const routes = ["/", "/en", "/zh", "/layanan", "/karya", "/kontak"];
const outputDir = path.join(process.cwd(), "test-results", "lighthouse");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let serverProcess;

fs.mkdirSync(outputDir, { recursive: true });

function score(result, key) {
  return Math.round((result.lhr.categories[key].score ?? 0) * 100);
}

function slugFor(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
}

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server belum siap.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready at ${baseUrl}`);
}

async function ensureServer() {
  try {
    const response = await fetch(baseUrl);
    if (response.ok) return;
  } catch {
    // Tidak ada server aktif, nyalakan next start di bawah.
  }

  serverProcess = spawn(
    "npm",
    ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_PUBLIC_SITE_URL: baseUrl },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  serverProcess.stdout.on("data", (data) => process.stdout.write(`[server] ${data}`));
  serverProcess.stderr.on("data", (data) => process.stderr.write(`[server] ${data}`));

  await waitForServer();
}

await ensureServer();

const chrome = await chromeLauncher.launch({
  chromePath: fs.existsSync(chromePath) ? chromePath : undefined,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const summaries = [];

try {
  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    const result = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });

    if (!result) {
      throw new Error(`Lighthouse failed for ${url}`);
    }

    const jsonPath = path.join(outputDir, `${slugFor(route)}.json`);
    fs.writeFileSync(jsonPath, result.report);

    summaries.push({
      route,
      performance: score(result, "performance"),
      accessibility: score(result, "accessibility"),
      bestPractices: score(result, "best-practices"),
      seo: score(result, "seo"),
      report: jsonPath,
    });
  }
} finally {
  await chrome.kill();
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }
}

const summaryPath = path.join(outputDir, "summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summaries, null, 2));

console.table(summaries.map(({ report, ...summary }) => summary));

const failing = summaries.filter(
  (summary) =>
    summary.performance < 70 ||
    summary.accessibility < 90 ||
    summary.bestPractices < 90 ||
    summary.seo < 90,
);

if (failing.length > 0) {
  console.error(`Lighthouse thresholds failed. See ${summaryPath}`);
  process.exit(1);
}
