import type { SettingsCommands, SettingsTab } from "../types";

type CreateSettingsCommandsArgs = {
  handleOpenSettings: (tab?: SettingsTab) => void;
  handleCloseSettings: () => void;
  handleSaveAccountSettings: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
  handleUploadAccountAvatar: (file: File) => Promise<void>;
  handleRemoveAccountAvatar: () => Promise<void>;
  handleSaveSettingsNotifications: (payload: {
    events: {
      eventNotifications: boolean;
      teamActivities: boolean;
      productUpdates: boolean;
    };
  }) => Promise<void>;
};

export const createSettingsCommands = ({
  handleOpenSettings,
  handleCloseSettings,
  handleSaveAccountSettings,
  handleUploadAccountAvatar,
  handleRemoveAccountAvatar,
  handleSaveSettingsNotifications,
}: CreateSettingsCommandsArgs): SettingsCommands => ({
  openSettings: handleOpenSettings,
  closeSettings: handleCloseSettings,
  saveAccount: handleSaveAccountSettings,
  uploadAccountAvatar: handleUploadAccountAvatar,
  removeAccountAvatar: handleRemoveAccountAvatar,
  saveNotifications: handleSaveSettingsNotifications,
});
