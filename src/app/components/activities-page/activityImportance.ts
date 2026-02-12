import type { WorkspaceActivity, WorkspaceActivityKind } from "../../types";

const IMPORTANT_ACTIONS_BY_KIND: Partial<Record<WorkspaceActivityKind, Set<string>>> = {
  project: new Set(["deleted"]),
  task: new Set(["deleted", "due_date_changed", "assignee_changed", "moved_project"]),
  collaboration: new Set(["mention_added"]),
  file: new Set(["upload_failed"]),
  membership: new Set(["member_invited", "member_role_changed", "member_removed"]),
  workspace: new Set(["workspace_general_updated", "workspace_logo_removed", "brand_asset_removed"]),
  organization: new Set(["organization_membership_sync"]),
};

export const isImportantActivity = (
  activity: Pick<WorkspaceActivity, "kind" | "action">,
): boolean => IMPORTANT_ACTIONS_BY_KIND[activity.kind]?.has(activity.action) ?? false;

