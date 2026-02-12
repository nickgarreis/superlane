/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDraftReviewProjectRouteGuard } from "./useDraftReviewProjectRouteGuard";
import type { ProjectData } from "../../types";

const buildProject = (
  id: string,
  statusLabel: "Draft" | "Review" | "Active",
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
  test("opens draft popup and redirects to tasks for draft routes", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const navigateToPath = vi.fn();

    renderHook(() =>
      useDraftReviewProjectRouteGuard({
        currentView: "project:draft-1",
        locationPathname: "/project/draft-1",
        projects: { "draft-1": draftProject },
        projectsPaginationStatus: "Exhausted",
        editProject,
        viewReviewProject,
        navigateToPath,
      }),
    );

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(viewReviewProject).not.toHaveBeenCalled();
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("redirects back to archive when draft route comes from archive", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
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
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          navigateToPath,
        }),
      {
        initialProps: { currentView: "archive" as const, path: "/archive" },
      },
    );

    rerender({ currentView: "project:draft-1", path: "/project/draft-1" });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("uses cached project data when project temporarily drops from current map", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
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
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
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
    expect(navigateToPath).toHaveBeenCalledWith("/archive", true);
  });

  test("opens review popup and redirects to tasks for review routes", () => {
    const reviewProject = buildProject("review-1", "Review");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const navigateToPath = vi.fn();

    renderHook(() =>
      useDraftReviewProjectRouteGuard({
        currentView: "project:review-1",
        locationPathname: "/project/review-1",
        projects: { "review-1": reviewProject },
        projectsPaginationStatus: "Exhausted",
        editProject,
        viewReviewProject,
        navigateToPath,
      }),
    );

    expect(editProject).not.toHaveBeenCalled();
    expect(viewReviewProject).toHaveBeenCalledWith(reviewProject);
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("waits for project pagination before redirecting", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: {
        status: "LoadingFirstPage" | "Exhausted";
      }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:draft-1",
          locationPathname: "/project/draft-1",
          projects: { "draft-1": draftProject },
          projectsPaginationStatus: props.status,
          editProject,
          viewReviewProject,
          navigateToPath,
        }),
      { initialProps: { status: "LoadingFirstPage" as const } },
    );

    expect(editProject).not.toHaveBeenCalled();
    expect(navigateToPath).not.toHaveBeenCalled();

    rerender({ status: "Exhausted" });

    expect(editProject).toHaveBeenCalledWith(draftProject);
    expect(navigateToPath).toHaveBeenCalledWith("/tasks", true);
  });

  test("guards duplicate execution for the same path", () => {
    const draftProject = buildProject("draft-1", "Draft");
    const editProject = vi.fn();
    const viewReviewProject = vi.fn();
    const navigateToPath = vi.fn();

    const { rerender } = renderHook(
      (props: { path: string }) =>
        useDraftReviewProjectRouteGuard({
          currentView: "project:draft-1",
          locationPathname: props.path,
          projects: { "draft-1": draftProject },
          projectsPaginationStatus: "Exhausted",
          editProject,
          viewReviewProject,
          navigateToPath,
        }),
      { initialProps: { path: "/project/draft-1" } },
    );

    rerender({ path: "/project/draft-1" });

    expect(editProject).toHaveBeenCalledTimes(1);
    expect(navigateToPath).toHaveBeenCalledTimes(1);
  });
});
