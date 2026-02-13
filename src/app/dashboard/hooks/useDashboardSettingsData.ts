import { useMemo } from "react";
import type { AuthenticationMethod } from "@workos-inc/authkit-js";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../../convex/_generated/api";
type AccountSettingsResult =
  | FunctionReturnType<typeof api.settings.getAccountSettings>
  | undefined;
type NotificationSettingsResult =
  | FunctionReturnType<typeof api.settings.getNotificationPreferences>
  | undefined;
type CompanySummaryResult =
  | FunctionReturnType<typeof api.settings.getCompanySettingsSummary>
  | undefined;
type CompanyMemberRow = FunctionReturnType<
  typeof api.settings.listCompanyMembers
>["page"][number];
type CompanyPendingInvitationRow = FunctionReturnType<
  typeof api.settings.listPendingInvitations
>["page"][number];
type CompanyBrandAssetRow = FunctionReturnType<
  typeof api.settings.listBrandAssets
>["page"][number];

const AUTH_METHOD_SOCIAL_LABELS: Partial<Record<AuthenticationMethod, string>> = {
  SSO: "your organization",
  Passkey: "your passkey",
  AppleOAuth: "Apple",
  BitbucketOAuth: "Bitbucket",
  CrossAppAuth: "a cross-app provider",
  DiscordOAuth: "Discord",
  ExternalAuth: "an external provider",
  GitHubOAuth: "GitHub",
  GitLabOAuth: "GitLab",
  GoogleOAuth: "Google",
  LinkedInOAuth: "LinkedIn",
  MicrosoftOAuth: "Microsoft",
  SalesforceOAuth: "Salesforce",
  SlackOAuth: "Slack",
  VercelMarketplaceOAuth: "Vercel Marketplace",
  VercelOAuth: "Vercel",
  XeroOAuth: "Xero",
  MagicAuth: "a magic link",
  Impersonation: "an impersonation session",
  MigratedSession: "a migrated session",
};

const resolveSocialLoginLabel = (
  authenticationMethod: AuthenticationMethod | null,
): string | null => {
  if (!authenticationMethod || authenticationMethod === "Password") {
    return null;
  }
  return AUTH_METHOD_SOCIAL_LABELS[authenticationMethod] ?? authenticationMethod;
};

const normalizeLinkedIdentityProviders = (
  providers: string[] | undefined,
): string[] => {
  if (!Array.isArray(providers) || providers.length === 0) {
    return [];
  }
  const unique = new Set<string>();
  for (const provider of providers) {
    if (typeof provider !== "string") {
      continue;
    }
    const normalized = provider.trim().toLowerCase();
    if (normalized.length === 0) {
      continue;
    }
    unique.add(normalized);
  }
  return Array.from(unique).sort((left, right) => left.localeCompare(right));
};

type UseDashboardSettingsDataArgs = {
  accountSettings: AccountSettingsResult;
  notificationSettings: NotificationSettingsResult;
  companySummary: CompanySummaryResult;
  companyMembersResult: { results: CompanyMemberRow[] } | undefined;
  companyPendingInvitationsResult:
    | { results: CompanyPendingInvitationRow[] }
    | undefined;
  companyBrandAssetsResult: { results: CompanyBrandAssetRow[] } | undefined;
  fallbackAvatarUrl: string | null;
  authenticationMethod: AuthenticationMethod | null;
  user:
    | {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        profilePictureUrl?: string | null;
      }
    | null
    | undefined;
};
export const useDashboardSettingsData = ({
  accountSettings,
  notificationSettings,
  companySummary,
  companyMembersResult,
  companyPendingInvitationsResult,
  companyBrandAssetsResult,
  fallbackAvatarUrl,
  authenticationMethod,
  user,
}: UseDashboardSettingsDataArgs) => {
  const isPasswordAuthSession = authenticationMethod === "Password";
  const socialLoginLabel = useMemo(
    () => resolveSocialLoginLabel(authenticationMethod),
    [authenticationMethod],
  );
  const settingsAccountData = useMemo(
    () => {
      const accountProfile = accountSettings ?? {
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        avatarUrl: fallbackAvatarUrl ?? user?.profilePictureUrl ?? null,
        linkedIdentityProviders: [],
      };
      return {
        ...accountProfile,
        linkedIdentityProviders: normalizeLinkedIdentityProviders(
          accountProfile.linkedIdentityProviders,
        ),
        authenticationMethod,
        isPasswordAuthSession,
        socialLoginLabel,
      };
    },
    [
      accountSettings,
      authenticationMethod,
      fallbackAvatarUrl,
      isPasswordAuthSession,
      socialLoginLabel,
      user?.email,
      user?.firstName,
      user?.lastName,
      user?.profilePictureUrl,
    ],
  );
  const settingsNotificationsData = useMemo(
    () =>
      notificationSettings
        ? { events: notificationSettings.events }
        : {
            events: {
              eventNotifications: true,
              teamActivities: true,
              productUpdates: true,
            },
          },
    [notificationSettings],
  );
  const settingsCompanyData = useMemo(() => {
    if (!companySummary) {
      return null;
    }
    const members = Array.isArray(companyMembersResult?.results)
      ? companyMembersResult.results
      : [];
    const pendingInvitations = Array.isArray(
      companyPendingInvitationsResult?.results,
    )
      ? companyPendingInvitationsResult.results
      : [];
    const brandAssets = Array.isArray(companyBrandAssetsResult?.results)
      ? companyBrandAssetsResult.results
      : [];
    return {
      ...companySummary,
      members: members.filter(
        (member: unknown): member is NonNullable<(typeof members)[number]> =>
          member !== null,
      ),
      pendingInvitations: pendingInvitations.filter(
        (
          invitation: unknown,
        ): invitation is NonNullable<(typeof pendingInvitations)[number]> =>
          invitation !== null,
      ),
      brandAssets: brandAssets.filter(
        (asset: unknown): asset is NonNullable<(typeof brandAssets)[number]> =>
          asset !== null,
      ),
    };
  }, [
    companyBrandAssetsResult?.results,
    companyMembersResult?.results,
    companyPendingInvitationsResult?.results,
    companySummary,
  ]);
  return {
    settingsAccountData,
    settingsNotificationsData,
    settingsCompanyData,
  };
};
