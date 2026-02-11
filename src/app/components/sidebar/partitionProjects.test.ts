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
  test("separates active and completed projects while excluding archived items", () => {
    const projects = {
      active: createProject({
        id: "active",
        name: "Active",
        status: { label: "Active", color: "", bgColor: "", dotColor: "" },
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

    const result = partitionSidebarProjects(projects, "tasks");

    expect(result.activeProjects.map((project) => project.id)).toEqual([
      "active",
    ]);
    expect(result.completedProjects.map((project) => project.id)).toEqual([
      "completed",
    ]);
  });

  test("returns currently viewed completed project when the route matches", () => {
    const projects = {
      completed: createProject({
        id: "completed",
        status: { label: "Completed", color: "", bgColor: "", dotColor: "" },
      }),
    };

    const result = partitionSidebarProjects(projects, "project:completed");

    expect(result.activeCompletedProject?.id).toBe("completed");
  });
});
