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
  projectsPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  openDraftPendingProjectDetail: ReturnType<typeof vi.fn>;
  openCompletedProjectDetail: ReturnType<typeof vi.fn>;
};

const createBaseArgs = (): GuardProps => ({
  currentView: "tasks",
  locationPathname: "/tasks",
  projects: {},
  projectsPaginationStatus: "Exhausted",
  openDraftPendingProjectDetail: vi.fn(),
  openCompletedProjectDetail: vi.fn(),
});

describe("useDraftReviewProjectRouteGuard", () => {
  test("redirects direct draft project deep links with tasks origin", () => {
    const args = createBaseArgs();
    args.currentView = "project:draft-1";
    args.locationPathname = "/project/draft-1";
    args.projects = { "draft-1": buildProject("draft-1", "Draft") };

    renderHook(() => useDraftReviewProjectRouteGuard(args));

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("draft-1", "Draft", {
      replace: true,
      from: "/tasks",
    });
    expect(args.openCompletedProjectDetail).not.toHaveBeenCalled();
  });

  test("preserves archive origin when redirecting draft project routes", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "draft-1": draftProject };

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

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("draft-1", "Draft", {
      replace: true,
      from: "/archive",
    });
  });

  test("uses project detail origin when redirecting draft routes", () => {
    const activeProject = buildProject("active-1", "Active");
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "active-1": activeProject, "draft-1": draftProject };

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

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("draft-1", "Draft", {
      replace: true,
      from: "/project/active-1",
    });
  });

  test("redirects review routes with preserved origin", () => {
    const activeProject = buildProject("active-1", "Active");
    const reviewProject = buildProject("review-1", "Review");
    const args = createBaseArgs();
    args.projects = {
      "active-1": activeProject,
      "review-1": reviewProject,
    };

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

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("review-1", "Review", {
      replace: true,
      from: "/project/active-1",
    });
  });

  test("uses cached project data when draft/review project temporarily drops from current map", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const args = createBaseArgs();
    args.projects = { "draft-1": draftProject };

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

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("draft-1", "Draft", {
      replace: true,
      from: "/archive",
    });
  });

  test("uses tasks origin when a project becomes draft on the same route", () => {
    const primaryProject = buildProject("project-1", "Active");
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
          },
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:project-1",
      locationPathname: "/project/project-1",
      projects: {
        "project-1": buildProject("project-1", "Draft"),
      },
    });

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("project-1", "Draft", {
      replace: true,
      from: "/tasks",
    });
  });

  test("uses tasks origin when a project becomes review on the same route", () => {
    const primaryProject = buildProject("project-1", "Active");
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
          },
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:project-1",
      locationPathname: "/project/project-1",
      projects: {
        "project-1": buildProject("project-1", "Review"),
      },
    });

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("project-1", "Review", {
      replace: true,
      from: "/tasks",
    });
  });

  test("redirects direct deep-link completed routes into completed detail with tasks origin", () => {
    const args = createBaseArgs();
    args.currentView = "project:completed-1";
    args.locationPathname = "/project/completed-1";
    args.projects = { "completed-1": buildProject("completed-1", "Completed") };

    renderHook(() => useDraftReviewProjectRouteGuard(args));

    expect(args.openCompletedProjectDetail).toHaveBeenCalledWith(
      "completed-1",
      {
        replace: true,
        from: "/tasks",
      },
    );
  });

  test("preserves non-project origin when redirecting to completed detail", () => {
    const completedProject = buildProject("completed-1", "Completed");
    const args = createBaseArgs();
    args.projects = { "completed-1": completedProject };

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

    expect(args.openCompletedProjectDetail).toHaveBeenCalledWith(
      "completed-1",
      {
        replace: true,
        from: "/archive",
      },
    );
  });

  test("uses tasks origin when a project becomes completed on the same route", () => {
    const primaryProject = buildProject("project-1", "Active");
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
          },
        },
      },
    );

    rerender({
      ...args,
      currentView: "project:project-1",
      locationPathname: "/project/project-1",
      projects: {
        "project-1": buildProject("project-1", "Completed"),
      },
    });

    expect(args.openCompletedProjectDetail).toHaveBeenCalledWith("project-1", {
      replace: true,
      from: "/tasks",
    });
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
          projectsPaginationStatus: "LoadingFirstPage",
        },
      },
    );

    expect(args.openDraftPendingProjectDetail).not.toHaveBeenCalled();

    rerender({
      ...args,
      currentView: "project:draft-1",
      locationPathname: "/project/draft-1",
      projects: { "draft-1": draftProject },
      projectsPaginationStatus: "Exhausted",
    });

    expect(args.openDraftPendingProjectDetail).toHaveBeenCalledWith("draft-1", "Draft", {
      replace: true,
      from: "/tasks",
    });
  });
});
