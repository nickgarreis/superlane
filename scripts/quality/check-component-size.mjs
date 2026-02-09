import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const APP_DIR = path.join(ROOT, "src", "app");
const MAX_COMPONENT_LINES = 1200;
const WARN_COMPONENT_LINES = 900;

const shouldSkipPath = (filePath) => {
  const relative = path.relative(ROOT, filePath).replaceAll("\\", "/");
  return (
    relative.includes("/components/ui/")
    || relative.endsWith(".test.tsx")
    || relative.endsWith(".test.ts")
  );
};

const collectTsxFiles = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsxFiles(fullPath));
      continue;
    }
    if (!entry.name.endsWith(".tsx")) {
      continue;
    }
    if (shouldSkipPath(fullPath)) {
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const fileLineCounts = collectTsxFiles(APP_DIR).map((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  return {
    filePath,
    lines: content.split(/\r?\n/).length,
  };
});

const overLimit = fileLineCounts.filter((entry) => entry.lines > MAX_COMPONENT_LINES);
if (overLimit.length > 0) {
  console.error(`Component size check failed (>${MAX_COMPONENT_LINES} lines):`);
  for (const entry of overLimit) {
    console.error(`- ${path.relative(ROOT, entry.filePath)}: ${entry.lines} lines`);
  }
  process.exit(1);
}

const warnings = fileLineCounts
  .filter((entry) => entry.lines > WARN_COMPONENT_LINES && entry.lines <= MAX_COMPONENT_LINES)
  .sort((a, b) => b.lines - a.lines);

if (warnings.length > 0) {
  console.warn(`Component size warning (>${WARN_COMPONENT_LINES} lines):`);
  for (const entry of warnings) {
    console.warn(`- ${path.relative(ROOT, entry.filePath)}: ${entry.lines} lines`);
  }
}

console.log("Component size check passed.");
