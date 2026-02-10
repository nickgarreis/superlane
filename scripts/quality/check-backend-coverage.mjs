import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SUMMARY_PATH = path.join(ROOT, "security-reports", "coverage-backend", "coverage-summary.json");
const THRESHOLDS_PATH = path.join(ROOT, "config", "quality", "backend-coverage-thresholds.json");

const readJson = (filePath, missingMessage) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(missingMessage);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const thresholdsConfig = readJson(
  THRESHOLDS_PATH,
  `Coverage threshold config not found: ${THRESHOLDS_PATH}`,
);

const activePhase = String(thresholdsConfig.activePhase ?? "");
const activePhaseConfig = thresholdsConfig.phases?.[activePhase];

if (!activePhaseConfig?.thresholds) {
  throw new Error(`Invalid activePhase "${activePhase}" in ${THRESHOLDS_PATH}`);
}

const linesThreshold = Number(activePhaseConfig.thresholds.linesPct);
const functionsThreshold = Number(activePhaseConfig.thresholds.functionsPct);

if (!Number.isFinite(linesThreshold) || !Number.isFinite(functionsThreshold)) {
  throw new Error(`Invalid threshold values for phase "${activePhase}" in ${THRESHOLDS_PATH}`);
}

const summary = readJson(
  SUMMARY_PATH,
  `Coverage summary not found: ${SUMMARY_PATH}. Run npm run test:backend:coverage first.`,
);

const total = summary.total;

if (!total?.lines || !total?.functions) {
  throw new Error(`Invalid coverage summary format: expected total.lines and total.functions in ${SUMMARY_PATH}`);
}

const linesPct = Number(total.lines.pct);
const functionsPct = Number(total.functions.pct);

if (!Number.isFinite(linesPct) || !Number.isFinite(functionsPct)) {
  throw new Error(`Coverage summary has non-finite totals in ${SUMMARY_PATH}`);
}

const checks = [
  { label: "Lines", actual: linesPct, threshold: linesThreshold },
  { label: "Functions", actual: functionsPct, threshold: functionsThreshold },
];

let failed = false;

console.log(`Backend coverage gate (${activePhase})`);
for (const check of checks) {
  const pass = check.actual >= check.threshold;
  const status = pass ? "PASS" : "FAIL";
  console.log(`${status} ${check.label}: ${check.actual}% (threshold ${check.threshold}%)`);
  if (!pass) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
