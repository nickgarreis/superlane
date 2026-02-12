/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDraftReviewProjectRouteGuard } from "./useDraftReviewProjectRouteGuard";
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

describe("useDraftReviewProjectRouteGuard", () => {
  test("uses tasks fallback for direct deep-link draft routes", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    renderHook(() =>
      useDraftReviewProjectRouteGuard({
        currentView: "project:draft-1",
        locationPathname: "/project/draft-1",
        projects: { "draft-1": draftProject },
        orderedProjectIds: ["draft-1"],
        projectsPaginationStatus: "Exhausted",
        editProject,
        viewReviewProject,
        openCompletedProjectsPopup,
        navigateToPath,
      }),
    );

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("redirects back to archive when draft route comes from archive", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "archive" | "project:draft-1";
        path: string;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: { "draft-1": draftProject },
          orderedProjectIds: ["draft-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: { currentView: "archive" as const, path: "/archive" },
      },
    );

    rerender({ currentView: "project:draft-1", path: "/project/draft-1" });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("redirects back to active project when draft route comes from project detail", () => {
    const activeProject = buildProject("active-1", "Active");
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "project:active-1" | "project:draft-1";
        path: string;
        projects: Record<string, ProjectData>;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: props.projects,
          orderedProjectIds: ["active-1", "draft-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          currentView: "project:active-1" as const,
          path: "/project/active-1",
          projects: { "active-1": activeProject, "draft-1": draftProject },
        },
      },
    );

    rerender({
      currentView: "project:draft-1",
      path: "/project/draft-1",
      projects: {},
    });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/project/active-1", true);
  });

  test("uses cached project data when draft project temporarily drops from current map", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "archive" | "project:draft-1";
        path: string;
        projects: Record<string, ProjectData>;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: props.projects,
          orderedProjectIds: ["draft-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          currentView: "archive" as const,
          path: "/archive",
          projects: { "draft-1": draftProject },
        },
      },
    );

    rerender({
      currentView: "project:draft-1",
      path: "/project/draft-1",
      projects: {},
    });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("uses cached review project data when project temporarily drops from current map", () => {
    const reviewProject = buildProject("review-1", "Review");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "archive" | "project:review-1";
        path: string;
        projects: Record<string, ProjectData>;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: props.projects,
          orderedProjectIds: ["review-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          currentView: "archive" as const,
          path: "/archive",
          projects: { "review-1": reviewProject },
        },
      },
    );

    rerender({
      currentView: "project:review-1",
      path: "/project/review-1",
      projects: {},
    });

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).toHaveBeenCalledWith(reviewProject);
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("redirects back to active project when review route comes from project detail", () => {
    const activeProject = buildProject("active-1", "Active");
    const reviewProject = buildProject("review-1", "Review");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "project:active-1" | "project:review-1";
        path: string;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: { "active-1": activeProject, "review-1": reviewProject },
          orderedProjectIds: ["active-1", "review-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          currentView: "project:active-1" as const,
          path: "/project/active-1",
        },
      },
    );

    rerender({
      currentView: "project:review-1",
      path: "/project/review-1",
    });

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).toHaveBeenCalledWith(reviewProject);
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/project/active-1", true);
  });

  test("opens review popup and redirects to tasks for review routes", () => {
    const reviewProject = buildProject("review-1", "Review");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    renderHook(() =>
      useDraftReviewProjectRouteGuard({
        currentView: "project:review-1",
        locationPathname: "/project/review-1",
        projects: { "review-1": reviewProject },
        orderedProjectIds: ["review-1"],
        projectsPaginationStatus: "Exhausted",
        editProject,
        viewReviewProject,
        openCompletedProjectsPopup,
        navigateToPath,
      }),
    );

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).toHaveBeenCalledWith(reviewProject);
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("opens completed popup and redirects to tasks for direct deep-link completed routes", () => {
    const completedProject = buildProject("completed-1", "Completed");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    renderHook(() =>
      useDraftReviewProjectRouteGuard({
        currentView: "project:completed-1",
        locationPathname: "/project/completed-1",
        projects: { "completed-1": completedProject },
        orderedProjectIds: ["completed-1"],
        projectsPaginationStatus: "Exhausted",
        editProject,
        viewReviewProject,
        openCompletedProjectsPopup,
        navigateToPath,
      }),
    );

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("redirects back to archive when completed route comes from archive", () => {
    const completedProject = buildProject("completed-1", "Completed");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "archive" | "project:completed-1";
        path: string;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: { "completed-1": completedProject },
          orderedProjectIds: ["completed-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: { currentView: "archive" as const, path: "/archive" },
      },
    );

    rerender({
      currentView: "project:completed-1",
      path: "/project/completed-1",
    });

    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("redirects back to active project when completed route comes from project detail", () => {
    const activeProject = buildProject("active-1", "Active");
    const completedProject = buildProject("completed-1", "Completed");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        currentView: "project:active-1" | "project:completed-1";
        path: string;
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: props.currentView,
          locationPathname: props.path,
          projects: { "active-1": activeProject, "completed-1": completedProject },
          orderedProjectIds: ["active-1", "completed-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          currentView: "project:active-1" as const,
          path: "/project/active-1",
        },
      },
    );

    rerender({
      currentView: "project:completed-1",
      path: "/project/completed-1",
    });

    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledWith("/project/active-1", true);
  });

  test("redirects to next active project when current route status flips to completed", () => {
    const activeProject = buildProject("active-1", "Active");
    const nextActiveProject = buildProject("active-2", "Active");
    const completedProject = buildProject("active-1", "Completed");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: { projects: Record<string, ProjectData> }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:active-1",
          locationPathname: "/project/active-1",
          projects: props.projects,
          orderedProjectIds: ["active-1", "active-2"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          projects: { "active-1": activeProject, "active-2": nextActiveProject },
        },
      },
    );

    rerender({
      projects: { "active-1": completedProject, "active-2": nextActiveProject },
    });

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledWith("/project/active-2", true);
  });

  test("falls back to tasks when completed status flip has no eligible next active project", () => {
    const activeProject = buildProject("active-1", "Active");
    const completedProject = buildProject("active-1", "Completed");
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: { projects: Record<string, ProjectData> }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:active-1",
          locationPathname: "/project/active-1",
          projects: props.projects,
          orderedProjectIds: ["active-1", "draft-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      {
        initialProps: {
          projects: { "active-1": activeProject, "draft-1": draftProject },
        },
      },
    );

    rerender({
      projects: { "active-1": completedProject, "draft-1": draftProject },
    });

    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("waits for project pagination before redirecting", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        status: "LoadingFirstPage" | "Exhausted";
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:draft-1",
          locationPathname: "/project/draft-1",
          projects: { "draft-1": draftProject },
          orderedProjectIds: ["draft-1"],
          projectsPaginationStatus: props.status,
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      { initialProps: { status: "LoadingFirstPage" as const } },
    );

    expect(editProject).not.toHaveBeenCalled();
    expect(openCompletedProjectsPopup).not.toHaveBeenCalled();
    expect(navigateToPath).not.toHaveBeenCalled();

    rerender({ status: "Exhausted" });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("guards duplicate execution for the same completed route path", () => {
    const completedProject = buildProject("completed-1", "Completed");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const openCompletedProjectsPopup = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: { path: string }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:completed-1",
          locationPathname: props.path,
          projects: { "completed-1": completedProject },
          orderedProjectIds: ["completed-1"],
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          openCompletedProjectsPopup,
          navigateToPath,
        }),
      { initialProps: { path: "/project/completed-1" } },
    );

    rerender({ path: "/project/completed-1" });

    expect(openCompletedProjectsPopup).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledTimes(1);
  });
});
