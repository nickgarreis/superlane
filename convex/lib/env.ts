const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const requireUrl = (name: string): string => {
  const value = requireEnv(name);
  try {
    const parsed = new URL(value);
    if (!parsed.protocol || !parsed.hostname) {
      throw new Error("invalid URL");
    }
  } catch {
    throw new Error(`Environment variable ${name} must be a valid absolute URL`);
  }
  return value;
};

export type WorkosRuntimeEnv = {
  workosClientId: string;
  workosApiKey: string;
  workosWebhookSecret: string;
  workosActionSecret: string;
};

export const getWorkosRuntimeEnv = (): WorkosRuntimeEnv => ({
  workosClientId: requireEnv("WORKOS_CLIENT_ID"),
  workosApiKey: requireEnv("WORKOS_API_KEY"),
  workosWebhookSecret: requireEnv("WORKOS_WEBHOOK_SECRET"),
  workosActionSecret: requireEnv("WORKOS_ACTION_SECRET"),
});

export const getWorkosCallbackEnv = () => ({
  convexSiteUrl: requireUrl("CONVEX_SITE_URL"),
});
