import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["convex/__tests__/**/*.test.ts"],
    globals: true,
    env: {
      WORKOS_CLIENT_ID: "test_client_id",
      WORKOS_API_KEY: "test_api_key",
      WORKOS_WEBHOOK_SECRET: "test_webhook_secret",
      WORKOS_ACTION_SECRET: "test_action_secret",
      RESEND_API_KEY: "re_test_key",
      RESEND_WEBHOOK_SECRET: "whsec_test_key",
      NOTIFICATIONS_FROM_EMAIL: "notifications@test.example",
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "./security-reports/coverage-backend",
      reporter: ["text", "json-summary"],
      include: ["convex/**/*.ts"],
      exclude: [
        "convex/__tests__/**",
        "convex/**/*.test.ts",
        "convex/_generated/**",
        "convex/auth.config.ts",
        "convex/convex.config.ts",
        "convex/crons.ts",
        "convex/http.ts",
        "convex/import-meta.d.ts",
        "convex/organizationSync.ts",
        "convex/organizationSyncInternal.ts",
        "convex/lib/logging.ts",
      ],
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      },
    },
  },
});
