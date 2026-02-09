import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["convex/__tests__/**/*.test.ts", "src/app/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/app/test/setup.ts"],
    globals: true,
    env: {
      WORKOS_CLIENT_ID: "test_client_id",
      WORKOS_API_KEY: "test_api_key",
      WORKOS_WEBHOOK_SECRET: "test_webhook_secret",
      WORKOS_ACTION_SECRET: "test_action_secret",
    },
  },
});
