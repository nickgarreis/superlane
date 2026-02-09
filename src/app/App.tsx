import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ArchivePage } from "./components/ArchivePage";
import { AuthCallbackPage } from "./components/AuthCallbackPage";
import { AuthPage } from "./components/AuthPage";
import { CreateProjectPopup } from "./components/CreateProjectPopup";
import { MainContent } from "./components/MainContent";
import { RootPage } from "./components/RootPage";
import { SearchPopup } from "./components/SearchPopup";
import { SettingsPopup } from "./components/SettingsPopup";
import { Sidebar } from "./components/Sidebar";
import { Tasks } from "./components/Tasks";
import { isProtectedPath, pathToView, viewToPath } from "./lib/routing";
import type { AppView } from "./lib/routing";
import { mapProjectsToUi, mapWorkspacesToUi } from "./lib/mappers";
import { parseProjectStatus } from "./lib/status";
import type { ProjectData, ProjectDraftData, ProjectFileData, ProjectFileTab, Task, Workspace } from "./types";

type PendingHighlight = {
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};

type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";

const SETTINGS_TABS: readonly SettingsTab[] = ["Account", "Notifications", "Company", "Billing"];

const parseSettingsTab = (value: string | null | undefined): SettingsTab => {
  if (value && (SETTINGS_TABS as readonly string[]).includes(value)) {
    return value as SettingsTab;
  }
  return "Account";
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#141515] flex items-center justify-center text-white/60 font-['Roboto',sans-serif]">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
}

