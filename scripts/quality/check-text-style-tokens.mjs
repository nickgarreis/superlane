import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const APP_DIR = path.join(ROOT, "src", "app");

const shouldSkipPath = (relativePath) => {
  if (relativePath.includes(".test.ts") || relativePath.includes(".test.tsx"))
    return true;
  if (relativePath.startsWith("src/imports/")) return true;
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

const DISALLOWED_PATTERNS = [
  {
    name: "arbitrary font utility",
    regex: /font-\[[^\]]+\]/g,
  },
  {
    name: "non-token font family utility",
    regex: /\bfont-(sans|serif|mono)\b/g,
  },
  {
    name: "heading role font-weight override",
    regex:
      /txt-role-(?:hero|screen-title|page-title|panel-title|section-title)[^"'`\n>]*\bfont-(?:thin|extralight|light|normal|medium|semibold|extrabold|black)\b|\bfont-(?:thin|extralight|light|normal|medium|semibold|extrabold|black)\b[^"'`\n>]*txt-role-(?:hero|screen-title|page-title|panel-title|section-title)/g,
  },
  {
    name: "arbitrary text size",
    regex: /text-\[[0-9.]+px\]/g,
  },
  {
    name: "arbitrary line-height",
    regex: /leading-\[[^\]]+\]/g,
  },
  {
    name: "arbitrary tracking",
    regex: /tracking-\[[^\]]+\]/g,
  },
  {
    name: "hardcoded text color (hex/rgba)",
    regex: /text-\[#|text-\[rgba/gi,
  },
];

const INLINE_TYPO_REGEX =
  /(fontSize|fontWeight|fontFamily|fontStyle|lineHeight|letterSpacing)\s*:\s*([^,}\n]+)/g;

const files = collectTsFiles(APP_DIR);
const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file.fullPath, "utf8");

  for (const rule of DISALLOWED_PATTERNS) {
    rule.regex.lastIndex = 0;
    const match = rule.regex.exec(content);
    if (match) {
      violations.push({
        path: file.relativePath,
        rule: rule.name,
        snippet: match[0],
      });
    }
  }

  INLINE_TYPO_REGEX.lastIndex = 0;
  let inlineMatch = INLINE_TYPO_REGEX.exec(content);
  while (inlineMatch) {
    const value = inlineMatch[2].trim().replace(/['"`]/g, "");
    const isAllowedValue =
      value === "inherit" ||
      value.startsWith("var(") ||
      value === "currentColor";

    if (!isAllowedValue) {
      violations.push({
        path: file.relativePath,
        rule: "inline typography style value",
        snippet: inlineMatch[0].trim(),
      });
      break;
    }

    inlineMatch = INLINE_TYPO_REGEX.exec(content);
  }
}

if (violations.length > 0) {
  console.error("Text style token check failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}: ${violation.rule} -> ${violation.snippet}`,
    );
  }
  process.exit(1);
}

console.log("Text style token check passed.");
