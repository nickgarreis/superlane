import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

const TARGETS = [
  path.join(ROOT, "src"),
  path.join(ROOT, "convex"),
  path.join(ROOT, "vite.config.ts"),
];

const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const BLOCKED_PATTERNS = [/@ts-ignore/, /@ts-expect-error/, /eslint-disable(?:-next-line|-line)?/];

const readDirectoryRecursively = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "_generated" || entry.name === "imports") {
        continue;
      }
      files.push(...readDirectoryRecursively(fullPath));
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

const collectFiles = () => {
  const files = [];
  for (const target of TARGETS) {
    if (!fs.existsSync(target)) {
      continue;
    }
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      files.push(...readDirectoryRecursively(target));
      continue;
    }
    files.push(target);
  }
  return files;
};

const violations = [];
for (const filePath of collectFiles()) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          filePath,
          line: index + 1,
          text: line.trim(),
        });
        break;
      }
    }
  });
}

if (violations.length > 0) {
  console.error("Found disallowed suppression comments:");
  for (const violation of violations) {
    const relativePath = path.relative(ROOT, violation.filePath);
    console.error(`- ${relativePath}:${violation.line} -> ${violation.text}`);
  }
  process.exit(1);
}

console.log("No disallowed suppression comments found.");
