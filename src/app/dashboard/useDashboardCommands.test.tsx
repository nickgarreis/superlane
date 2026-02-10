/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { ProjectData } from "../types";
import { useDashboardCommands } from "./useDashboardCommands";

const PROJECT: ProjectData = {
  id: "project-1",
  name: "Project One",
  description: "desc",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "Brand",
};

describe("useDashboardCommands", () => {
  test("returns a command object wired to provided handlers", async () => {
    const handlers = {
      handleCreateProject: vi.fn(async () => ({ publicId: "project-1", mode: "create" as const })),
      handleEditProject: vi.fn(),
      handleViewReviewProject: vi.fn(),
      handleArchiveProject: vi.fn(),
      handleUnarchiveProject: vi.fn(),
      handleDeleteProject: vi.fn(),
      handleUpdateProjectStatus: vi.fn(),
      handleCreateProjectFile: vi.fn(),
      handleRemoveProjectFile: vi.fn(),
      handleDownloadProjectFile: vi.fn(),
      handleUploadDraftAttachment: vi.fn(async () => ({
        pendingUploadId: "pending-1",
        name: "brief.pdf",
        type: "PDF",
        mimeType: "application/pdf",
        sizeBytes: 10,
      })),
      handleRemoveDraftAttachment: vi.fn(async () => {}),
      handleDiscardDraftSessionUploads: vi.fn(async () => {}),
      handleOpenSettings: vi.fn(),
      handleCloseSettings: vi.fn(),
      handleSaveAccountSettings: vi.fn(async () => {}),
      handleUploadAccountAvatar: vi.fn(async () => {}),
      handleRemoveAccountAvatar: vi.fn(async () => {}),
      handleSaveSettingsNotifications: vi.fn(async () => {}),
      handleSwitchWorkspace: vi.fn(),
      handleCreateWorkspace: vi.fn(),
    };

    const { result } = renderHook(() => useDashboardCommands(handlers));

    const createResult = await result.current.project.createOrUpdateProject({ name: "New" });
    result.current.project.editProject(PROJECT);
    result.current.project.archiveProject("project-1");
    result.current.project.updateProjectStatus("project-1", "Completed");
    result.current.file.createProjectFile("project-1", "Assets", {} as File);
    await result.current.file.uploadDraftAttachment({} as File, "draft-1");
    result.current.settings.openSettings("Company");
    result.current.workspace.switchWorkspace("workspace-2");
    result.current.workspace.createWorkspace();

    expect(createResult).toEqual({ publicId: "project-1", mode: "create" });
    expect(handlers.handleEditProject).toHaveBeenCalledWith(PROJECT);
    expect(handlers.handleArchiveProject).toHaveBeenCalledWith("project-1");
    expect(handlers.handleUpdateProjectStatus).toHaveBeenCalledWith("project-1", "Completed");
    expect(handlers.handleCreateProjectFile).toHaveBeenCalledWith("project-1", "Assets", expect.anything());
    expect(handlers.handleUploadDraftAttachment).toHaveBeenCalledWith(expect.anything(), "draft-1");
    expect(handlers.handleOpenSettings).toHaveBeenCalledWith("Company");
    expect(handlers.handleSwitchWorkspace).toHaveBeenCalledWith("workspace-2");
    expect(handlers.handleCreateWorkspace).toHaveBeenCalledTimes(1);
  });
});
