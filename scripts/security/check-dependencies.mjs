import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT_DIR = path.join(ROOT, "security-reports");
const REPORT_PATH = path.join(REPORT_DIR, "dependency-audit-report.json");

const runAudit = () => {
  try {
    return execSync("npm audit --json", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error && typeof error.stdout === "string") {
      return error.stdout;
    }
    throw error;
  }
};

const safeParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("Unable to parse npm audit JSON output.");
  }
};

const payload = safeParseJson(runAudit());
const totals = payload?.metadata?.vulnerabilities ?? {};
const vulnerabilities = payload?.vulnerabilities ?? {};

const high = Number(totals.high ?? 0);
const critical = Number(totals.critical ?? 0);
const moderate = Number(totals.moderate ?? 0);
const low = Number(totals.low ?? 0);

const moderateAndLow = Object.entries(vulnerabilities)
  .filter(([, vuln]) => vuln.severity === "moderate" || vuln.severity === "low")
  .map(([name, vuln]) => {
    const via = Array.isArray(vuln.via)
      ? vuln.via.map((entry) => (typeof entry === "string" ? entry : entry?.title ?? entry?.name ?? "unknown"))
      : [];
    return {
      name,
      severity: vuln.severity,
      isDirect: Boolean(vuln.isDirect),
      range: vuln.range ?? null,
      fixAvailable: vuln.fixAvailable ?? null,
      via,
      compensatingControl:
        "Current gate blocks high/critical only. Track package upgrades and keep production servers isolated from dev tooling attack surfaces.",
    };
  });

const report = {
  generatedAt: new Date().toISOString(),
  policy: {
    failOn: ["high", "critical"],
    note: "Moderate/low vulnerabilities are reported with compensating controls.",
  },
  totals: {
    critical,
    high,
    moderate,
    low,
    total: Number(totals.total ?? high + critical + moderate + low),
  },
  moderateAndLow,
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (high > 0 || critical > 0) {
  console.error("Dependency security check failed.");
  console.error(`- Critical: ${critical}`);
  console.error(`- High: ${high}`);
  console.error(`Report written to ${REPORT_PATH}`);
  process.exit(1);
}

console.log("Dependency security check passed (no high/critical vulnerabilities).");
console.log(`- Moderate: ${moderate}`);
console.log(`- Low: ${low}`);
console.log(`Report written to ${REPORT_PATH}`);
