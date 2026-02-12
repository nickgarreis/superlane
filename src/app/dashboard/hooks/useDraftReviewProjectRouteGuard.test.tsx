/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDraftReviewProjectRouteGuard } from "./useDraftReviewProjectRouteGuard";
import type { AppView } from "../../lib/routing";
import type { ProjectData } from "../../types";

const buildProject = (
  id: string,
  statusLabel: "Draft" | "Review" | "Active" | "Completed",
): ProjectData => ({
  id,
  name: id,
  description: `${id} description`,
  creator: { userId: "user-1", name: "User", avatar: "" },
  status: {
    label: statusLabel,
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "General",
  scope: "Scope",
  archived: false,
  tasks: [],
});

type GuardProps = {
  currentView: AppView;
  locationPathname: string;
  projects: Record<string, ProjectData>;
  orderedProjectIds: string[];
  projectsPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  openCompletedProjectsPopup: ReturnType<typeof vi.fn>;
  navigateToPath: ReturnType<typeof vi.fn>;
};

const createBaseArgs = (): GuardProps => ({
  currentView: "tasks",
  locationPathname: "/tasks",
  projects: {},
  orderedProjectIds: [],
  projectsPaginationStatus: "Exhausted",
  openCompletedProjectsPopup: vi.fn(),
  navigateToPath: vi.fn(),
});

describe("useDraftReviewProjectRouteGuard", () => {
  test("redirects direct draft project deep links to /drafts/:id with tasks origin", () => {
    const args = createBaseArgs();
    args.currentView = "project:draft-1";
    args.locationPathname = "/project/draft-1";
    args.projects = { "draft-1": buildProject("draft-1", "Draft") };
    args.orderedProjectIds = ["draft-1"];

    renderHook(() => useDraftReviewProjectRouteGuard(args));

    expect(args.openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/drafts/draft-1?from=%2Ftasks",
      true,
    );
  });

  test("preserves archive origin when redirecting draft project routes", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "draft-1": draftProject };
    args.orderedProjectIds = ["draft-1"];

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "archive",
          locationPathname: "/archive",
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:draft-1",
      locationPathname: "/project/draft-1",
    });

    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/drafts/draft-1?from=%2Farchive",
      true,
    );
  });

  test("uses project detail origin when redirecting draft routes", () => {
    const activeProject = buildProject("active-1", "Active");
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "active-1": activeProject, "draft-1": draftProject };
    args.orderedProjectIds = ["active-1", "draft-1"];

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "project:active-1",
          locationPathname: "/project/active-1",
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:draft-1",
      locationPathname: "/project/draft-1",
    });

    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/drafts/draft-1?from=%2Fproject%2Factive-1",
      true,
    );
  });

  test("redirects review routes to /pending/:id with preserved origin", () => {
    const activeProject = buildProject("active-1", "Active");
    const reviewProject = buildProject("review-1", "Review");
    const args = createBaseArgs();
    args.projects = {
      "active-1": activeProject,
      "review-1": reviewProject,
    };
    args.orderedProjectIds = ["active-1", "review-1"];

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "project:active-1",
          locationPathname: "/project/active-1",
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:review-1",
      locationPathname: "/project/review-1",
    });

    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/pending/review-1?from=%2Fproject%2Factive-1",
      true,
    );
  });

  test("uses cached project data when draft/review project temporarily drops from current map", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "draft-1": draftProject };
    args.orderedProjectIds = ["draft-1"];

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "archive",
          locationPathname: "/archive",
          projects: { "draft-1": draftProject },
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:draft-1",
      locationPathname: "/project/draft-1",
      projects: {},
    });

    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/drafts/draft-1?from=%2Farchive",
      true,
    );
  });

  test("opens completed popup and uses tasks fallback for direct deep-link completed routes", () => {
    const args = createBaseArgs();
    args.currentView = "project:completed-1";
    args.locationPathname = "/project/completed-1";
    args.projects = { "completed-1": buildProject("completed-1", "Completed") };
    args.orderedProjectIds = ["completed-1"];

    renderHook(() => useDraftReviewProjectRouteGuard(args));

    expect(args.openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(args.navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("opens completed popup and preserves non-project origin", () => {
    const completedProject = buildProject("completed-1", "Completed");
    const args = createBaseArgs();
    args.projects = { "completed-1": completedProject };
    args.orderedProjectIds = ["completed-1"];

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "archive",
          locationPathname: "/archive",
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:completed-1",
      locationPathname: "/project/completed-1",
    });

    expect(args.openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(args.navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("redirects to next active project when a project becomes completed on the same route", () => {
    const primaryProject = buildProject("project-1", "Active");
    const fallbackProject = buildProject("active-2", "Active");
    const args = createBaseArgs();

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "project:project-1",
          locationPathname: "/project/project-1",
          projects: {
            "project-1": primaryProject,
            "active-2": fallbackProject,
          },
          orderedProjectIds: ["project-1", "active-2"],
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:project-1",
      locationPathname: "/project/project-1",
      projects: {
        "project-1": buildProject("project-1", "Completed"),
        "active-2": fallbackProject,
      },
      orderedProjectIds: ["project-1", "active-2"],
    });

    expect(args.openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(args.navigateToPath).toHaveBeenCalledWith("/project/active-2", true);
  });

  test("waits for first page load before redirecting draft/review routes", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();

    const { rerender } = renderHook(
      (props: GuardProps) => useDraftReviewProjectRouteGuard(props),
      {
        initialProps: {
          ...args,
          currentView: "project:draft-1",
          locationPathname: "/project/draft-1",
          projects: { "draft-1": draftProject },
          orderedProjectIds: ["draft-1"],
          projectsPaginationStatus: "LoadingFirstPage",
        },
      },
    );

    expect(args.navigateToPath).not.toHaveBeenCalled();

    rerender({
      ...args,
      currentView: "project:draft-1",
      locationPathname: "/project/draft-1",
      projects: { "draft-1": draftProject },
      orderedProjectIds: ["draft-1"],
      projectsPaginationStatus: "Exhausted",
    });

    expect(args.navigateToPath).toHaveBeenCalledWith(
      "/drafts/draft-1?from=%2Ftasks",
      true,
    );
  });
});
