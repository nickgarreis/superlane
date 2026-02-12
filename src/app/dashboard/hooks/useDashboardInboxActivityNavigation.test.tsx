/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ProjectData, WorkspaceActivity } from "../../types";
import { useDashboardInboxActivityNavigation } from "./useDashboardInboxActivityNavigation";

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const buildProject = (overrides: Partial<ProjectData> = {}): ProjectData => ({
  id: overrides.id ?? "project-1",
  name: overrides.name ?? "Project One",
  description: overrides.description ?? "Description",
  creator: overrides.creator ?? { name: "Owner", avatar: "" },
  status: overrides.status ?? {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: overrides.category ?? "Web",
  archived: overrides.archived ?? false,
  ...overrides,
});

const buildActivity = (
  overrides: Partial<WorkspaceActivity>,
): WorkspaceActivity => ({
  id: overrides.id ?? "activity-1",
  kind: overrides.kind ?? "project",
  action: overrides.action ?? "created",
  actorType: overrides.actorType ?? "user",
  actorUserId: overrides.actorUserId ?? "user-1",
  actorName: overrides.actorName ?? "Alex",
  actorAvatarUrl: overrides.actorAvatarUrl ?? null,
  projectPublicId: overrides.projectPublicId ?? "project-1",
  projectName: overrides.projectName ?? "Project One",
  projectVisibility: overrides.projectVisibility ?? "workspace",
  projectOwnerUserId: overrides.projectOwnerUserId ?? "user-1",
  taskId: overrides.taskId ?? null,
  taskTitle: overrides.taskTitle ?? null,
  fileName: overrides.fileName ?? null,
  fileTab: overrides.fileTab ?? null,
  targetUserId: overrides.targetUserId ?? null,
  targetUserName: overrides.targetUserName ?? null,
  targetRole: overrides.targetRole ?? null,
  fromValue: overrides.fromValue ?? null,
  toValue: overrides.toValue ?? null,
  message: overrides.message ?? null,
  errorCode: overrides.errorCode ?? null,
  createdAt: overrides.createdAt ?? Date.now(),
  isRead: overrides.isRead ?? false,
});

const createArgs = () => ({
  projects: {
    "project-1": buildProject({ id: "project-1", archived: false }),
    "project-arch": buildProject({ id: "project-arch", archived: true }),
  } as Record<string, ProjectData>,
  navigateViewPreservingInbox: vi.fn(),
  setPendingHighlight: vi.fn(),
  handleOpenSettingsWithFocus: vi.fn(),
});

describe("useDashboardInboxActivityNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("navigates and sets pending highlight for task and file activities", () => {
    const args = createArgs();
    const { result } = renderHook(() =>
      useDashboardInboxActivityNavigation(args),
    );

    act(() => {
      result.current(
        buildActivity({
          kind: "task",
          action: "completed",
          projectPublicId: "project-1",
          taskId: "task-1",
        }),
      );
    });

    expect(args.navigateViewPreservingInbox).toHaveBeenCalledWith("project:project-1");
    expect(args.setPendingHighlight).toHaveBeenCalledWith({
      projectId: "project-1",
      type: "task",
      taskId: "task-1",
    });

    act(() => {
      result.current(
        buildActivity({
          kind: "file",
          action: "uploaded",
          projectPublicId: "project-arch",
          fileName: "brief.pdf",
          fileTab: "Assets",
        }),
      );
    });

    expect(args.navigateViewPreservingInbox).toHaveBeenLastCalledWith(
      "archive-project:project-arch",
    );
    expect(args.setPendingHighlight).toHaveBeenLastCalledWith({
      projectId: "project-arch",
      type: "file",
      fileName: "brief.pdf",
      fileTab: "Assets",
    });
  });

  test("opens company settings with focus targets for membership and workspace events", () => {
    const args = createArgs();
    const { result } = renderHook(() =>
      useDashboardInboxActivityNavigation(args),
    );

    act(() => {
      result.current(
        buildActivity({
          kind: "membership",
          action: "member_invited",
          projectPublicId: null,
          targetUserName: "invitee@example.com",
        }),
      );
    });

    expect(args.handleOpenSettingsWithFocus).toHaveBeenCalledWith({
      tab: "Company",
      focus: { kind: "invitation", email: "invitee@example.com" },
    });

    act(() => {
      result.current(
        buildActivity({
          kind: "membership",
          action: "member_role_changed",
          projectPublicId: null,
          targetUserId: "member-1",
          targetUserName: "member@example.com",
        }),
      );
    });

    expect(args.handleOpenSettingsWithFocus).toHaveBeenCalledWith({
      tab: "Company",
      focus: { kind: "member", userId: "member-1", email: "member@example.com" },
    });

    act(() => {
      result.current(
        buildActivity({
          kind: "workspace",
          action: "brand_asset_uploaded",
          projectPublicId: null,
          fileName: "Logo Kit.pdf",
        }),
      );
    });

    expect(args.handleOpenSettingsWithFocus).toHaveBeenCalledWith({
      tab: "Company",
      focus: { kind: "brandAsset", assetName: "Logo Kit.pdf" },
    });
  });

  test("shows toast and skips navigation when project target is missing", () => {
    const args = createArgs();
    args.projects = {};
    const { result } = renderHook(() =>
      useDashboardInboxActivityNavigation(args),
    );

    act(() => {
      result.current(
        buildActivity({
          kind: "project",
          action: "renamed",
          projectPublicId: "project-missing",
        }),
      );
    });

    expect(toastErrorMock).toHaveBeenCalledWith("Project is no longer available.");
    expect(args.navigateViewPreservingInbox).not.toHaveBeenCalled();
    expect(args.setPendingHighlight).not.toHaveBeenCalled();
    expect(args.handleOpenSettingsWithFocus).not.toHaveBeenCalled();
  });
});
