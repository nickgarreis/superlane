import { useMemo } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../../convex/_generated/api";

type AccountSettingsResult = FunctionReturnType<typeof api.settings.getAccountSettings> | undefined;
type NotificationSettingsResult = FunctionReturnType<typeof api.settings.getNotificationPreferences> | undefined;
type CompanySummaryResult = FunctionReturnType<typeof api.settings.getCompanySettingsSummary> | undefined;
type CompanyMemberRow = FunctionReturnType<typeof api.settings.listCompanyMembers>["page"][number];
type CompanyPendingInvitationRow = FunctionReturnType<typeof api.settings.listPendingInvitations>["page"][number];
type CompanyBrandAssetRow = FunctionReturnType<typeof api.settings.listBrandAssets>["page"][number];

type UseDashboardSettingsDataArgs = {
  accountSettings: AccountSettingsResult;
  notificationSettings: NotificationSettingsResult;
  companySummary: CompanySummaryResult;
  companyMembersResult: { results: CompanyMemberRow[] } | undefined;
  companyPendingInvitationsResult: { results: CompanyPendingInvitationRow[] } | undefined;
  companyBrandAssetsResult: { results: CompanyBrandAssetRow[] } | undefined;
  fallbackAvatarUrl: string | null;
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profilePictureUrl?: string | null;
  } | null | undefined;
};

export const useDashboardSettingsData = ({
  accountSettings,
  notificationSettings,
  companySummary,
  companyMembersResult,
  companyPendingInvitationsResult,
  companyBrandAssetsResult,
  fallbackAvatarUrl,
  user,
}: UseDashboardSettingsDataArgs) => {
  const settingsAccountData = useMemo(
    () =>
      accountSettings ?? {
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        avatarUrl: fallbackAvatarUrl ?? user?.profilePictureUrl ?? null,
      },
    [
      accountSettings,
      fallbackAvatarUrl,
      user?.email,
      user?.firstName,
      user?.lastName,
      user?.profilePictureUrl,
    ],
  );

  const settingsNotificationsData = useMemo(
    () =>
      notificationSettings
        ? {
            events: notificationSettings.events,
          }
        : {
            events: {
              eventNotifications: true,
              teamActivities: true,
              productUpdates: true,
            },
          },
    [notificationSettings],
  );

  const settingsCompanyData = useMemo(
    () => {
      if (!companySummary) {
        return null;
      }

      const members = Array.isArray(companyMembersResult?.results) ? companyMembersResult.results : [];
      const pendingInvitations = Array.isArray(companyPendingInvitationsResult?.results)
        ? companyPendingInvitationsResult.results
        : [];
      const brandAssets = Array.isArray(companyBrandAssetsResult?.results) ? companyBrandAssetsResult.results : [];

      return {
        ...companySummary,
        members: members.filter(
          (member: unknown): member is NonNullable<(typeof members)[number]> => member !== null,
        ),
        pendingInvitations: pendingInvitations.filter(
          (invitation: unknown): invitation is NonNullable<(typeof pendingInvitations)[number]> =>
            invitation !== null,
        ),
        brandAssets: brandAssets.filter(
          (asset: unknown): asset is NonNullable<(typeof brandAssets)[number]> => asset !== null,
        ),
      };
    },
    [
      companyBrandAssetsResult?.results,
      companyMembersResult?.results,
      companyPendingInvitationsResult?.results,
      companySummary,
    ],
  );

  return {
    settingsAccountData,
    settingsNotificationsData,
    settingsCompanyData,
  };
};
