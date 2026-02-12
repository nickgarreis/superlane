import { describe, expect, test } from "vitest";
import { partitionSidebarProjects } from "./partitionProjects";
import type { ProjectData } from "../../types";

const createProject = (overrides: Partial<ProjectData>): ProjectData => ({
  id: overrides.id ?? "project-id",
  name: overrides.name ?? "Project",
  description: overrides.description ?? "",
  creator: overrides.creator ?? {
    userId: "user-1",
    name: "User",
    avatar: "",
  },
  status: overrides.status ?? {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: overrides.category ?? "Web Design",
  archived: overrides.archived ?? false,
  ...overrides,
});

describe("partitionSidebarProjects", () => {
  test("separates active, draft/pending, and completed projects while excluding archived items", () => {
    const projects = {
      active: createProject({
        id: "active",
        name: "Active",
        status: { label: "Active", color: "", bgColor: "", dotColor: "" },
      }),
      draft: createProject({
        id: "draft",
        name: "Draft",
        status: { label: "Draft", color: "", bgColor: "", dotColor: "" },
      }),
      review: createProject({
        id: "review",
        name: "Review",
        status: { label: "Review", color: "", bgColor: "", dotColor: "" },
      }),
      completed: createProject({
        id: "completed",
        name: "Completed",
        status: { label: "Completed", color: "", bgColor: "", dotColor: "" },
      }),
      archivedCompleted: createProject({
        id: "archived-completed",
        archived: true,
        status: { label: "Completed", color: "", bgColor: "", dotColor: "" },
      }),
    };

    const result = partitionSidebarProjects(projects);

    expect(result.activeProjects.map((project) => project.id)).toEqual([
      "active",
    ]);
    expect(result.draftPendingProjects.map((project) => project.id)).toEqual([
      "draft",
      "review",
    ]);
    expect(result.completedProjects.map((project) => project.id)).toEqual([
      "completed",
    ]);
  });
});
