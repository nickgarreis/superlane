import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Building2, CreditCard, User, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { AccountTab } from "./settings-popup/AccountTab";
import { BillingTab } from "./settings-popup/BillingTab";
import { CompanyTab } from "./settings-popup/CompanyTab";
import { NotificationsTab } from "./settings-popup/NotificationsTab";
import type { SettingsPopupProps, SettingsTab } from "./settings-popup/types";

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

const tabMetaById = SETTINGS_TABS.reduce<Record<SettingsTab, (typeof SETTINGS_TABS)[number]>>(
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
  onRemoveWorkspaceLogo,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
  onUploadBrandAsset,
  onRemoveBrandAsset,
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[980px] h-[680px] bg-bg-base border border-white/10 rounded-[24px] shadow-2xl flex overflow-hidden font-['Roboto',sans-serif] text-[#E8E8E8]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-[240px] flex flex-col py-6 px-4 shrink-0 bg-bg-base">
          <div className="px-2 mb-6 mt-2">
            <span className="text-[18px] font-medium text-[#E8E8E8]">Settings</span>
          </div>

          <div className="flex flex-col gap-1">
            {SETTINGS_TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all group outline-none cursor-pointer",
                  activeTab === item.id
                    ? "bg-white/10 text-[#E8E8E8]"
                    : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5",
                )}
              >
                <item.icon
                  size={16}
                  strokeWidth={2}
                  className={cn(
                    "transition-colors",
                    activeTab === item.id ? "text-[#E8E8E8]" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]",
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

        <div className="flex-1 bg-bg-surface m-2 rounded-[20px] border border-white/5 flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-[700px] mx-auto py-12 px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h2 className="text-[24px] font-medium text-[#E8E8E8] mb-2">{tabMeta.title}</h2>
                    <p className="text-[14px] text-[#E8E8E8]/60">{tabMeta.description}</p>
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
                      onRemoveWorkspaceLogo={onRemoveWorkspaceLogo}
                      onInviteMember={onInviteMember}
                      onChangeMemberRole={onChangeMemberRole}
                      onRemoveMember={onRemoveMember}
                      onResendInvitation={onResendInvitation}
                      onRevokeInvitation={onRevokeInvitation}
                      onUploadBrandAsset={onUploadBrandAsset}
                      onRemoveBrandAsset={onRemoveBrandAsset}
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
