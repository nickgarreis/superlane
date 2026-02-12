import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MATRIX_PATH = path.join(ROOT, "config/security/environment-matrix.json");
const ROOT_ENV_EXAMPLE_PATH = path.join(ROOT, ".env.example");
const CONVEX_ENV_EXAMPLE_PATH = path.join(ROOT, "convex/.env.example");

const REQUIRED_ENVIRONMENTS = ["dev", "staging", "prod"];
const REQUIRED_FIELDS = [
  "appOrigin",
  "workosRedirectUri",
  "convexSiteUrl",
  "workosWebhookUrl",
  "workosActionUrl",
  "frontendRequiredVars",
  "convexRequiredVars",
];
const REQUIRED_FRONTEND_VARS = [
  "VITE_CONVEX_URL",
  "VITE_WORKOS_CLIENT_ID",
  "VITE_WORKOS_REDIRECT_URI",
];
const REQUIRED_CONVEX_VARS = [
  "WORKOS_CLIENT_ID",
  "WORKOS_API_KEY",
  "WORKOS_WEBHOOK_SECRET",
  "WORKOS_ACTION_SECRET",
  "SITE_URL",
];

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const parseEnvExampleKeys = (filePath) => {
  const contents = fs.readFileSync(filePath, "utf8");
  return new Set(
    contents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#") && line.includes("="))
      .map((line) => line.slice(0, line.indexOf("=")).trim()),
  );
};

const matrix = readJson(MATRIX_PATH);
const failures = [];

for (const envName of REQUIRED_ENVIRONMENTS) {
  const envConfig = matrix?.environments?.[envName];
  if (!envConfig || typeof envConfig !== "object") {
    failures.push(`Missing environment config for "${envName}" in ${MATRIX_PATH}`);
    continue;
  }

  for (const fieldName of REQUIRED_FIELDS) {
    if (!(fieldName in envConfig)) {
      failures.push(`Missing "${fieldName}" for environment "${envName}"`);
      continue;
    }

    const value = envConfig[fieldName];
    if (fieldName.endsWith("RequiredVars")) {
      if (!Array.isArray(value) || value.length === 0) {
        failures.push(`"${fieldName}" for "${envName}" must be a non-empty array`);
      }
    } else if (typeof value !== "string" || value.trim().length === 0) {
      failures.push(`"${fieldName}" for "${envName}" must be a non-empty string`);
    }
  }

  for (const requiredFrontendVar of REQUIRED_FRONTEND_VARS) {
    if (!envConfig.frontendRequiredVars?.includes(requiredFrontendVar)) {
      failures.push(`"${envName}" frontendRequiredVars must include ${requiredFrontendVar}`);
    }
  }

  for (const requiredConvexVar of REQUIRED_CONVEX_VARS) {
    if (!envConfig.convexRequiredVars?.includes(requiredConvexVar)) {
      failures.push(`"${envName}" convexRequiredVars must include ${requiredConvexVar}`);
    }
  }
}

const allFrontendVars = new Set(
  REQUIRED_ENVIRONMENTS.flatMap((envName) => matrix?.environments?.[envName]?.frontendRequiredVars ?? []),
);
const allConvexVars = new Set(
  REQUIRED_ENVIRONMENTS.flatMap((envName) => matrix?.environments?.[envName]?.convexRequiredVars ?? []),
);

const rootExampleKeys = parseEnvExampleKeys(ROOT_ENV_EXAMPLE_PATH);
const convexExampleKeys = parseEnvExampleKeys(CONVEX_ENV_EXAMPLE_PATH);

for (const varName of allFrontendVars) {
  if (!rootExampleKeys.has(varName)) {
    failures.push(`.env.example is missing ${varName}`);
  }
}

for (const varName of allConvexVars) {
  if (!convexExampleKeys.has(varName)) {
    failures.push(`convex/.env.example is missing ${varName}`);
  }
}

if (failures.length > 0) {
  console.error("Environment configuration validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Environment configuration validation passed.");
