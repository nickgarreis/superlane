import {
  Apple,
  BadgeCheck,
  Blocks,
  Building2,
  CircleDashed,
  CircleUserRound,
  Cloud,
  Compass,
  Github,
  Gitlab,
  KeyRound,
  Library,
  Linkedin,
  Mail,
  MessageCircle,
  ShieldCheck,
  Slack,
  SquareM,
  Waypoints,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";
import googleSocialLogo from "../../../../../google logo.svg";
import type { AccountSettingsData } from "../types";

const PROVIDER_KEY_BY_AUTH_METHOD: Record<string, string> = {
  Password: "email_password",
  AppleOAuth: "apple",
  BitbucketOAuth: "bitbucket",
  CrossAppAuth: "cross_app_auth",
  DiscordOAuth: "discord",
  ExternalAuth: "external_auth",
  GitHubOAuth: "github",
  GitLabOAuth: "gitlab",
  GoogleOAuth: "google",
  LinkedInOAuth: "linkedin",
  MagicAuth: "magic_auth",
  MicrosoftOAuth: "microsoft",
  SalesforceOAuth: "salesforce",
  SlackOAuth: "slack",
  SSO: "sso",
  Passkey: "passkey",
  Impersonation: "impersonation",
  MigratedSession: "migrated_session",
  VercelMarketplaceOAuth: "vercel_marketplace",
  VercelOAuth: "vercel",
  XeroOAuth: "xero",
};

type AuthIconComponent = ComponentType<{
  size?: string | number;
  className?: string;
}>;

export type ProviderRowMeta = {
  providerName: string;
  methodLabel: string | null;
  Icon: AuthIconComponent;
};

const normalizeProviderKey = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const mapped = PROVIDER_KEY_BY_AUTH_METHOD[value];
  if (mapped) {
    return mapped;
  }
  const normalized = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const toSortedUniqueProviderKeys = (providers: string[]): string[] => {
  const unique = new Set<string>();
  for (const provider of providers) {
    const normalized = normalizeProviderKey(provider);
    if (!normalized) {
      continue;
    }
    unique.add(normalized);
  }
  return Array.from(unique).sort((left, right) => left.localeCompare(right));
};

const formatProviderNameFromKey = (providerKey: string): string => {
  return providerKey
    .split("_")
    .filter((entry) => entry.length > 0)
    .map((entry) => `${entry.charAt(0).toUpperCase()}${entry.slice(1)}`)
    .join(" ");
};

const GoogleAuthIcon = ({
  size = 24,
  className,
}: {
  size?: string | number;
  className?: string;
}) => (
  <img
    src={googleSocialLogo}
    alt="Google"
    width={size}
    height={size}
    className={className}
  />
);

const PROVIDER_ROW_META_BY_KEY: Record<string, ProviderRowMeta> = {
  email_password: {
    providerName: "Email",
    methodLabel: null,
    Icon: Mail,
  },
  google: {
    providerName: "Google",
    methodLabel: "OAuth",
    Icon: GoogleAuthIcon,
  },
  apple: {
    providerName: "Apple",
    methodLabel: "OAuth",
    Icon: Apple,
  },
  github: {
    providerName: "GitHub",
    methodLabel: "OAuth",
    Icon: Github,
  },
  gitlab: {
    providerName: "GitLab",
    methodLabel: "OAuth",
    Icon: Gitlab,
  },
  slack: {
    providerName: "Slack",
    methodLabel: "OAuth",
    Icon: Slack,
  },
  linkedin: {
    providerName: "LinkedIn",
    methodLabel: "OAuth",
    Icon: Linkedin,
  },
  microsoft: {
    providerName: "Microsoft",
    methodLabel: "OAuth",
    Icon: SquareM,
  },
  discord: {
    providerName: "Discord",
    methodLabel: "OAuth",
    Icon: MessageCircle,
  },
  bitbucket: {
    providerName: "Bitbucket",
    methodLabel: "OAuth",
    Icon: Waypoints,
  },
  salesforce: {
    providerName: "Salesforce",
    methodLabel: "OAuth",
    Icon: Cloud,
  },
  vercel: {
    providerName: "Vercel",
    methodLabel: "OAuth",
    Icon: Compass,
  },
  vercel_marketplace: {
    providerName: "Vercel Marketplace",
    methodLabel: "OAuth",
    Icon: Blocks,
  },
  xero: {
    providerName: "Xero",
    methodLabel: "OAuth",
    Icon: Library,
  },
  sso: {
    providerName: "your organization",
    methodLabel: "Single Sign-On",
    Icon: Building2,
  },
  passkey: {
    providerName: "your passkey",
    methodLabel: "Passkey",
    Icon: KeyRound,
  },
  magic_auth: {
    providerName: "a magic link",
    methodLabel: "Magic link",
    Icon: BadgeCheck,
  },
  cross_app_auth: {
    providerName: "a cross-app provider",
    methodLabel: "External auth",
    Icon: Workflow,
  },
  impersonation: {
    providerName: "an impersonation session",
    methodLabel: "External auth",
    Icon: CircleUserRound,
  },
  migrated_session: {
    providerName: "a migrated session",
    methodLabel: "External auth",
    Icon: CircleDashed,
  },
  external_auth: {
    providerName: "External provider",
    methodLabel: "External auth",
    Icon: ShieldCheck,
  },
};

export const formatAuthMethodLabel = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
) => {
  if (!authenticationMethod) {
    return "External provider";
  }
  if (authenticationMethod === "SSO") {
    return "Single Sign-On";
  }
  if (authenticationMethod.endsWith("OAuth")) {
    return "OAuth";
  }
  if (authenticationMethod === "Passkey") {
    return "Passkey";
  }
  if (authenticationMethod === "MagicAuth") {
    return "Magic link";
  }
  return "External auth";
};

