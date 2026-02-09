import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIST_DIR = path.join(ROOT, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");
const ASSETS_DIR = path.join(DIST_DIR, "assets");
const BUDGET_PATH = path.join(ROOT, "config/performance/budgets.json");
const REPORT_DIR = path.join(ROOT, "performance-reports");
const REPORT_PATH = path.join(REPORT_DIR, "performance-budget-report.json");

const reportOnly = process.argv.includes("--report-only");

const toKb = (bytes) => Number((bytes / 1024).toFixed(2));

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const readRequiredFile = (filePath, message) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(message);
  }
  return fs.readFileSync(filePath, "utf8");
};

const parseAssetPath = (html, pattern, label) => {
  const match = html.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Could not find ${label} in dist/index.html`);
  }
  return match[1].replace(/^\/+/, "");
};

const gzipSizeBytes = (filePath) => {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content, { level: 9 }).length;
};

const statLargestAsset = () => {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets directory not found: ${ASSETS_DIR}`);
  }

  const entries = fs
    .readdirSync(ASSETS_DIR)
    .map((name) => {
      const filePath = path.join(ASSETS_DIR, name);
      const stat = fs.statSync(filePath);
      return {
        name,
        filePath,
        sizeBytes: stat.size,
        isFile: stat.isFile(),
      };
    })
    .filter((entry) => entry.isFile);

  if (entries.length === 0) {
    throw new Error(`No emitted files found in ${ASSETS_DIR}`);
  }

  return entries.reduce((largest, current) =>
    current.sizeBytes > largest.sizeBytes ? current : largest,
  );
};

const findDashboardAsset = () => {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets directory not found: ${ASSETS_DIR}`);
  }
  const match = fs
    .readdirSync(ASSETS_DIR)
    .find((entry) => /^DashboardApp-[A-Za-z0-9_-]+\.js$/.test(entry));

  if (!match) {
    throw new Error("Could not find DashboardApp chunk in dist/assets");
  }

  return match;
};

const html = readRequiredFile(INDEX_PATH, "dist/index.html not found. Run npm run build first.");
const budgetConfig = readJson(BUDGET_PATH);
const activePhase = String(budgetConfig.activePhase ?? "");
const activePhaseConfig = budgetConfig.phases?.[activePhase];

if (!activePhaseConfig?.metrics) {
  throw new Error(`Invalid active phase in ${BUDGET_PATH}: ${activePhase}`);
}

const parseFiniteMetric = (metrics, key) => {
  const rawMetric = metrics[key];
  const parsedMetric = Number(rawMetric);
  if (!Number.isFinite(parsedMetric)) {
    throw new Error(
      `Invalid performance budget metric "${key}" for phase "${activePhase}" in ${BUDGET_PATH}: expected a finite number but received ${String(rawMetric)}`,
    );
  }
  return parsedMetric;
};

const assertFiniteMetrics = (metricName, metrics) => {
  for (const [key, value] of Object.entries(metrics)) {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid ${metricName} value for "${key}": ${String(value)}`);
    }
  }
};

const entryJsAsset = parseAssetPath(html, /<script[^>]*src="([^"]+\.js)"[^>]*><\/script>/i, "entry JS asset");
const entryCssAsset = parseAssetPath(html, /<link[^>]*href="([^"]+\.css)"[^>]*>/i, "entry CSS asset");

const entryJsPath = path.join(DIST_DIR, entryJsAsset);
const entryCssPath = path.join(DIST_DIR, entryCssAsset);
const largestAsset = statLargestAsset();
const dashboardAsset = findDashboardAsset();
const dashboardAssetPath = path.join(ASSETS_DIR, dashboardAsset);

if (!fs.existsSync(entryJsPath)) {
  throw new Error(`Entry JS asset not found: ${entryJsPath}`);
}
if (!fs.existsSync(entryCssPath)) {
  throw new Error(`Entry CSS asset not found: ${entryCssPath}`);
}

const measured = {
  entryJsGzipKb: toKb(gzipSizeBytes(entryJsPath)),
  entryCssGzipKb: toKb(gzipSizeBytes(entryCssPath)),
  dashboardJsGzipKb: toKb(gzipSizeBytes(dashboardAssetPath)),
  largestAssetKb: toKb(largestAsset.sizeBytes),
};

const budgets = {
  entryJsGzipKb: parseFiniteMetric(activePhaseConfig.metrics, "entryJsGzipKb"),
  entryCssGzipKb: parseFiniteMetric(activePhaseConfig.metrics, "entryCssGzipKb"),
  dashboardJsGzipKb: parseFiniteMetric(activePhaseConfig.metrics, "dashboardJsGzipKb"),
  largestAssetKb: parseFiniteMetric(activePhaseConfig.metrics, "largestAssetKb"),
};

assertFiniteMetrics("measured metric", measured);
assertFiniteMetrics("budget metric", budgets);

const checks = [
  {
    key: "entryJsGzipKb",
    label: "Entry JS gzip",
    measured: measured.entryJsGzipKb,
    budget: budgets.entryJsGzipKb,
  },
  {
    key: "entryCssGzipKb",
    label: "Entry CSS gzip",
    measured: measured.entryCssGzipKb,
    budget: budgets.entryCssGzipKb,
  },
  {
    key: "dashboardJsGzipKb",
    label: "Dashboard chunk gzip",
    measured: measured.dashboardJsGzipKb,
    budget: budgets.dashboardJsGzipKb,
  },
  {
    key: "largestAssetKb",
    label: "Largest emitted asset",
    measured: measured.largestAssetKb,
    budget: budgets.largestAssetKb,
  },
];

const failures = checks
  .filter((check) => check.measured > check.budget)
  .map((check) => ({
    key: check.key,
    label: check.label,
    measuredKb: check.measured,
    budgetKb: check.budget,
  }));

const report = {
  generatedAt: new Date().toISOString(),
  activePhase,
  reportOnly,
  budgets,
  measured,
  assets: {
    entryJs: entryJsAsset,
    entryCss: entryCssAsset,
    dashboardJs: dashboardAsset,
    largest: {
      name: largestAsset.name,
      sizeKb: measured.largestAssetKb,
    },
  },
  pass: failures.length === 0,
  failures,
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Performance report written to ${REPORT_PATH}`);
for (const check of checks) {
  const status = check.measured <= check.budget ? "PASS" : "FAIL";
  console.log(`${status} ${check.label}: ${check.measured}kB (budget ${check.budget}kB)`);
}

if (failures.length > 0 && !reportOnly) {
  process.exit(1);
}
