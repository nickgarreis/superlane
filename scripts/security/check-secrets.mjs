import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ALLOWLIST_PATH = path.join(ROOT, "config/security/secret-scan-allowlist.json");

const SECRET_PATTERNS = [
  {
    id: "private-key-block",
    description: "Private key block",
    regex: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g,
  },
  {
    id: "github-token",
    description: "GitHub token",
    regex: /\bghp_[A-Za-z0-9]{20,}\b/g,
  },
  {
    id: "aws-access-key-id",
    description: "AWS access key id",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: "slack-token",
    description: "Slack token",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    id: "openai-style-key",
    description: "OpenAI-style key",
    regex: /\bsk-(?:live|test|proj)-[A-Za-z0-9]{10,}\b/g,
  },
  {
    id: "hardcoded-workos-secret",
    description: "Hardcoded WorkOS secret value",
    regex: /\b(?:WORKOS_API_KEY|WORKOS_WEBHOOK_SECRET|WORKOS_ACTION_SECRET)\b\s*[:=]\s*["'][^"'\n]{8,}["']/g,
  },
];

const DEFAULT_IGNORED_PATH_PREFIXES = [
  "node_modules/",
  "dist/",
  "convex/_generated/",
  "src/imports/",
  "security-reports/",
  "docs/private/",
];

const loadAllowlist = () => {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    return { ignoredPathPrefixes: [], ignoredMatches: [] };
  }
  return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
};

const allowlist = loadAllowlist();
const ignoredPathPrefixes = new Set([
  ...DEFAULT_IGNORED_PATH_PREFIXES,
  ...(allowlist.ignoredPathPrefixes ?? []),
]);
const ignoredMatches = Array.isArray(allowlist.ignoredMatches)
  ? allowlist.ignoredMatches
  : [];

const trackedFilesRaw = execFileSync("git", ["ls-files", "-z"], {
  cwd: ROOT,
  encoding: "utf8",
});
const trackedFiles = trackedFilesRaw
  .split("\u0000")
  .filter(Boolean)
  .filter((filePath) => ![...ignoredPathPrefixes].some((prefix) => filePath.startsWith(prefix)));

const isBinary = (buffer) => buffer.includes(0);

const isIgnoredMatch = (filePath, patternId, matchText) => {
  return ignoredMatches.some((entry) => {
    if (entry.path !== filePath || entry.patternId !== patternId) {
      return false;
    }
    if (!entry.matchText) {
      return true;
    }
    return matchText.includes(entry.matchText);
  });
};

const findings = [];

for (const relativePath of trackedFiles) {
  const absolutePath = path.join(ROOT, relativePath);
  const fileBuffer = fs.readFileSync(absolutePath);
  if (isBinary(fileBuffer)) {
    continue;
  }

  const text = fileBuffer.toString("utf8");
  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match = regex.exec(text);
    while (match) {
      const matchText = match[0];
      if (!isIgnoredMatch(relativePath, pattern.id, matchText)) {
        const line = text.slice(0, match.index).split("\n").length;
        findings.push({
          file: relativePath,
          line,
          patternId: pattern.id,
          description: pattern.description,
          preview: matchText.slice(0, 80),
        });
      }
      match = regex.exec(text);
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secrets detected in tracked files:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line} [${finding.patternId}] ${finding.description} -> ${finding.preview}`,
    );
  }
  process.exit(1);
}

console.log(`Secret scan passed. Scanned ${trackedFiles.length} tracked files.`);
