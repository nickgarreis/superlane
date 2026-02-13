import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Building2, Settings, User, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { AccountTab } from "./settings-popup/AccountTab";
import { CompanyTab } from "./settings-popup/CompanyTab";
import { NotificationsTab } from "./settings-popup/NotificationsTab";
import { SettingsDangerZoneSection } from "./settings-popup/SettingsDangerZoneSection";
import type { SettingsPopupProps, SettingsTab } from "./settings-popup/types";
import { Z_LAYERS } from "../lib/zLayers";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "./popup/popupChrome";
import { GHOST_ICON_BUTTON_CLASS } from "./ui/controlChrome";

type VisibleSettingsSection = Exclude<SettingsTab, "Workspace" | "Billing">;

const SETTINGS_SECTIONS: Array<{
  id: VisibleSettingsSection;
  icon: typeof User;
  label: string;
  description: string;
}> = [
  {
    id: "Account",
    icon: User,
    label: "My Account",
    description: "Manage your personal profile and preferences.",
  },
  {
    id: "Notifications",
    icon: Bell,
    label: "Notifications",
    description: "Control your app notification settings.",
  },
  {
    id: "Company",
    icon: Building2,
    label: "Company",
    description: "Manage workspace settings, members, and brand assets.",
  },
];

const normalizeSection = (section: SettingsTab): VisibleSettingsSection =>
  section === "Billing" || section === "Workspace" ? "Company" : section;

export function SettingsPopup({
  isOpen,
  onClose,
  initialTab = "Account",
  initialFocusTarget = null,
  activeWorkspace,
  viewerRole,
  account,
  notifications,
  company,
  loadingCompany,
  onSaveAccount,
  onRequestPasswordReset,
  onUploadAvatar,
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
  const initialSection = useCallback(
    (): VisibleSettingsSection =>
      initialFocusTarget ? "Company" : normalizeSection(initialTab),
    [initialFocusTarget, initialTab],
  );
  const [activeSection, setActiveSection] = useState<VisibleSettingsSection>(
    initialSection,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<VisibleSettingsSection, HTMLElement | null>>({
    Account: null,
    Notifications: null,
    Company: null,
  });
  const scrollToSection = useCallback(
    (section: SettingsTab, behavior: ScrollBehavior = "smooth") => {
      const normalizedSection = normalizeSection(section);
      setActiveSection(normalizedSection);
      const content = contentRef.current;
      const target = sectionRefs.current[normalizedSection];
      if (!content || !target) {
        return;
      }
      const contentTop = content.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const nextTop = content.scrollTop + (targetTop - contentTop) - 16;
      if (typeof content.scrollTo === "function") {
        content.scrollTo({ top: Math.max(nextTop, 0), behavior });
        return;
      }
      content.scrollTop = Math.max(nextTop, 0);
    },
    [],
  );
  const handleContentScroll = useCallback(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const threshold = content.getBoundingClientRect().top + 80;
    let nextActive = SETTINGS_SECTIONS[0].id;
    for (const section of SETTINGS_SECTIONS) {
      const node = sectionRefs.current[section.id];
      if (!node) {
        continue;
      }
      if (node.getBoundingClientRect().top <= threshold) {
        nextActive = section.id;
        continue;
      }
      break;
    }
    setActiveSection((current) => (current === nextActive ? current : nextActive));
  }, []);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const nextSection = initialSection();
    setActiveSection(nextSection);
    const timer = window.setTimeout(() => {
      scrollToSection(nextSection, "auto");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialSection, isOpen, scrollToSection]);
  if (!isOpen) {
    return null;
  }
  return (
    <div
      className={POPUP_OVERLAY_CENTER_CLASS}
      style={{ zIndex: Z_LAYERS.modalPriority }}
      onClick={onClose}
    >
      <div
        className={`${POPUP_SHELL_CLASS} max-w-[660px] h-[min(88vh,700px)] flex flex-col font-app txt-tone-primary`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden="true" className={POPUP_SHELL_BORDER_CLASS} />
        <div className="shrink-0 border-b border-border-subtle-soft px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Settings size={17} className="txt-tone-subtle" />
                <h2 className="txt-role-body-xl font-medium txt-tone-primary text-[18px] leading-[1.35]">
                  Settings
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                POPUP_CLOSE_BUTTON_CLASS,
                GHOST_ICON_BUTTON_CLASS,
                "p-2 text-text-muted-medium hover:text-text-tone-primary",
              )}
              aria-label="Close settings popup"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="min-w-0 flex flex-1 overflow-x-auto pr-1">
              <div className="inline-flex min-w-max items-stretch rounded-[10px] bg-bg-muted-surface p-1">
                {SETTINGS_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    aria-current={activeSection === section.id ? "page" : undefined}
                    className={cn(
                      "relative isolate cursor-pointer shrink-0 rounded-[6px] px-3 py-1.5 txt-role-body-sm font-medium transition-colors",
                      activeSection === section.id
                        ? "txt-tone-primary"
                        : "txt-tone-subtle hover:txt-tone-primary",
                    )}
                  >
                    {activeSection === section.id ? (
                      <motion.span
                        layoutId="settings-nav-active-indicator"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[6px] bg-surface-active-soft"
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 40,
                          mass: 0.45,
                        }}
                      />
                    ) : null}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <section.icon
                        size={14}
                        strokeWidth={2.1}
                        className={cn(
                          "transition-colors",
                          activeSection === section.id
                            ? "txt-tone-primary"
                            : "txt-tone-subtle",
                        )}
                      />
                      <span>{section.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <SettingsDangerZoneSection
              company={company}
              viewerRole={viewerRole}
              onSoftDeleteWorkspace={onSoftDeleteWorkspace}
              layout="button"
            />
          </div>
        </div>
        <div
          ref={contentRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-popup"
        >
          <div className="mx-auto w-full px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-12">
              {SETTINGS_SECTIONS.map((section) => (
                <div key={section.id}>
                  <section
                    ref={(node) => {
                      sectionRefs.current[section.id] = node;
                    }}
                    className="scroll-mt-24 flex flex-col"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <section.icon size={14} className="txt-tone-subtle" />
                      <h3 className="txt-role-body-md font-medium txt-tone-primary">
                        {section.label}
                      </h3>
                    </div>
                    <p className="mb-5 txt-role-body-sm txt-tone-faint">
                      {section.description}
                    </p>
                    {section.id === "Account" && account && (
                      <AccountTab
                        data={account}
                        onSave={onSaveAccount}
                        onRequestPasswordReset={onRequestPasswordReset}
                        onUploadAvatar={onUploadAvatar}
                      />
                    )}
                    {section.id === "Notifications" && notifications && (
                      <NotificationsTab
                        data={notifications}
                        onSave={onSaveNotifications}
                      />
                    )}
                    {section.id === "Company" && (
                      <CompanyTab
                        activeWorkspace={activeWorkspace}
                        company={company}
                        loading={loadingCompany}
                        focusTarget={initialFocusTarget}
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
                      />
                    )}
                  </section>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
