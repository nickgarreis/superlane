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
import { buildMentionUserAvatarLookup } from "../../mentions/userAvatarLookup";

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
  targetUserAvatarUrl: overrides.targetUserAvatarUrl ?? null,
  targetRole: overrides.targetRole ?? null,
  fromValue: overrides.fromValue ?? null,
  toValue: overrides.toValue ?? null,
  message: overrides.message ?? null,
  errorCode: overrides.errorCode ?? null,
  createdAt: overrides.createdAt ?? Date.now(),
});

describe("Activity row renderers", () => {
  test("renders project row with search-style project icon chrome", () => {
    render(
      <ProjectActivityRow
        activity={buildActivity({ kind: "project", action: "created" })}
      />,
    );
    expect(screen.getByText("Created project Project One")).toBeInTheDocument();
    expect(screen.queryByText("Important")).toBeNull();
    const typeIcon = screen.getByLabelText("Projects activity type");
    expect(typeIcon).toHaveClass("bg-surface-hover-soft");
    expect(typeIcon.querySelector(".lucide-palette")).toBeNull();
  });

  test("renders task row with search-style task icon chrome", () => {
    render(
      <TaskActivityRow
        activity={buildActivity({
          kind: "task",
          action: "completed",
          taskTitle: "Plan sprint",
        })}
      />,
    );
    expect(screen.getByText("Completed task Plan sprint")).toBeInTheDocument();
    const typeIcon = screen.getByLabelText("Tasks activity type");
    expect(typeIcon).toHaveClass("bg-surface-muted-soft");
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
      screen.getByText("Updated due date for Prepare launch assets"),
    ).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText(formatTaskDueDate(fromEpochMs))).toBeInTheDocument();
    expect(screen.getAllByText(formatTaskDueDate(toEpochMs)).length).toBeGreaterThan(0);
    expect(screen.getByText("Moved 5 days later")).toBeInTheDocument();
  });

  test("renders collaboration row with neutral icon chrome", () => {
    render(
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
    const importantBadge = screen.getByText("Important");
    expect(importantBadge).toHaveAttribute("data-sidebar-tag-tone", "important");
    expect(importantBadge).toHaveClass("txt-tone-danger");
    expect(importantBadge).toHaveClass("bg-popup-danger-soft");
    expect(importantBadge).toHaveClass("border-popup-danger-soft-strong");
    expect(importantBadge).toHaveClass("rounded-full");
    expect(importantBadge).toHaveClass("border");
    const typeIcon = screen.getByLabelText("Collaboration activity type");
    expect(typeIcon).toHaveClass("bg-surface-muted-soft");
  });

  test("shows important tag for upload-failed file activities", () => {
    render(
      <FileActivityRow
        activity={buildActivity({
          kind: "file",
          action: "upload_failed",
          fileName: "broken.pdf",
        })}
      />,
    );

    expect(screen.getByText("Upload failed for file broken.pdf")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  test("renders file row with search-style file icon chrome", () => {
    render(
      <FileActivityRow
        activity={buildActivity({
          kind: "file",
          action: "uploaded",
          fileName: "brief.pdf",
          fileTab: "Assets",
        })}
      />,
    );
    expect(screen.getByText("Uploaded file brief.pdf")).toBeInTheDocument();
    const typeIcon = screen.getByLabelText("Files activity type");
    expect(typeIcon).toHaveClass("bg-surface-muted-soft");
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
      screen.getByText("Uploaded file brief.pdf (name conflict)"),
    ).toBeInTheDocument();
  });

  test("renders membership row with neutral icon chrome", () => {
    render(
      <MembershipActivityRow
        activity={buildActivity({
          kind: "membership",
          action: "member_removed",
          targetUserName: "Jordan",
        })}
      />,
    );
    expect(screen.getByText("Removed Jordan")).toBeInTheDocument();
    const typeIcon = screen.getByLabelText("Members activity type");
    expect(typeIcon).toHaveClass("bg-surface-muted-soft");
  });

  test("renders membership row with target user profile image type icon", () => {
    render(
      <MembershipActivityRow
        activity={buildActivity({
          kind: "membership",
          action: "member_joined",
          targetUserName: "Jordan",
          targetUserAvatarUrl: "https://example.com/jordan.png",
        })}
      />,
    );

    const typeIcon = screen.getByLabelText("Members activity type");
    expect(typeIcon.querySelector("img[alt='Jordan profile image']")).not.toBeNull();
  });

  test("renders workspace and organization rows with neutral icon chrome", () => {
    const workspaceResult = render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "workspace",
          action: "workspace_logo_updated",
        })}
      />,
    );
    expect(screen.getByText("Updated workspace logo")).toBeInTheDocument();
    const workspaceTypeIcon = screen.getByLabelText("Workspace activity type");
    expect(workspaceTypeIcon).toHaveClass("bg-surface-muted-soft");

    const organizationResult = render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "organization",
          action: "organization_membership_sync",
          message: "Added 2, removed 1",
        })}
      />,
    );
    expect(screen.getByText("Synced organization members")).toBeInTheDocument();
    const organizationTypeIcon = screen.getByLabelText("Organization activity type");
    expect(organizationTypeIcon).toHaveClass("bg-surface-muted-soft");
    workspaceResult.unmount();
    organizationResult.unmount();
  });

  test("renders mention-mode titles as readable text and handles mention clicks", () => {
    const onMentionClick = vi.fn();
    render(
      <ProjectActivityRow
        activity={buildActivity({
          kind: "project",
          action: "created",
          projectName: "Mention Project",
        })}
        mentionMode="inbox"
        onMentionClick={onMentionClick}
      />,
    );

    expect(screen.getByText(/Created project/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Mention Project"));
    // Project mentions are routed through the shared file mention handler.
    expect(onMentionClick).toHaveBeenCalledWith("file", "Mention Project");
  });

  test("uses wrap-safe mention classes for long inbox project titles", () => {
    const onMentionClick = vi.fn();
    const longProjectName =
      "ProjectNameWithNoSpacesThatShouldBreakAcrossLinesInInboxActivityRows";

    render(
      <ProjectActivityRow
        activity={buildActivity({
          kind: "project",
          action: "created",
          projectName: longProjectName,
        })}
        mentionMode="inbox"
        onMentionClick={onMentionClick}
      />,
    );

    const label = screen.getByText(longProjectName);
    expect(label).toHaveClass("break-words", "min-w-0");
    expect(label).not.toHaveClass("break-all");
    expect(label.parentElement).toHaveClass("max-w-full", "min-w-0", "items-start");
    expect(label.parentElement).not.toHaveClass("items-center");
    const leadingVisual = label.parentElement?.firstElementChild;
    expect(leadingVisual).toHaveClass("shrink-0", "pt-[2px]");
  });

  test("renders inbox comment snippets with mention badges and handles mention clicks", () => {
    const onMentionClick = vi.fn();
    render(
      <CollaborationActivityRow
        activity={buildActivity({
          kind: "collaboration",
          action: "comment_added",
          projectName: "Mention Project",
          message: "@[user:Nick Garreis]",
        })}
        mentionMode="inbox"
        onMentionClick={onMentionClick}
      />,
    );

    expect(screen.queryByText("@[user:Nick Garreis]")).toBeNull();
    fireEvent.click(screen.getByText("Nick Garreis"));
    expect(onMentionClick).toHaveBeenCalledWith("user", "Nick Garreis");
  });

  test("renders collaboration mention-mode user mention avatar when lookup is provided", () => {
    render(
      <CollaborationActivityRow
        activity={buildActivity({
          kind: "collaboration",
          action: "mention_added",
          targetUserName: "Taylor",
        })}
        mentionMode="inbox"
        mentionRenderOptions={{
          userAvatarByLabel: buildMentionUserAvatarLookup([
            { label: "Taylor", avatarUrl: "https://example.com/taylor.png" },
          ]),
        }}
      />,
    );

    const avatar = screen.getByAltText("Taylor profile image");
    expect(avatar).toHaveAttribute("src", "https://example.com/taylor.png");
  });

  test("renders task assignee mention avatar in inbox mode when lookup is provided", () => {
    render(
      <TaskActivityRow
        activity={buildActivity({
          kind: "task",
          action: "assignee_changed",
          taskTitle: "Plan sprint",
          targetUserName: "Jordan",
        })}
        mentionMode="inbox"
        mentionRenderOptions={{
          userAvatarByLabel: buildMentionUserAvatarLookup([
            { label: "Jordan", avatarUrl: "https://example.com/jordan.png" },
          ]),
        }}
      />,
    );

    const avatar = screen.getByAltText("Jordan profile image");
    expect(avatar).toHaveAttribute("src", "https://example.com/jordan.png");
  });

  test("renders membership mention avatar in inbox mode when lookup is provided", () => {
    render(
      <MembershipActivityRow
        activity={buildActivity({
          kind: "membership",
          action: "member_removed",
          targetUserName: "Morgan",
        })}
        mentionMode="inbox"
        mentionRenderOptions={{
          userAvatarByLabel: buildMentionUserAvatarLookup([
            { label: "Morgan", avatarUrl: "https://example.com/morgan.png" },
          ]),
        }}
      />,
    );

    const avatar = screen.getByAltText("Morgan profile image");
    expect(avatar).toHaveAttribute("src", "https://example.com/morgan.png");
  });

  test("renders inbox comment-added title as actor mention then project mention", () => {
    const onMentionClick = vi.fn();
    render(
      <CollaborationActivityRow
        activity={buildActivity({
          kind: "collaboration",
          action: "comment_added",
          actorName: "Nick Garreis",
          projectName: "Website Redesign",
          message: "Looks good.",
        })}
        mentionMode="inbox"
        onMentionClick={onMentionClick}
      />,
    );

    expect(screen.getByText(/added a comment in/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Nick Garreis"));
    expect(onMentionClick).toHaveBeenCalledWith("user", "Nick Garreis");
    fireEvent.click(screen.getByText("Website Redesign"));
    expect(onMentionClick).toHaveBeenCalledWith("file", "Website Redesign");
  });

  test("does not duplicate actor mention under created-at when snippet is actor mention only", () => {
    const onMentionClick = vi.fn();
    render(
      <CollaborationActivityRow
        activity={buildActivity({
          kind: "collaboration",
          action: "comment_added",
          actorName: "Nick Garreis",
          projectName: "Website Redesign",
          message: "@[user:Nick Garreis]",
        })}
        mentionMode="inbox"
        onMentionClick={onMentionClick}
      />,
    );

    expect(screen.getAllByText("Nick Garreis")).toHaveLength(1);
    fireEvent.click(screen.getByText("Nick Garreis"));
    expect(onMentionClick).toHaveBeenCalledWith("user", "Nick Garreis");
  });

  test("renders workspace updates without duplicate workspace-name context item", () => {
    render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "workspace",
          action: "workspace_general_updated",
          fromValue: "Old Workspace",
          toValue: "New Workspace",
        })}
      />,
    );

    expect(screen.queryByText("Workspace Name")).toBeNull();
    expect(screen.queryByText(/From:/)).toBeNull();
    expect(screen.queryByText(/To:/)).toBeNull();
  });

  test("formats organization sync JSON payload into labeled values", () => {
    render(
      <WorkspaceActivityRow
        activity={buildActivity({
          kind: "organization",
          action: "organization_membership_sync",
          message:
            "{\"importedMemberships\":2,\"syncedWorkspaceMembers\":2,\"removedMemberships\":0}",
        })}
      />,
    );

    expect(screen.queryByText(/Imported:/)).toBeNull();
    expect(screen.queryByText(/Synced:/)).toBeNull();
    expect(screen.queryByText(/Removed:/)).toBeNull();
    expect(screen.queryByText(/importedMemberships/)).toBeNull();
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
