import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MATRIX_PATH = path.join(ROOT, "config/security/environment-matrix.json");
const VALID_ENVS = new Set(["dev", "staging", "prod"]);

const args = new Set(process.argv.slice(2));
const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const strictPlaceholders = args.has("--strict-placeholders");
const runAll = args.has("--all") || !envArg;

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const normalizeUrl = (rawUrl) => {
  const parsed = new URL(rawUrl);
  return parsed.toString().replace(/\/$/, "");
};

const isPlaceholderValue = (value) => {
  if (typeof value !== "string") {
    return false;
  }
  return (
    value.includes("__SET_") ||
    value.includes("<") ||
    value.includes(">") ||
    value.includes("example.com")
  );
};

const matrix = readJson(MATRIX_PATH);
const failures = [];

const envs = runAll
  ? ["dev", "staging", "prod"]
  : [envArg.slice("--env=".length)];

for (const envName of envs) {
  if (!VALID_ENVS.has(envName)) {
    failures.push(`Unsupported environment "${envName}". Expected one of: dev, staging, prod.`);
    continue;
  }

  const config = matrix?.environments?.[envName];
  if (!config) {
    failures.push(`Missing environment "${envName}" in ${MATRIX_PATH}.`);
    continue;
  }

  const requiredFields = [
    "appOrigin",
    "workosRedirectUri",
    "convexSiteUrl",
    "workosWebhookUrl",
    "workosActionUrl",
  ];

  for (const fieldName of requiredFields) {
    const value = config[fieldName];
    if (typeof value !== "string" || value.trim().length === 0) {
      failures.push(`[${envName}] Missing or empty "${fieldName}"`);
      continue;
    }
    if (strictPlaceholders && isPlaceholderValue(value)) {
      failures.push(`[${envName}] "${fieldName}" still uses placeholder value: ${value}`);
    }
  }

  let appOrigin;
  let workosRedirectUri;
  let convexSiteUrl;
  let workosWebhookUrl;
  let workosActionUrl;

  try {
    appOrigin = new URL(config.appOrigin);
    workosRedirectUri = new URL(config.workosRedirectUri);
    convexSiteUrl = new URL(config.convexSiteUrl);
    workosWebhookUrl = new URL(config.workosWebhookUrl);
    workosActionUrl = new URL(config.workosActionUrl);
  } catch {
    failures.push(`[${envName}] All URL fields must be valid absolute URLs.`);
    continue;
  }

  if (workosRedirectUri.pathname !== "/auth/callback") {
    failures.push(`[${envName}] workosRedirectUri must use /auth/callback path.`);
  }

  if (workosRedirectUri.origin !== appOrigin.origin) {
    failures.push(`[${envName}] appOrigin must match the origin of workosRedirectUri.`);
  }

  const expectedWebhookUrl = `${normalizeUrl(convexSiteUrl.toString())}/workos/webhook`;
  const expectedActionUrl = `${normalizeUrl(convexSiteUrl.toString())}/workos/action`;

  if (normalizeUrl(workosWebhookUrl.toString()) !== normalizeUrl(expectedWebhookUrl)) {
    failures.push(
      `[${envName}] workosWebhookUrl must equal ${expectedWebhookUrl} (got ${workosWebhookUrl.toString()})`,
    );
  }

  if (normalizeUrl(workosActionUrl.toString()) !== normalizeUrl(expectedActionUrl)) {
    failures.push(
      `[${envName}] workosActionUrl must equal ${expectedActionUrl} (got ${workosActionUrl.toString()})`,
    );
  }

  if (envName !== "dev") {
    const urls = [
      ["appOrigin", appOrigin],
      ["workosRedirectUri", workosRedirectUri],
      ["convexSiteUrl", convexSiteUrl],
      ["workosWebhookUrl", workosWebhookUrl],
      ["workosActionUrl", workosActionUrl],
    ];

    for (const [fieldName, parsed] of urls) {
      if (parsed.protocol !== "https:") {
        failures.push(`[${envName}] ${fieldName} must use https.`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("WorkOS URL policy validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`WorkOS URL policy validation passed for: ${envs.join(", ")}`);
