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
const BUNDLE_CHECK_DEFS = [
  {
    key: "dashboardChunkGzipKb",
    label: "DashboardApp chunk gzip",
    chunkLabel: "DashboardApp",
    pattern: /^DashboardApp-[A-Za-z0-9_-]+\.js$/,
  },
  {
    key: "vendorMiscChunkGzipKb",
    label: "vendor-misc chunk gzip",
    chunkLabel: "vendor-misc",
    pattern: /^vendor-misc-[A-Za-z0-9_-]+\.js$/,
  },
  {
    key: "searchPopupChunkGzipKb",
    label: "SearchPopup chunk gzip",
    chunkLabel: "SearchPopup",
    pattern: /^SearchPopup-[A-Za-z0-9_-]+\.js$/,
  },
  {
    key: "chatSidebarChunkGzipKb",
    label: "ChatSidebar chunk gzip",
    chunkLabel: "ChatSidebar",
    pattern: /^ChatSidebar-[A-Za-z0-9_-]+\.js$/,
  },
  {
    key: "createProjectPopupChunkGzipKb",
    label: "CreateProjectPopup chunk gzip",
    chunkLabel: "CreateProjectPopup",
    pattern: /^CreateProjectPopup-[A-Za-z0-9_-]+\.js$/,
  },
];

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
const checks = BUNDLE_CHECK_DEFS.map((definition) => {
  const budgetKb = parseFiniteBudget(budgetsJson.metrics, definition.key);
  const chunkName = findChunkByPattern(definition.pattern, definition.chunkLabel);
  const chunkPath = path.join(DIST_ASSETS_DIR, chunkName);

  return {
    key: definition.key,
    label: definition.label,
    budgetKb,
    measuredKb: toKb(gzipSize(chunkPath)),
    chunkName,
  };
});

const failures = checks.filter((check) => check.measuredKb > check.budgetKb);

const report = {
  generatedAt: new Date().toISOString(),
  reportOnly,
  budgets: Object.fromEntries(checks.map((check) => [check.key, check.budgetKb])),
  measured: Object.fromEntries(checks.map((check) => [check.key, check.measuredKb])),
  chunks: Object.fromEntries(checks.map((check) => [check.key, check.chunkName])),
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
