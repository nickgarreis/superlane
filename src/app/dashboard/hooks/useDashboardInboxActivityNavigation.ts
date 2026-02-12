import { useCallback } from "react";
import { toast } from "sonner";
import type { AppView } from "../../lib/routing";
import type { ProjectData, WorkspaceActivity } from "../../types";
import type {
  PendingHighlight,
  SettingsFocusTarget,
} from "../types";

type UseDashboardInboxActivityNavigationArgs = {
  projects: Record<string, ProjectData>;
  navigateViewPreservingInbox: (view: AppView) => void;
  setPendingHighlight: (highlight: PendingHighlight) => void;
  handleOpenSettingsWithFocus: (args: {
    tab?: "Account" | "Notifications" | "Company" | "Workspace" | "Billing";
    focus?: SettingsFocusTarget | null;
  }) => void;
};

const trimValue = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const maybeEmail = (value: string | null | undefined): string | null => {
  const normalized = trimValue(value);
  if (!normalized || !normalized.includes("@")) {
    return null;
  }
  return normalized;
};

export function useDashboardInboxActivityNavigation({
  projects,
  navigateViewPreservingInbox,
  setPendingHighlight,
  handleOpenSettingsWithFocus,
}: UseDashboardInboxActivityNavigationArgs) {
  const openCompanySettings = useCallback(
    (focus?: SettingsFocusTarget | null) => {
      handleOpenSettingsWithFocus({
        tab: "Company",
        focus: focus ?? null,
      });
    },
    [handleOpenSettingsWithFocus],
  );

  return useCallback(
    (activity: WorkspaceActivity) => {
      const projectId = trimValue(activity.projectPublicId);
      const project = projectId ? projects[projectId] : null;
      const projectView: AppView | null = projectId
        ? project?.archived
          ? `archive-project:${projectId}`
          : `project:${projectId}`
        : null;

      if (activity.kind === "project") {
        if (!projectId || !project) {
          toast.error("Project is no longer available.");
          return;
        }
        navigateViewPreservingInbox(project.archived ? `archive-project:${projectId}` : `project:${projectId}`);
        return;
      }

      if (activity.kind === "task") {
        if (!projectId || !projectView) {
          toast.error("Task context is unavailable.");
          return;
        }
        navigateViewPreservingInbox(projectView);
        const taskId = trimValue(activity.taskId);
        if (taskId) {
          setPendingHighlight({
            projectId,
            type: "task",
            taskId,
          });
        }
        return;
      }

      if (activity.kind === "file") {
        if (!projectId || !projectView) {
          toast.error("File context is unavailable.");
          return;
        }
        navigateViewPreservingInbox(projectView);
        const fileName = trimValue(activity.fileName);
        if (fileName) {
          setPendingHighlight({
            projectId,
            type: "file",
            fileName,
            ...(activity.fileTab ? { fileTab: activity.fileTab } : {}),
          });
        }
        return;
      }

      if (activity.kind === "collaboration") {
        if (!projectView) {
          toast.error("Conversation context is unavailable.");
          return;
        }
        navigateViewPreservingInbox(projectView);
        return;
      }

      if (activity.kind === "membership") {
        if (activity.action === "member_invited") {
          const invitationEmail =
            maybeEmail(activity.targetUserName) ??
            maybeEmail(activity.toValue) ??
            maybeEmail(activity.message);
          openCompanySettings(
            invitationEmail
              ? { kind: "invitation", email: invitationEmail }
              : null,
          );
          return;
        }

        const targetUserId = trimValue(activity.targetUserId);
        const targetEmail =
          maybeEmail(activity.targetUserName) ??
          maybeEmail(activity.toValue) ??
          maybeEmail(activity.fromValue);
        openCompanySettings(
          targetUserId || targetEmail
            ? {
                kind: "member",
                ...(targetUserId ? { userId: targetUserId } : {}),
                ...(targetEmail ? { email: targetEmail } : {}),
              }
            : null,
        );
        return;
      }

      if (activity.kind === "workspace") {
        if (
          (activity.action === "brand_asset_uploaded" ||
            activity.action === "brand_asset_removed") &&
          trimValue(activity.fileName)
        ) {
          openCompanySettings({
            kind: "brandAsset",
            assetName: trimValue(activity.fileName)!,
          });
          return;
        }
        openCompanySettings(null);
        return;
      }

      if (activity.kind === "organization") {
        openCompanySettings(null);
      }
    },
    [
      navigateViewPreservingInbox,
      openCompanySettings,
      projects,
      setPendingHighlight,
    ],
  );
}
