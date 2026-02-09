import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIST_ASSETS_DIR = path.join(ROOT, "dist", "assets");
const BUDGET_PATH = path.join(ROOT, "config", "performance", "bundle-budgets.json");
const REPORT_DIR = path.join(ROOT, "performance-reports");
const REPORT_PATH = path.join(REPORT_DIR, "bundle-budget-report.json");
const reportOnly = process.argv.includes("--report-only");

const toKb = (bytes) => Number((bytes / 1024).toFixed(2));

const gzipSize = (filePath) => {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content, { level: 9 }).length;
};

const requireJson = (filePath, missingMessage) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(missingMessage);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const findChunkByPattern = (pattern, label) => {
  if (!fs.existsSync(DIST_ASSETS_DIR)) {
    throw new Error("dist/assets not found. Run npm run build first.");
  }
  const match = fs.readdirSync(DIST_ASSETS_DIR).find((name) => pattern.test(name));
  if (!match) {
    throw new Error(`Unable to find ${label} chunk in dist/assets`);
  }
  return match;
};

const parseFiniteBudget = (metrics, key) => {
  const raw = Number(metrics?.[key]);
  if (!Number.isFinite(raw)) {
    throw new Error(`Invalid budget value for "${key}" in ${BUDGET_PATH}`);
  }
  return raw;
};

const budgetsJson = requireJson(BUDGET_PATH, `${BUDGET_PATH} not found`);
const dashboardBudgetKb = parseFiniteBudget(budgetsJson.metrics, "dashboardChunkGzipKb");
const vendorMiscBudgetKb = parseFiniteBudget(budgetsJson.metrics, "vendorMiscChunkGzipKb");

const dashboardChunkName = findChunkByPattern(/^DashboardApp-[A-Za-z0-9_-]+\.js$/, "DashboardApp");
const vendorMiscChunkName = findChunkByPattern(/^vendor-misc-[A-Za-z0-9_-]+\.js$/, "vendor-misc");

const dashboardChunkPath = path.join(DIST_ASSETS_DIR, dashboardChunkName);
const vendorMiscChunkPath = path.join(DIST_ASSETS_DIR, vendorMiscChunkName);

const measuredDashboardKb = toKb(gzipSize(dashboardChunkPath));
const measuredVendorMiscKb = toKb(gzipSize(vendorMiscChunkPath));

const checks = [
  {
    key: "dashboardChunkGzipKb",
    label: "DashboardApp chunk gzip",
    measuredKb: measuredDashboardKb,
    budgetKb: dashboardBudgetKb,
  },
  {
    key: "vendorMiscChunkGzipKb",
    label: "vendor-misc chunk gzip",
    measuredKb: measuredVendorMiscKb,
    budgetKb: vendorMiscBudgetKb,
  },
];

const failures = checks.filter((check) => check.measuredKb > check.budgetKb);

const report = {
  generatedAt: new Date().toISOString(),
  reportOnly,
  budgets: {
    dashboardChunkGzipKb: dashboardBudgetKb,
    vendorMiscChunkGzipKb: vendorMiscBudgetKb,
  },
  measured: {
    dashboardChunkGzipKb: measuredDashboardKb,
    vendorMiscChunkGzipKb: measuredVendorMiscKb,
  },
  chunks: {
    dashboardChunkName,
    vendorMiscChunkName,
  },
  pass: failures.length === 0,
  failures,
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Bundle budget report written to ${REPORT_PATH}`);
for (const check of checks) {
  const status = check.measuredKb <= check.budgetKb ? "PASS" : "FAIL";
  console.log(`${status} ${check.label}: ${check.measuredKb}kB (budget ${check.budgetKb}kB)`);
}

if (failures.length > 0 && !reportOnly) {
  process.exit(1);
}
