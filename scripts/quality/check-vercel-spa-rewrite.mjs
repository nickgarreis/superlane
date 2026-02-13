import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VERCEL_CONFIG_PATH = path.join(ROOT, "vercel.json");

const fail = (message) => {
  console.error(message);
  console.error(
    "Remediation: add a Vercel SPA rewrite that maps extensionless app routes to '/' or '/index.html'.",
  );
  process.exit(1);
};

if (!fs.existsSync(VERCEL_CONFIG_PATH)) {
  fail(`Missing ${VERCEL_CONFIG_PATH}.`);
}

let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync(VERCEL_CONFIG_PATH, "utf8"));
} catch (error) {
  fail(
    `Invalid JSON in ${VERCEL_CONFIG_PATH}: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

if (!Array.isArray(vercelConfig.rewrites) || vercelConfig.rewrites.length === 0) {
  fail(`"${path.relative(ROOT, VERCEL_CONFIG_PATH)}" must define a non-empty "rewrites" array.`);
}

const destinationIsSpaEntry = (destination) =>
  destination === "/" || destination === "/index.html";

const sourceCoversExtensionlessRoutes = (source) => {
  if (typeof source !== "string") {
    return false;
  }

  const normalized = source.trim();

  // Explicit extensionless fallback patterns.
  if (normalized.includes(".*\\..*")) {
    return true;
  }

  // Generic catch-all patterns still cover extensionless SPA paths.
  if (
    normalized === "/(.*)" ||
    normalized === "/:path*" ||
    normalized === "/:path(.*)" ||
    normalized === "/:match*" ||
    normalized === "/:match(.*)"
  ) {
    return true;
  }

  return false;
};

const hasSpaRewrite = vercelConfig.rewrites.some((rewrite) => {
  if (!rewrite || typeof rewrite !== "object") {
    return false;
  }

  const destination = typeof rewrite.destination === "string" ? rewrite.destination.trim() : "";
  if (!destinationIsSpaEntry(destination)) {
    return false;
  }

  return sourceCoversExtensionlessRoutes(rewrite.source);
});

if (!hasSpaRewrite) {
  fail(
    "No SPA rewrite found that covers extensionless routes with destination '/' or '/index.html'.",
  );
}

console.log("Vercel SPA rewrite check passed.");
