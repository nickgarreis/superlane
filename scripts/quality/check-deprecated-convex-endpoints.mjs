import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_DIR = path.join(ROOT, "src", "app");

const DISALLOWED_PATTERNS = [
  {
    label: "api.dashboard.getSnapshot",
    regex: /\bapi\.dashboard\.getSnapshot\b/,
  },
  {
    label: "api.dashboard.getWorkspaceContext",
    regex: /\bapi\.dashboard\.getWorkspaceContext\b/,
  },
  {
    label: "api.dashboard.getActiveWorkspaceSummary",
    regex: /\bapi\.dashboard\.getActiveWorkspaceSummary\b/,
  },
  {
    label: "api.settings.getCompanySettings",
    regex: /\bapi\.settings\.getCompanySettings\b/,
  },
  {
    label: "api.files.listForProject",
    regex: /\bapi\.files\.listForProject\b/,
  },
];

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
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const violations = [];
for (const filePath of collectSourceFiles(APP_DIR)) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.regex.test(line)) {
        violations.push({
          filePath: path.relative(ROOT, filePath),
          line: index + 1,
          endpoint: pattern.label,
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Deprecated Convex endpoints referenced in src/app:");
  for (const violation of violations) {
    console.error(
      `- ${violation.filePath}:${violation.line} uses ${violation.endpoint}`,
    );
  }
  process.exit(1);
}

console.log("No deprecated Convex endpoints referenced in src/app.");
