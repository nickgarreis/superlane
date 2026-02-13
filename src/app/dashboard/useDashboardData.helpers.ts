import {
  mapProjectsToUi,
  mapWorkspaceFilesToUi,
  type SnapshotProject,
  type SnapshotWorkspaceFile,
} from "../lib/mappers";
import type { ProjectFileData } from "../types";

export const PROJECTS_PAGE_SIZE = 50;
export const TASKS_PAGE_SIZE = 50;
export const ACTIVITIES_PAGE_SIZE = 50;
export const WORKSPACE_FILES_PAGE_SIZE = 40;
export const PROJECT_FILES_PAGE_SIZE = 40;
export const SETTINGS_PAGE_SIZE = 100;

export const getRouteProjectPublicId = (currentView: string): string | null => {
  if (currentView.startsWith("project:")) {
    return currentView.slice("project:".length);
  }
  if (currentView.startsWith("archive-project:")) {
    return currentView.slice("archive-project:".length);
  }
  return null;
};

export const mapProjectsForWorkspace = (
  projects: SnapshotProject[],
  workspaceSlug: string | null | undefined,
) =>
  mapProjectsToUi({
    projects,
    workspaceSlug: workspaceSlug ?? null,
  });

type BuildProjectFilesByProjectArgs = {
  cachedProjectFiles: Record<string, SnapshotWorkspaceFile[]>;
  activeProjectPublicId: string | null;
  activeProjectFilesSource: SnapshotWorkspaceFile[];
};

export const buildProjectFilesByProject = ({
  cachedProjectFiles,
  activeProjectPublicId,
  activeProjectFilesSource,
}: BuildProjectFilesByProjectArgs): Record<string, ProjectFileData[]> => {
  const mapProjectFilesForProject = (
    projectId: string,
    files: SnapshotWorkspaceFile[],
  ): ProjectFileData[] =>
    mapWorkspaceFilesToUi(files).filter(
      (file) => file.projectPublicId === projectId,
    );

  const grouped: Record<string, ProjectFileData[]> = {};
  for (const [projectId, files] of Object.entries(cachedProjectFiles)) {
    grouped[projectId] = mapProjectFilesForProject(projectId, files);
  }
  if (activeProjectPublicId) {
    grouped[activeProjectPublicId] = mapProjectFilesForProject(
      activeProjectPublicId,
      activeProjectFilesSource,
    );
  }
  return grouped;
};
