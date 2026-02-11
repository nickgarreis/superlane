import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUDGET_PATH = path.join(ROOT, "config", "quality", "any-usage-budgets.json");

const readJson = (filePath, missingMessage) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(missingMessage);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const sourceRoots = [path.join(ROOT, "src"), path.join(ROOT, "convex")];

const shouldSkipPath = (relativePath) => (
  relativePath.includes("/imports/")
  || relativePath.includes("/_generated/")
  || relativePath.includes("/__tests__/")
  || relativePath.endsWith(".test.ts")
  || relativePath.endsWith(".test.tsx")
);

const collectSourceFiles = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
      continue;
    }

    const relativePath = path.relative(ROOT, fullPath).replaceAll("\\", "/");
    if (shouldSkipPath(relativePath)) {
      continue;
    }

    files.push({ fullPath, relativePath });
  }

  return files;
};

const countAnyInFile = (content) => {
  const matches = content.match(/\bany\b/g);
  return matches ? matches.length : 0;
};

const budgetConfig = readJson(
  BUDGET_PATH,
  `Any usage budget config not found: ${BUDGET_PATH}`,
);

const files = sourceRoots
  .flatMap((root) => (fs.existsSync(root) ? collectSourceFiles(root) : []));

let totalAnyCount = 0;
const perFileCounts = new Map();

for (const file of files) {
  const content = fs.readFileSync(file.fullPath, "utf8");
  const count = countAnyInFile(content);
  totalAnyCount += count;
  if (count > 0) {
    perFileCounts.set(file.relativePath, count);
  }
}

const maxTotalAny = Number(budgetConfig.maxTotalAny);
if (!Number.isFinite(maxTotalAny)) {
  throw new Error(`Invalid maxTotalAny in ${BUDGET_PATH}`);
}

const maxAnyByFile = budgetConfig.maxAnyByFile ?? {};
const fileBudgetViolations = [];
for (const [relativePath, maxAny] of Object.entries(maxAnyByFile)) {
  const numericMaxAny = Number(maxAny);
  if (!Number.isFinite(numericMaxAny)) {
    throw new Error(`Invalid maxAnyByFile value for ${relativePath} in ${BUDGET_PATH}`);
  }
  const actual = perFileCounts.get(relativePath) ?? 0;
  if (actual > numericMaxAny) {
    fileBudgetViolations.push({ relativePath, actual, max: numericMaxAny });
  }
}

let failed = false;
if (totalAnyCount > maxTotalAny) {
  failed = true;
  console.error(
    `FAIL any usage total: ${totalAnyCount} (budget ${maxTotalAny})`,
  );
} else {
  console.log(
    `PASS any usage total: ${totalAnyCount} (budget ${maxTotalAny})`,
  );
}

if (fileBudgetViolations.length > 0) {
  failed = true;
  console.error("FAIL any usage per-file budgets:");
  for (const violation of fileBudgetViolations) {
    console.error(
      `- ${violation.relativePath}: ${violation.actual} (budget ${violation.max})`,
    );
  }
} else {
  console.log("PASS any usage per-file budgets.");
}

if (failed) {
  process.exit(1);
}
