import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAX_FEATURE_FILE_LINES = 350;

const LEGACY_OVERSIZED_ALLOWLIST = new Set([
  "convex/settings.ts",
  "convex/workspaces.ts",
  "convex/files.ts",
  "convex/projects.ts",
  "convex/dateNormalization.ts",
  "convex/auth.ts",
  "convex/comments.ts",
  "convex/notificationsEmail.ts",
  "src/app/components/chat-sidebar/ChatSidebarPanel.tsx",
  "src/app/dashboard/useDashboardWorkspaceActions.ts",
  "src/app/components/project-tasks/ProjectTaskRows.tsx",
  "src/app/components/create-project-popup/steps/StepDetails.tsx",
  "src/app/components/MainContent.tsx",
  "src/app/dashboard/hooks/useDashboardProjectActions.ts",
]);

const shouldSkipPath = (relativePath) => {
  if (relativePath.startsWith("src/imports/")) return true;
  if (relativePath.startsWith("src/app/components/ui/")) return true;
  if (relativePath.startsWith("convex/_generated/")) return true;
  if (relativePath.startsWith("convex/__tests__/")) return true;
  if (relativePath.includes(".test.ts") || relativePath.includes(".test.tsx")) return true;
  return false;
};

const collectTsFiles = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
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

const files = [
  ...collectTsFiles(path.join(ROOT, "src", "app")),
  ...collectTsFiles(path.join(ROOT, "convex")),
];

const violations = [];
const legacyWarnings = [];

for (const file of files) {
  const lines = fs.readFileSync(file.fullPath, "utf8").split(/\r?\n/).length;
  if (lines <= MAX_FEATURE_FILE_LINES) {
    continue;
  }

  if (LEGACY_OVERSIZED_ALLOWLIST.has(file.relativePath)) {
    legacyWarnings.push({ path: file.relativePath, lines });
    continue;
  }

  violations.push({ path: file.relativePath, lines });
}

if (legacyWarnings.length > 0) {
  console.warn(`Legacy oversized files allowed temporarily (>${MAX_FEATURE_FILE_LINES} lines):`);
  for (const warning of legacyWarnings.sort((a, b) => b.lines - a.lines)) {
    console.warn(`- ${warning.path}: ${warning.lines} lines`);
  }
}

if (violations.length > 0) {
  console.error(`Feature file size check failed (>${MAX_FEATURE_FILE_LINES} lines):`);
  for (const violation of violations.sort((a, b) => b.lines - a.lines)) {
    console.error(`- ${violation.path}: ${violation.lines} lines`);
  }
  process.exit(1);
}

console.log("Feature file size check passed.");
