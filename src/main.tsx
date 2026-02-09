import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { clearStoredAuthMode, clearStoredReturnTo, readStoredReturnTo } from "./app/lib/authReturnTo";
import { ConvexProviderWithAuthKit } from "./app/providers/ConvexProviderWithAuthKit.tsx";
import "./styles/index.css";

const requireEnv = (value: string | undefined, name: string) => {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/;

const sanitizeReturnToPath = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || CONTROL_CHARS_PATTERN.test(trimmed)) {
    return null;
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return null;
  }

  return trimmed;
};

const convexUrl = requireEnv(import.meta.env.VITE_CONVEX_URL, "VITE_CONVEX_URL");
const workosClientId = requireEnv(import.meta.env.VITE_WORKOS_CLIENT_ID, "VITE_WORKOS_CLIENT_ID");
const configuredWorkosRedirectUri = import.meta.env.VITE_WORKOS_REDIRECT_URI;
const configuredWorkosApiHostname = import.meta.env.VITE_WORKOS_API_HOSTNAME?.trim();
const trimmedWorkosRedirectUri = configuredWorkosRedirectUri?.trim();
const workosRedirectUri = trimmedWorkosRedirectUri && trimmedWorkosRedirectUri.length > 0
  ? trimmedWorkosRedirectUri
  : import.meta.env.DEV
    ? window.location.origin
    : requireEnv(configuredWorkosRedirectUri, "VITE_WORKOS_REDIRECT_URI");

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <AuthKitProvider
    clientId={workosClientId}
    apiHostname={configuredWorkosApiHostname && configuredWorkosApiHostname.length > 0 ? configuredWorkosApiHostname : undefined}
    redirectUri={workosRedirectUri}
    devMode={import.meta.env.DEV}
    onRedirectCallback={({ state }) => {
      const stateReturnTo = sanitizeReturnToPath(state?.returnTo);
      const returnTo = stateReturnTo ?? readStoredReturnTo() ?? "/tasks";
      clearStoredAuthMode();
      clearStoredReturnTo();
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentPath !== returnTo) {
        window.location.assign(returnTo);
        return;
      }
      window.location.reload();
    }}
  >
    <ConvexProviderWithAuthKit client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProviderWithAuthKit>
  </AuthKitProvider>,
);
