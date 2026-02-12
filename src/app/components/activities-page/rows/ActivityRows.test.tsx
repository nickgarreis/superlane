/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { CollaborationActivityRow } from "./CollaborationActivityRow";
import { FileActivityRow } from "./FileActivityRow";
import { MembershipActivityRow } from "./MembershipActivityRow";
import { ProjectActivityRow } from "./ProjectActivityRow";
import { TaskActivityRow } from "./TaskActivityRow";
import { WorkspaceActivityRow } from "./WorkspaceActivityRow";
import { formatTaskDueDate } from "../../../lib/dates";

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
});

describe("Activity row renderers", () => {
  test("renders project row with project tone", () => {
    const { container } = render(
      <ProjectActivityRow
        activity={buildActivity({ kind: "project", action: "created" })}
      />,
    );
    expect(screen.getByText("Created project Project One")).toBeInTheDocument();
    expect(container.querySelector(".activity-tone-project")).not.toBeNull();
  });

  test("renders task row with task tone", () => {
    const { container } = render(
      <TaskActivityRow
        activity={buildActivity({
          kind: "task",
          action: "completed",
          taskTitle: "Plan sprint",
        })}
      />,
    );
    expect(screen.getByText("Completed task Plan sprint")).toBeInTheDocument();
    expect(container.querySelector(".activity-tone-task")).not.toBeNull();
  });

  test("renders due date change task row with before/after details", () => {
    const fromEpochMs = Date.UTC(2030, 1, 10, 12, 0, 0, 0);
    const toEpochMs = Date.UTC(2030, 1, 15, 12, 0, 0, 0);
    render(
      <TaskActivityRow
        activity={buildActivity({
          kind: "task",
          action: "due_date_changed",
          taskTitle: "Prepare launch assets",
          fromValue: String(fromEpochMs),
          toValue: String(toEpochMs),
        })}
      />,
    );
    expect(
      screen.getByText("Rescheduled Prepare launch assets"),
    ).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText(formatTaskDueDate(fromEpochMs))).toBeInTheDocument();
    expect(screen.getByText(formatTaskDueDate(toEpochMs))).toBeInTheDocument();
    expect(screen.getByText("Moved 5 days later")).toBeInTheDocument();
  });

  test("renders collaboration row with collaboration tone", () => {
    const { container } = render(
      <CollaborationActivityRow
        activity={buildActivity({
          kind: "collaboration",
          action: "mention_added",
          targetUserName: "Taylor",
        })}
      />,
    );
    expect(
      screen.getByText("Mentioned Taylor in a comment"),
    ).toBeInTheDocument();
    expect(container.querySelector(".activity-tone-collaboration")).not.toBeNull();
  });

  test("renders file row with file tone", () => {
    const { container } = render(
      <FileActivityRow
        activity={buildActivity({
          kind: "file",
          action: "uploaded",
          fileName: "brief.pdf",
          fileTab: "Assets",
        })}
      />,
    );
    expect(screen.getByText("Uploaded brief.pdf")).toBeInTheDocument();
    expect(container.querySelector(".activity-tone-file")).not.toBeNull();
  });

  test("renders file conflict upload row copy", () => {
    render(
      <FileActivityRow
        activity={buildActivity({
          kind: "file",
          action: "uploaded_with_conflict",
          fileName: "brief.pdf",
        })}
      />,
    );
    expect(
      screen.getByText("Uploaded brief.pdf (name conflict)"),
    ).toBeInTheDocument();
  });

  test("renders membership row with membership tone", () => {
    const { container } = render(
      <MembershipActivityRow
        activity={buildActivity({
          kind: "membership",
          action: "member_removed",
          targetUserName: "Jordan",
        })}
      />,
    );
    expect(screen.getByText("Removed Jordan")).toBeInTheDocument();
    expect(container.querySelector(".activity-tone-membership")).not.toBeNull();
  });

  test("renders workspace and organization rows with correct tones", () => {
    const workspaceResult = render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "workspace",
          action: "workspace_logo_updated",
        })}
      />,
    );
    expect(screen.getByText("Updated workspace logo")).toBeInTheDocument();
    expect(
      workspaceResult.container.querySelector(".activity-tone-workspace"),
    ).not.toBeNull();

    const organizationResult = render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "organization",
          action: "organization_membership_sync",
          message: "Added 2, removed 1",
        })}
      />,
    );
    expect(screen.getByText("Synced organization membership")).toBeInTheDocument();
    expect(
      organizationResult.container.querySelector(".activity-tone-organization"),
    ).not.toBeNull();
  });

  test("supports interactive shell mode with click and keyboard", () => {
    const onClick = vi.fn();
    render(
      <ActivityRowShell
        kind="project"
        title="Interactive row"
        meta="just now"
        actorName="Alex"
        actorAvatarUrl={null}
        onClick={onClick}
      />,
    );

    const rowButton = screen.getByRole("button");
    fireEvent.click(rowButton);
    fireEvent.keyDown(rowButton, { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