function DashboardApp() {
  const { user, signOut } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [highlightedArchiveProjectId, setHighlightedArchiveProjectId] = useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<PendingHighlight | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editDraftData, setEditDraftData] = useState<ProjectDraftData | null>(null);
  const [reviewProject, setReviewProject] = useState<ProjectData | null>(null);
  const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState<string | null>(null);

  const ensureDefaultWorkspace = useMutation(api.workspaces.ensureDefaultWorkspace);
  const createWorkspaceMutation = useMutation(api.workspaces.create);
  const updateWorkspaceMutation = useMutation(api.workspaces.update);
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const archiveProjectMutation = useMutation(api.projects.archive);
  const unarchiveProjectMutation = useMutation(api.projects.unarchive);
  const removeProjectMutation = useMutation(api.projects.remove);
  const setProjectStatusMutation = useMutation(api.projects.setStatus);
  const updateReviewCommentsMutation = useMutation(api.projects.updateReviewComments);
  const replaceProjectTasksMutation = useMutation(api.tasks.replaceForProject);
  const createProjectFileMutation = useMutation(api.files.create);
  const removeProjectFileMutation = useMutation(api.files.remove);

  const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
    Object.fromEntries(
      Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
    ) as T;

  const snapshot = useQuery(
    api.dashboard.getSnapshot,
    isAuthenticated ? { activeWorkspaceSlug: activeWorkspaceSlug ?? undefined } : "skip",
  );
  const resolvedWorkspaceSlug = snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug ?? null;
  const workspaceFiles = useQuery(
    api.files.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );

  const currentView = useMemo<AppView>(() => {
    const directView = pathToView(location.pathname);
    if (directView) {
      return directView;
    }

    if (location.pathname === "/settings") {
      const fromParam = searchParams.get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const derivedView = pathToView(fromParam);
        if (derivedView) {
          return derivedView;
        }
      }
    }

    return "tasks";
  }, [location.pathname, searchParams]);

  const settingsTab = useMemo(() => parseSettingsTab(searchParams.get("tab")), [searchParams]);
  const isSettingsOpen = location.pathname === "/settings";

  const toProtectedFromPath = useCallback((candidate: string | null | undefined): string | null => {
    if (!candidate || !candidate.startsWith("/")) {
      return null;
    }
    if (!isProtectedPath(candidate) || candidate === "/settings") {
      return null;
    }
    return candidate;
  }, []);

  const resolveSettingsFromPath = useCallback((): string => {
    if (isProtectedPath(location.pathname) && location.pathname !== "/settings") {
      return location.pathname;
    }

    const fromParam = toProtectedFromPath(searchParams.get("from"));
    return fromParam ?? "/tasks";
  }, [location.pathname, searchParams, toProtectedFromPath]);

  const navigateView = useCallback((view: AppView) => {
    navigate(viewToPath(view));
  }, [navigate]);

  const handleOpenSettings = useCallback((tab: SettingsTab = "Account") => {
    const params = new URLSearchParams({
      tab,
      from: resolveSettingsFromPath(),
    });
    navigate(`/settings?${params.toString()}`);
  }, [navigate, resolveSettingsFromPath]);

  const handleCloseSettings = useCallback(() => {
    const fromParam = toProtectedFromPath(searchParams.get("from"));
    navigate(fromParam ?? "/tasks");
  }, [navigate, searchParams, toProtectedFromPath]);

  const defaultWorkspaceRequestedRef = useRef(false);

  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (snapshot.activeWorkspaceSlug && snapshot.activeWorkspaceSlug !== activeWorkspaceSlug) {
      setActiveWorkspaceSlug(snapshot.activeWorkspaceSlug);
    }
  }, [snapshot, activeWorkspaceSlug]);

  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (snapshot.workspaces.length > 0 || defaultWorkspaceRequestedRef.current) {
      return;
    }

    defaultWorkspaceRequestedRef.current = true;
    void ensureDefaultWorkspace({})
      .then((result) => {
        setActiveWorkspaceSlug(result.slug);
      })
      .catch((error) => {
        defaultWorkspaceRequestedRef.current = false;
        console.error(error);
        toast.error("Failed to create your default workspace");
      });
  }, [snapshot, ensureDefaultWorkspace]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const viewerName = user?.firstName || user?.email || "Nick";
  const viewerAvatar = user?.profilePictureUrl || imgAvatar;

  const workspaces = useMemo(
    () => mapWorkspacesToUi(snapshot?.workspaces ?? []),
    [snapshot?.workspaces],
  );

  const projects = useMemo(
    () =>
      mapProjectsToUi({
        projects: (snapshot?.projects ?? []) as any,
        tasks: (snapshot?.tasks ?? []) as any,
        workspaceSlug: snapshot?.activeWorkspaceSlug ?? null,
        fallbackCreatorName: viewerName,
        fallbackCreatorAvatar: viewerAvatar,
      }),
    [snapshot?.projects, snapshot?.tasks, snapshot?.activeWorkspaceSlug, viewerName, viewerAvatar],
  );

  const activeWorkspace: Workspace | undefined =
    workspaces.find((workspace) => workspace.id === (snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug ?? "")) ||
    workspaces[0];

  const visibleProjects = useMemo(() => {
    if (!activeWorkspace) {
      return {};
    }

    return Object.entries(projects).reduce<Record<string, ProjectData>>((acc, [key, project]) => {
      if (project.workspaceId === activeWorkspace.id) {
        acc[key] = project;
      }
      return acc;
    }, {});
  }, [projects, activeWorkspace]);

  const allWorkspaceFiles = useMemo<ProjectFileData[]>(
    () =>
      (workspaceFiles ?? []).map((file: any) => ({
        id: String(file.id),
        projectPublicId: file.projectPublicId,
        tab: file.tab as ProjectFileTab,
        name: file.name,
        type: file.type,
        displayDate: file.displayDate,
        thumbnailRef: file.thumbnailRef ?? null,
      })),
    [workspaceFiles],
  );

  const projectFilesByProject = useMemo(
    () =>
      allWorkspaceFiles.reduce<Record<string, ProjectFileData[]>>((acc, file) => {
        if (!acc[file.projectPublicId]) {
          acc[file.projectPublicId] = [];
        }
        acc[file.projectPublicId].push(file);
        return acc;
      }, {}),
    [allWorkspaceFiles],
  );

  const invalidRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const routeView = pathToView(location.pathname);
    if (!routeView) {
      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Project not found");
        }
        navigate("/tasks", { replace: true });
        return;
      }

      if (project.archived) {
        navigate(viewToPath(`archive-project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("archive-project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Archived project not found");
        }
        navigate("/archive", { replace: true });
        return;
      }

      if (!project.archived) {
        navigate(viewToPath(`project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
    }
  }, [snapshot, location.pathname, projects, navigate]);

  const handleSwitchWorkspace = (workspaceSlug: string) => {
    setActiveWorkspaceSlug(workspaceSlug);
    navigateView("tasks");
  };

  const handleCreateWorkspace = () => {
    const name = window.prompt("Enter workspace name:")?.trim();
    if (!name) {
      return;
    }

    void createWorkspaceMutation({ name })
      .then((result) => {
        setActiveWorkspaceSlug(result.slug);
        navigateView("tasks");
        toast.success("Workspace created");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create workspace");
      });
  };

  const handleUpdateWorkspace = (id: string, data: Partial<Workspace>) => {
    void updateWorkspaceMutation(omitUndefined({
      slug: id,
      name: data.name,
      plan: data.plan,
      logo: data.logo,
      logoColor: data.logoColor,
      logoText: data.logoText,
    })).catch((error) => {
      console.error(error);
      toast.error("Failed to update workspace");
    });
  };

  const handleCreateProject = (
    projectData: Partial<ProjectData> & {
      status?: string;
      draftData?: ProjectDraftData | null;
      _editProjectId?: string;
      _generatedId?: string;
    },
  ) => {
    const normalizedStatus = parseProjectStatus(projectData.status);
    const existingId = projectData._editProjectId;

    if (existingId && projects[existingId]) {
      const existing = projects[existingId];
      const mergedAttachments = projectData.attachments && projectData.attachments.length > 0
        ? [...(existing.attachments || []), ...projectData.attachments]
        : existing.attachments;

      void updateProjectMutation(omitUndefined({
        publicId: existingId,
        name: projectData.name ?? existing.name,
        description: projectData.description ?? existing.description,
        category: projectData.category ?? existing.category,
        scope: projectData.scope ?? existing.scope,
        deadline: projectData.deadline ?? existing.deadline,
        status: normalizedStatus,
        draftData: normalizedStatus === "Draft" ? projectData.draftData ?? null : null,
        attachments: mergedAttachments,
      }))
        .then(() => {
          if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
            navigateView(`project:${existingId}`);
          }
          setEditProjectId(null);
          setEditDraftData(null);
          toast.success(normalizedStatus === "Draft" ? "Draft saved" : "Project updated");
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to update project");
        });

      return;
    }

    if (!activeWorkspace?.id) {
      toast.error("Select a workspace before creating a project");
      return;
    }

    const publicId = projectData._generatedId ||
      `${(projectData.name || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    void createProjectMutation(omitUndefined({
      workspaceSlug: activeWorkspace.id,
      publicId,
      name: projectData.name || "Untitled Project",
      description: projectData.description || "",
      category: projectData.category || "General",
      scope: projectData.scope || undefined,
      deadline: projectData.deadline || undefined,
      status: normalizedStatus,
      attachments: projectData.attachments,
      draftData: normalizedStatus === "Draft" ? projectData.draftData ?? null : null,
    }))
      .then(() => {
        if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
          navigateView(`project:${publicId}`);
        }
        toast.success(normalizedStatus === "Draft" ? "Draft saved" : "Project created");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create project");
      });
  };

  const categoryToService = (category: string): string => {
    const map: Record<string, string> = {
      webdesign: "Web Design",
      "web design": "Web Design",
      automation: "AI Automation",
      "ai automation": "AI Automation",
      marketing: "Marketing Campaigns",
      "marketing campaigns": "Marketing Campaigns",
      presentation: "Presentation",
      "ai consulting": "AI Consulting",
      "creative strategy & concept": "Creative Strategy & Concept",
    };
    return map[category.toLowerCase()] || category;
  };

  const handleEditProject = (project: ProjectData) => {
    const draftData: ProjectDraftData = project.draftData || {
      selectedService: categoryToService(project.category),
      projectName: project.name,
      selectedJob: project.scope || "",
      description: project.description,
      isAIEnabled: true,
      deadline: undefined,
      lastStep: 1,
    };

    setEditProjectId(project.id);
    setEditDraftData(draftData);
    setIsCreateProjectOpen(true);
  };

  const handleViewReviewProject = (project: ProjectData) => {
    setReviewProject(project);
    setIsCreateProjectOpen(true);
  };

  const handleUpdateComments = (
    projectId: string,
    comments: Array<{ id: string; author: { name: string; avatar: string }; content: string; timestamp: string }>,
  ) => {
    void updateReviewCommentsMutation({
      publicId: projectId,
      comments,
    }).catch((error) => {
      console.error(error);
      toast.error("Failed to update comments");
    });
  };

  const handleArchiveProject = (id: string) => {
    void archiveProjectMutation({ publicId: id })
      .then(() => {
        setHighlightedArchiveProjectId(id);
        navigateView("archive");
        toast.success("Project archived");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to archive project");
      });
  };

  const handleUnarchiveProject = (id: string) => {
    void unarchiveProjectMutation({ publicId: id })
      .then(() => {
        if (currentView === `archive-project:${id}`) {
          navigateView("archive");
        }
        toast.success("Project unarchived");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to unarchive project");
      });
  };

  const handleDeleteProject = (id: string) => {
    const project = projects[id];
    const isDraft = project?.status?.label === "Draft";

    void removeProjectMutation({ publicId: id })
      .then(() => {
        if (currentView === `project:${id}` || currentView === `archive-project:${id}`) {
          if (currentView.startsWith("archive-project:")) {
            navigateView("archive");
          } else {
            const otherProject = Object.values(visibleProjects).find((p) => p.id !== id && !p.archived);
            if (otherProject) {
              navigateView(`project:${otherProject.id}`);
            } else {
              navigate("/tasks");
            }
          }
        }
        toast.success(isDraft ? "Draft deleted" : "Project deleted");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to delete project");
      });
  };

  const handleUpdateProjectStatus = (id: string, newStatus: string) => {
    const parsedStatus = parseProjectStatus(newStatus);

    void setProjectStatusMutation({
      publicId: id,
      status: parsedStatus,
    })
      .then(() => {
        if (parsedStatus === "Completed") {
          toast.success("Project marked as completed");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update project status");
      });
  };

  const handleUpdateProject = (id: string, data: Partial<ProjectData>) => {
    const tasks = data.tasks;

    if (tasks) {
      const cleanTasks: Task[] = tasks.map((task) => ({
        id: String(task.id),
        title: task.title,
        assignee: {
          name: task.assignee?.name || viewerName,
          avatar: task.assignee?.avatar || viewerAvatar,
        },
        dueDate: task.dueDate,
        completed: task.completed,
      }));

      void replaceProjectTasksMutation({
        projectPublicId: id,
        tasks: cleanTasks,
      }).catch((error) => {
        console.error(error);
        toast.error("Failed to update tasks");
      });
    }

    const patch: {
      publicId: string;
      name?: string;
      description?: string;
      category?: string;
      scope?: string;
      deadline?: string;
      attachments?: ProjectData["attachments"];
      reviewComments?: ProjectData["comments"];
    } = {
      publicId: id,
    };

    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.category !== undefined) patch.category = data.category;
    if (data.scope !== undefined) patch.scope = data.scope;
    if (data.deadline !== undefined) patch.deadline = data.deadline;
    if (data.attachments !== undefined) patch.attachments = data.attachments;
    if (data.comments !== undefined) patch.reviewComments = data.comments;

    if (Object.keys(patch).length > 1) {
      void updateProjectMutation(patch as any).catch((error) => {
        console.error(error);
        toast.error("Failed to update project");
      });
    }
  };

  const buildDisplayDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date}, ${time}`;
  };

  const handleCreateProjectFile = (projectPublicId: string, tab: ProjectFileTab, file: File) => {
    const type = file.name.split(".").pop()?.toUpperCase() || "FILE";
    void createProjectFileMutation({
      projectPublicId,
      tab,
      name: file.name,
      type,
      displayDate: buildDisplayDate(),
    })
      .then(() => {
        toast.success(`Successfully uploaded ${file.name}`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to upload file");
      });
  };

  const handleRemoveProjectFile = (fileId: string) => {
    void removeProjectFileMutation({ fileId: fileId as Id<"projectFiles"> })
      .then((result) => {
        if (result.removed) {
          toast.success("File removed");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to remove file");
      });
  };

  const renderContent = () => {
    if (currentView === "tasks") {
      return (
        <Tasks
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          projects={visibleProjects}
          onUpdateProject={handleUpdateProject}
        />
      );
    }

    if (currentView === "archive") {
      return (
        <ArchivePage
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          projects={visibleProjects}
          onNavigateToProject={(id) => navigateView(`archive-project:${id}`)}
          onUnarchiveProject={handleUnarchiveProject}
          onDeleteProject={handleDeleteProject}
          highlightedProjectId={highlightedArchiveProjectId}
          setHighlightedProjectId={setHighlightedArchiveProjectId}
        />
      );
    }

    if (currentView.startsWith("archive-project:")) {
      const projectId = currentView.split(":")[1];
      const project = projects[projectId];
      if (project && project.archived) {
        return (
          <MainContent
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            project={project}
            projectFiles={projectFilesByProject[project.id] ?? []}
            onCreateFile={handleCreateProjectFile}
            onRemoveFile={handleRemoveProjectFile}
            onArchiveProject={handleArchiveProject}
            onUnarchiveProject={handleUnarchiveProject}
            onDeleteProject={handleDeleteProject}
            allProjects={visibleProjects}
            onNavigate={navigateView}
            onUpdateStatus={handleUpdateProjectStatus}
            onUpdateProject={(data) => handleUpdateProject(project.id, data)}
            backTo="archive"
            onBack={() => navigateView("archive")}
            pendingHighlight={pendingHighlight}
            onClearPendingHighlight={() => setPendingHighlight(null)}
          />
        );
      }
    }

    if (currentView.startsWith("project:")) {
      const projectId = currentView.split(":")[1];
      const project = projects[projectId];
      if (project && !project.archived) {
        return (
          <MainContent
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            project={project}
            projectFiles={projectFilesByProject[project.id] ?? []}
            onCreateFile={handleCreateProjectFile}
            onRemoveFile={handleRemoveProjectFile}
            onArchiveProject={handleArchiveProject}
            onUnarchiveProject={handleUnarchiveProject}
            onDeleteProject={handleDeleteProject}
            allProjects={visibleProjects}
            onNavigate={navigateView}
            onUpdateStatus={handleUpdateProjectStatus}
            onUpdateProject={(data) => handleUpdateProject(project.id, data)}
            pendingHighlight={pendingHighlight}
            onClearPendingHighlight={() => setPendingHighlight(null)}
          />
        );
      }
    }

    const firstProject = Object.values(visibleProjects).find(
      (project) => !project.archived && project.status.label !== "Draft" && project.status.label !== "Review",
    );

    if (firstProject) {
      return (
        <MainContent
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          project={firstProject}
          projectFiles={projectFilesByProject[firstProject.id] ?? []}
          onCreateFile={handleCreateProjectFile}
          onRemoveFile={handleRemoveProjectFile}
          onArchiveProject={handleArchiveProject}
          onUnarchiveProject={handleUnarchiveProject}
          onDeleteProject={handleDeleteProject}
          allProjects={visibleProjects}
          onNavigate={navigateView}
          onUpdateStatus={handleUpdateProjectStatus}
          onUpdateProject={(data) => handleUpdateProject(firstProject.id, data)}
          pendingHighlight={pendingHighlight}
          onClearPendingHighlight={() => setPendingHighlight(null)}
        />
      );
    }

    return (
      <div className="flex-1 h-full bg-[#141515] flex flex-col items-center justify-center text-white/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <img src={imgLogo} className="w-8 h-8 opacity-40 grayscale" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No projects in this workspace</p>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
            >
              Create new project
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!snapshot) {
    return (
      <div className="min-h-screen w-full bg-[#141515] flex items-center justify-center text-white/60 font-['Roboto',sans-serif]">
        Loading workspace...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-[#141515] overflow-hidden font-['Roboto',sans-serif] antialiased text-[#E8E8E8]">
        <SearchPopup
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          projects={projects}
          files={allWorkspaceFiles}
          onNavigate={navigateView}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenSettings={(tab) => handleOpenSettings(parseSettingsTab(tab))}
          onHighlightNavigate={(_projectId, highlight) => {
            setPendingHighlight(highlight);
          }}
        />

        <CreateProjectPopup
          isOpen={isCreateProjectOpen}
          onClose={() => {
            setIsCreateProjectOpen(false);
            setEditProjectId(null);
            setEditDraftData(null);
            setReviewProject(null);
          }}
          onCreate={handleCreateProject}
          user={{ name: viewerName, avatar: viewerAvatar }}
          editProjectId={editProjectId}
          initialDraftData={editDraftData}
          onDeleteDraft={handleDeleteProject}
          reviewProject={reviewProject}
          onUpdateComments={handleUpdateComments}
        />

        <SettingsPopup
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          initialTab={settingsTab}
          activeWorkspace={activeWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
        />

        <Toaster
          position="bottom-right"
          theme="dark"
          gap={8}
          duration={3000}
          offset={20}
          toastOptions={{
            style: {
              background: "#1A1A1C",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              color: "#E8E8E8",
              fontFamily: "'Roboto', sans-serif",
              fontSize: "13px",
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
              gap: "12px",
            },
            classNames: {
              toast: "custom-toast",
              title: "custom-toast-title",
              icon: "custom-toast-icon",
              success: "custom-toast-success",
              error: "custom-toast-error",
              info: "custom-toast-info",
            },
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full shrink-0 overflow-hidden"
            >
              <div className="w-[260px] h-full">
                <Sidebar
                  onNavigate={navigateView}
                  onSearch={() => setIsSearchOpen(true)}
                  currentView={currentView}
                  onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                  projects={visibleProjects}
                  activeWorkspace={activeWorkspace}
                  workspaces={workspaces}
                  onSwitchWorkspace={handleSwitchWorkspace}
                  onCreateWorkspace={handleCreateWorkspace}
                  onOpenSettings={handleOpenSettings}
                  onArchiveProject={handleArchiveProject}
                  onUnarchiveProject={handleUnarchiveProject}
                  onUpdateProjectStatus={handleUpdateProjectStatus}
                  onEditProject={handleEditProject}
                  onViewReviewProject={handleViewReviewProject}
                  onLogout={() => {
                    void signOut();
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {renderContent()}
      </div>
    </DndProvider>
  );
}

export default function App() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <Routes>
      <Route path="/" element={<RootPage isAuthenticated={isAuthenticated} />} />
      <Route path="/login" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/dashboard" element={<Navigate to="/tasks" replace />} />
      <Route path="/inbox" element={<Navigate to="/tasks" replace />} />

      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <DashboardApp />
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}
