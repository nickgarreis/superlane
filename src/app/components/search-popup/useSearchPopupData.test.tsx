/** @vitest-environment jsdom */

import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useSearchPopupData } from "./useSearchPopupData";
import type { ProjectData, ProjectFileData } from "../../types";
import type { QuickAction } from "./types";

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "action-create",
    label: "Create New Project",
    icon: <span />,
    keyword: "create new add project",
  },
  {
    id: "action-tasks",
    label: "Go to Tasks",
    icon: <span />,
    keyword: "tasks todo list",
  },
  {
    id: "action-assets",
    label: "Go to Brand Assets",
    icon: <span />,
    keyword: "brand assets design",
  },
  {
    id: "action-inbox",
    label: "Open Inbox",
    icon: <span />,
    keyword: "inbox activity log activity",
  },
  {
    id: "action-archive",
    label: "Go to Archive",
    icon: <span />,
    keyword: "archive archived",
  },
  {
    id: "action-settings",
    label: "Open Settings",
    icon: <span />,
    keyword: "settings preferences config",
  },
];

const PROJECTS: Record<string, ProjectData> = {
  "project-1": {
    id: "project-1",
    name: "Website Redesign",
    description: "Refresh homepage",
    creator: { name: "Owner", avatar: "" },
    status: {
      label: "Active",
      color: "#58AFFF",
      bgColor: "rgba(88,175,255,0.12)",
      dotColor: "#58AFFF",
    },
    category: "Web",
    archived: false,
    tasks: [
      {
        id: "task-1",
        title: "Draft homepage wireframe",
        assignee: { name: "Alex", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
      },
    ],
  },
  "project-2": {
    id: "project-2",
    name: "Internal Ops",
    description: "Admin area",
    creator: { name: "Owner", avatar: "" },
    status: {
      label: "Draft",
      color: "#F5B042",
      bgColor: "rgba(245,176,66,0.12)",
      dotColor: "#F5B042",
    },
    category: "Ops",
    archived: false,
    tasks: [],
  },
};

const FILES: ProjectFileData[] = [
  {
    id: "file-1",
    projectPublicId: "project-1",
    tab: "Attachments",
    name: "brief.pdf",
    type: "PDF",
    displayDateEpochMs: 1700000000000,
  },
  {
    id: "file-2",
    projectPublicId: "",
    tab: "Assets",
    name: "hero-logo.png",
    type: "PNG",
    displayDateEpochMs: 1700000000000,
  },
];

describe("useSearchPopupData", () => {
  test("wires quick action handlers", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    const onOpenInbox = vi.fn();
    const onOpenCreateProject = vi.fn();
    const onOpenSettings = vi.fn();

    const { result } = renderHook(() =>
      useSearchPopupData({
        projects: PROJECTS,
        files: FILES,
        query: "",
        deferredQuery: "",
        recentResults: [],
        onClose,
        onNavigate,
        onOpenInbox,
        onOpenCreateProject,
        onOpenSettings,
        quickActions: QUICK_ACTIONS,
      }),
    );

    result.current.actionHandlers["action-create"]();
    result.current.actionHandlers["action-tasks"]();
    result.current.actionHandlers["action-assets"]();
    result.current.actionHandlers["action-inbox"]();
    result.current.actionHandlers["action-archive"]();
    result.current.actionHandlers["action-settings"]();

    expect(onClose).toHaveBeenCalledTimes(6);
    expect(onOpenCreateProject).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("tasks");
    expect(onOpenInbox).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("archive");
    expect(onOpenSettings).toHaveBeenCalledWith("Company");
    expect(onOpenSettings).toHaveBeenCalledWith();
  });

  test("builds task and file search results that navigate and highlight", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    const onHighlightNavigate = vi.fn();

    const baseArgs = {
      projects: PROJECTS,
      files: FILES,
      query: "wireframe",
      deferredQuery: "wireframe",
      recentResults: [],
      onClose,
      onNavigate,
      onOpenInbox: vi.fn(),
      onOpenCreateProject: vi.fn(),
      onOpenSettings: vi.fn(),
      onHighlightNavigate,
      quickActions: QUICK_ACTIONS,
    };

    const { result, rerender } = renderHook(
      (props: typeof baseArgs) => useSearchPopupData(props),
      {
        initialProps: baseArgs,
      },
    );

    const taskResult = result.current.flatResults.find(
      (entry) => entry.type === "task",
    );
    expect(taskResult).toBeDefined();
    taskResult?.action();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("project:project-1");
    expect(onHighlightNavigate).toHaveBeenCalledWith("project-1", {
      type: "task",
      taskId: "task-1",
    });

    rerender({
      ...baseArgs,
      query: "brief",
      deferredQuery: "brief",
    });

    const fileResult = result.current.flatResults.find(
      (entry) => entry.type === "file",
    );
    expect(fileResult).toBeDefined();
    fileResult?.action();

    expect(onNavigate).toHaveBeenCalledWith("project:project-1");
    expect(onHighlightNavigate).toHaveBeenCalledWith("project-1", {
      type: "file",
      fileName: "brief.pdf",
      fileTab: "Attachments",
    });
  });

  test("builds default content and suggestions when query is empty", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    const onHighlightNavigate = vi.fn();

    const { result } = renderHook(() =>
      useSearchPopupData({
        projects: PROJECTS,
        files: FILES,
        query: "",
        deferredQuery: "",
        recentResults: [
          { id: "project-1", title: "Website Redesign", type: "project" },
        ],
        onClose,
        onNavigate,
        onOpenInbox: vi.fn(),
        onOpenCreateProject: vi.fn(),
        onOpenSettings: vi.fn(),
        onHighlightNavigate,
        quickActions: QUICK_ACTIONS,
      }),
    );

    expect(result.current.defaultContent.length).toBeGreaterThan(0);
    expect(result.current.suggestions.length).toBeGreaterThan(0);

    result.current.defaultContent[0].action();
    result.current.suggestions[0].action();

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenCalledWith("project:project-1");
    expect(onHighlightNavigate).toHaveBeenCalledWith("project-1", {
      type: "task",
      taskId: "task-1",
    });
  });
});