export const formatAuthMethodCode = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
) => {
  if (!authenticationMethod) {
    return "ExternalAuth";
  }
  return authenticationMethod;
};

export const resolveProviderRowMeta = (providerKey: string): ProviderRowMeta => {
  const predefined = PROVIDER_ROW_META_BY_KEY[providerKey];
  if (predefined) {
    return predefined;
  }
  return {
    providerName: formatProviderNameFromKey(providerKey),
    methodLabel: "External auth",
    Icon: ShieldCheck,
  };
};

export const resolveProviderKeyFromAuthMethod = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
): string | null => {
  if (!authenticationMethod) {
    return null;
  }
  return normalizeProviderKey(
    PROVIDER_KEY_BY_AUTH_METHOD[authenticationMethod] ?? authenticationMethod,
  );
};

export const buildProviderKeysToDisplay = (args: {
  linkedIdentityProviders: string[];
  sessionProviderKey: string | null;
  isPasswordAuthSession: boolean;
}) => {
  const linkedProviderKeys = new Set(
    toSortedUniqueProviderKeys(args.linkedIdentityProviders),
  );
  if (args.sessionProviderKey) {
    linkedProviderKeys.add(args.sessionProviderKey);
  }
  if (args.isPasswordAuthSession) {
    linkedProviderKeys.add("email_password");
  }

  const sortedLinkedProviderKeys = Array.from(linkedProviderKeys).sort(
    (left, right) => left.localeCompare(right),
  );

  const providerKeysToDisplay: string[] = [];
  const pushProviderKey = (providerKey: string) => {
    if (!providerKeysToDisplay.includes(providerKey)) {
      providerKeysToDisplay.push(providerKey);
    }
  };

  if (args.isPasswordAuthSession) {
    pushProviderKey("email_password");
    for (const providerKey of sortedLinkedProviderKeys) {
      if (providerKey === "email_password") {
        continue;
      }
      pushProviderKey(providerKey);
    }
    return providerKeysToDisplay;
  }

  if (args.sessionProviderKey) {
    pushProviderKey(args.sessionProviderKey);
  }
  if (linkedProviderKeys.has("email_password")) {
    pushProviderKey("email_password");
  }
  for (const providerKey of sortedLinkedProviderKeys) {
    if (
      providerKey === args.sessionProviderKey ||
      providerKey === "email_password"
    ) {
      continue;
    }
    pushProviderKey(providerKey);
  }
  if (providerKeysToDisplay.length === 0) {
    pushProviderKey("external_auth");
  }

  return providerKeysToDisplay;
};
