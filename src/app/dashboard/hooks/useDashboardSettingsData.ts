import { useMemo } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../../../convex/_generated/api";

type AccountSettingsResult = FunctionReturnType<typeof api.settings.getAccountSettings> | undefined;
type NotificationSettingsResult = FunctionReturnType<typeof api.settings.getNotificationPreferences> | undefined;
type CompanySettingsResult = FunctionReturnType<typeof api.settings.getCompanySettings> | undefined;

type UseDashboardSettingsDataArgs = {
  accountSettings: AccountSettingsResult;
  notificationSettings: NotificationSettingsResult;
  companySettings: CompanySettingsResult;
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
  companySettings,
  user,
}: UseDashboardSettingsDataArgs) => {
  const settingsAccountData = useMemo(
    () =>
      accountSettings ?? {
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        avatarUrl: user?.profilePictureUrl ?? null,
      },
    [accountSettings, user?.email, user?.firstName, user?.lastName, user?.profilePictureUrl],
  );

  const settingsNotificationsData = useMemo(
    () =>
      notificationSettings
        ? {
            channels: notificationSettings.channels,
            events: notificationSettings.events,
          }
        : {
            channels: {
              email: true,
              desktop: true,
            },
            events: {
              productUpdates: true,
              teamActivity: true,
            },
          },
    [notificationSettings],
  );

  const settingsCompanyData = useMemo(
    () => {
      if (!companySettings) {
        return null;
      }

      const members = Array.isArray(companySettings.members) ? companySettings.members : [];
      const pendingInvitations = Array.isArray(companySettings.pendingInvitations) ? companySettings.pendingInvitations : [];
      const brandAssets = Array.isArray(companySettings.brandAssets) ? companySettings.brandAssets : [];

      return {
        ...companySettings,
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
    [companySettings],
  );

  return {
    settingsAccountData,
    settingsNotificationsData,
    settingsCompanyData,
  };
};
