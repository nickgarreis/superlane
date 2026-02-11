import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Building2, CreditCard, User, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { AccountTab } from "./settings-popup/AccountTab";
import { BillingTab } from "./settings-popup/BillingTab";
import { CompanyTab } from "./settings-popup/CompanyTab";
import { NotificationsTab } from "./settings-popup/NotificationsTab";
import type { SettingsPopupProps, SettingsTab } from "./settings-popup/types";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "./popup/popupChrome";
const SETTINGS_TABS: Array<{
  id: SettingsTab;
  icon: typeof User;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "Account",
    icon: User,
    label: "My Account",
    title: "My Account",
    description: "Manage your personal profile and preferences.",
  },
  {
    id: "Notifications",
    icon: Bell,
    label: "Notifications",
    title: "Notifications",
    description: "Control your app notification settings.",
  },
  {
    id: "Company",
    icon: Building2,
    label: "Company",
    title: "Company",
    description: "Manage workspace settings, members, and brand assets.",
  },
  {
    id: "Billing",
    icon: CreditCard,
    label: "Billing & Plans",
    title: "Billing & Plans",
    description: "Billing is coming soon. This panel is read-only for now.",
  },
];
const tabMetaById = SETTINGS_TABS.reduce<
  Record<SettingsTab, (typeof SETTINGS_TABS)[number]>
>(
  (acc, tab) => {
    acc[tab.id] = tab;
    return acc;
  },
  {} as Record<SettingsTab, (typeof SETTINGS_TABS)[number]>,
);
export function SettingsPopup({
  isOpen,
  onClose,
  initialTab = "Account",
  activeWorkspace,
  account,
  notifications,
  company,
  loadingCompany,
  onSaveAccount,
  onUploadAvatar,
  onRemoveAvatar,
  onSaveNotifications,
  onUpdateWorkspaceGeneral,
  onUploadWorkspaceLogo,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
  onUploadBrandAsset,
  onRemoveBrandAsset,
  onGetBrandAssetDownloadUrl,
  onSoftDeleteWorkspace,
}: SettingsPopupProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  if (!isOpen) {
    return null;
  }
  const tabMeta = tabMetaById[activeTab];
  return (
    <div
      className={`${POPUP_OVERLAY_CENTER_CLASS} z-[100]`}
      onClick={onClose}
    >
      <div
        className={`${POPUP_SHELL_CLASS} max-w-[980px] h-[680px] flex font-app txt-tone-primary`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden="true" className={POPUP_SHELL_BORDER_CLASS} />
        <div className="w-[240px] flex flex-col py-6 px-4 shrink-0">
          <div className="px-2 mb-6 mt-2">
            <span className="txt-role-panel-title txt-tone-primary">
              Settings
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {SETTINGS_TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg txt-role-body-lg font-medium transition-all group outline-none cursor-pointer",
                  activeTab === item.id
                    ? "bg-white/10 txt-tone-primary"
                    : "txt-tone-subtle hover:txt-tone-primary hover:bg-white/5",
                )}
              >
                <item.icon
                  size={16}
                  strokeWidth={2}
                  className={cn(
                    "transition-colors",
                    activeTab === item.id
                      ? "txt-tone-primary"
                      : "txt-tone-subtle group-hover:txt-tone-primary",
                  )}
                />
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1 h-1 rounded-full bg-white"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-bg-surface rounded-none flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className={`${POPUP_CLOSE_BUTTON_CLASS} p-2 text-white/40 hover:text-white outline-none`}
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-[700px] mx-auto py-12 px-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h2 className="txt-role-screen-title txt-tone-primary mb-2">
                      {tabMeta.title}
                    </h2>
                    <p className="txt-role-body-lg txt-tone-subtle">
                      {tabMeta.description}
                    </p>
                  </div>
                  {activeTab === "Account" && account && (
                    <AccountTab
                      data={account}
                      onSave={onSaveAccount}
                      onUploadAvatar={onUploadAvatar}
                      onRemoveAvatar={onRemoveAvatar}
                    />
                  )}
                  {activeTab === "Notifications" && notifications && (
                    <NotificationsTab
                      data={notifications}
                      onSave={onSaveNotifications}
                    />
                  )}
                  {activeTab === "Company" && (
                    <CompanyTab
                      activeWorkspace={activeWorkspace}
                      company={company}
                      loading={loadingCompany}
                      onUpdateWorkspaceGeneral={onUpdateWorkspaceGeneral}
                      onUploadWorkspaceLogo={onUploadWorkspaceLogo}
                      onInviteMember={onInviteMember}
                      onChangeMemberRole={onChangeMemberRole}
                      onRemoveMember={onRemoveMember}
                      onResendInvitation={onResendInvitation}
                      onRevokeInvitation={onRevokeInvitation}
                      onUploadBrandAsset={onUploadBrandAsset}
                      onRemoveBrandAsset={onRemoveBrandAsset}
                      onGetBrandAssetDownloadUrl={onGetBrandAssetDownloadUrl}
                      onSoftDeleteWorkspace={onSoftDeleteWorkspace}
                    />
                  )}
                  {activeTab === "Billing" && <BillingTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
