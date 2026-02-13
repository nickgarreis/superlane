import {
  isProtectedPath,
  pathToView,
  viewToPath,
  type AppView,
} from "../lib/routing";
import { readPersistedDashboardWorkspaceSlug } from "./storage";

export type DraftPendingRouteKind = "draft" | "pending";
export type DraftPendingStatus = "Draft" | "Review";

export const WORKSPACE_SLUG_QUERY_KEY = "workspace";
export const COMPLETED_PATH = viewToPath("completed");
export const DRAFTS_PATH = viewToPath("drafts");
export const PENDING_PATH = viewToPath("pending");
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export const isCompletedPath = (pathname: string): boolean =>
  pathname === COMPLETED_PATH || pathname.startsWith(`${COMPLETED_PATH}/`);

export const isDraftPendingPath = (pathname: string): boolean =>
  pathname === DRAFTS_PATH ||
  pathname === PENDING_PATH ||
  pathname.startsWith(`${DRAFTS_PATH}/`) ||
  pathname.startsWith(`${PENDING_PATH}/`);

const isValidWorkspaceSlug = (value: string): boolean =>
  /^[a-z0-9-]+$/.test(value);

export const isMobileViewport = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_MEDIA_QUERY).matches;

export const readPersistedWorkspaceSlug = (
  searchParams: URLSearchParams,
): string | null => {
  const fromQuery = searchParams.get(WORKSPACE_SLUG_QUERY_KEY)?.trim();
  if (fromQuery && isValidWorkspaceSlug(fromQuery)) {
    return fromQuery;
  }
  const fromStorage = readPersistedDashboardWorkspaceSlug()?.trim();
  if (fromStorage && isValidWorkspaceSlug(fromStorage)) {
    return fromStorage;
  }
  return null;
};

type DeriveCurrentViewArgs = {
  routeView: AppView | null;
  pathname: string;
  searchParams: URLSearchParams;
};

export const deriveCurrentView = ({
  routeView,
  pathname,
  searchParams,
}: DeriveCurrentViewArgs): AppView => {
  if (routeView) {
    if (
      routeView === "completed" ||
      routeView.startsWith("completed-project:")
    ) {
      const completedProjectId = routeView.startsWith("completed-project:")
        ? routeView.slice("completed-project:".length)
        : null;
      const fromParam = searchParams.get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
        const fromView = pathToView(fromPathname);
        const fromIsSameCompletedProject =
          completedProjectId != null &&
          fromView === `project:${completedProjectId}`;
        if (
          fromView &&
          fromView !== "completed" &&
          !fromView.startsWith("completed-project:") &&
          !fromIsSameCompletedProject
        ) {
          return fromView;
        }
      }
      return "tasks";
    }
    if (
      routeView === "drafts" ||
      routeView === "pending" ||
      routeView.startsWith("draft-project:") ||
      routeView.startsWith("pending-project:")
    ) {
      const draftPendingProjectId = routeView.startsWith("draft-project:")
        ? routeView.slice("draft-project:".length)
        : routeView.startsWith("pending-project:")
          ? routeView.slice("pending-project:".length)
          : null;
      const fromParam = searchParams.get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
        const fromView = pathToView(fromPathname);
        const fromIsSameDraftPendingProject =
          draftPendingProjectId != null &&
          fromView === `project:${draftPendingProjectId}`;
        if (
          fromView &&
          fromView !== "completed" &&
          fromView !== "drafts" &&
          fromView !== "pending" &&
          !fromView.startsWith("completed-project:") &&
          !fromView.startsWith("draft-project:") &&
          !fromView.startsWith("pending-project:") &&
          !fromIsSameDraftPendingProject
        ) {
          return fromView;
        }
      }
      return "tasks";
    }
    return routeView;
  }

  if (pathname === "/settings") {
    const fromParam = searchParams.get("from");
    if (fromParam && fromParam.startsWith("/")) {
      const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
      const derivedView = pathToView(fromPathname);
      if (derivedView) {
        return derivedView;
      }
    }
  }

  return "tasks";
};

type ProtectedPathOptions = {
  allowCompleted?: boolean;
  allowDraftPending?: boolean;
};

export const toProtectedFromPathCandidate = (
  candidate: string | null | undefined,
  options?: ProtectedPathOptions,
): string | null => {
  if (!candidate || !candidate.startsWith("/")) {
    return null;
  }
  const pathOnly = candidate.split(/[?#]/, 1)[0] ?? candidate;
  if (!isProtectedPath(pathOnly) || pathOnly === "/settings") {
    return null;
  }
  if (options?.allowCompleted === false && isCompletedPath(pathOnly)) {
    return null;
  }
  if (options?.allowDraftPending === false && isDraftPendingPath(pathOnly)) {
    return null;
  }
  return candidate;
};

type ResolveDraftPendingFromPathArgs = {
  searchParams: URLSearchParams;
  locationPathname: string;
  currentLocationPath: string;
  options?: {
    from?: string | null;
    fallback?: string;
    draftPendingProjectId?: string | null;
  };
};

export const resolveDraftPendingFromPathValue = ({
  searchParams,
  locationPathname,
  currentLocationPath,
  options,
}: ResolveDraftPendingFromPathArgs): string => {
  const toValidDraftPendingFromPath = (
    candidate: string | null | undefined,
  ): string | null => {
    const protectedPath = toProtectedFromPathCandidate(candidate, {
      allowCompleted: false,
      allowDraftPending: false,
    });
    if (!protectedPath) {
      return null;
    }
    const pathOnly = protectedPath.split(/[?#]/, 1)[0] ?? protectedPath;
    const fromView = pathToView(pathOnly);
    if (
      !fromView ||
      fromView === "completed" ||
      fromView === "drafts" ||
      fromView === "pending" ||
      fromView.startsWith("completed-project:") ||
      fromView.startsWith("draft-project:") ||
      fromView.startsWith("pending-project:")
    ) {
      return null;
    }
    if (
      options?.draftPendingProjectId &&
      fromView === `project:${options.draftPendingProjectId}`
    ) {
      return null;
    }
    return protectedPath;
  };

  const explicitFromCandidate = options?.from;
  const explicitFrom = toValidDraftPendingFromPath(explicitFromCandidate);
  if (explicitFrom) {
    return explicitFrom;
  }
  if (explicitFromCandidate != null) {
    const fallbackFromExplicit = toValidDraftPendingFromPath(options?.fallback);
    return fallbackFromExplicit ?? "/tasks";
  }

  const fromParam = toValidDraftPendingFromPath(searchParams.get("from"));
  if (fromParam) {
    return fromParam;
  }

  if (
    isProtectedPath(locationPathname) &&
    locationPathname !== "/settings" &&
    !isDraftPendingPath(locationPathname) &&
    !isCompletedPath(locationPathname)
  ) {
    const currentFromPath = toValidDraftPendingFromPath(currentLocationPath);
    if (currentFromPath) {
      return currentFromPath;
    }
  }

  const fallback = toValidDraftPendingFromPath(options?.fallback);
  return fallback ?? "/tasks";
};

type ResolveCompletedFromPathArgs = {
  searchParams: URLSearchParams;
  locationPathname: string;
  currentLocationPath: string;
  options?: {
    from?: string | null;
    fallback?: string;
    completedProjectId?: string | null;
  };
};

export const resolveCompletedFromPathValue = ({
  searchParams,
  locationPathname,
  currentLocationPath,
  options,
}: ResolveCompletedFromPathArgs): string => {
  const toValidCompletedFromPath = (
    candidate: string | null | undefined,
  ): string | null => {
    const protectedPath = toProtectedFromPathCandidate(candidate, {
      allowCompleted: false,
    });
    if (!protectedPath) {
      return null;
    }
    if (!options?.completedProjectId) {
      return protectedPath;
    }
    const pathOnly = protectedPath.split(/[?#]/, 1)[0] ?? protectedPath;
    const fromView = pathToView(pathOnly);
    if (fromView === `project:${options.completedProjectId}`) {
      return null;
    }
    return protectedPath;
  };

  const explicitFromCandidate = options?.from;
  const explicitFrom = toValidCompletedFromPath(explicitFromCandidate);
  if (explicitFrom) {
    return explicitFrom;
  }
  if (explicitFromCandidate != null) {
    const fallbackFromExplicit = toValidCompletedFromPath(options?.fallback);
    return fallbackFromExplicit ?? "/tasks";
  }

  const fromParam = toValidCompletedFromPath(searchParams.get("from"));
  if (fromParam) {
    return fromParam;
  }

  if (
    isProtectedPath(locationPathname) &&
    locationPathname !== "/settings" &&
    !isCompletedPath(locationPathname)
  ) {
    const currentPath = toValidCompletedFromPath(currentLocationPath);
    if (currentPath) {
      return currentPath;
    }
  }

  const fallback = toValidCompletedFromPath(options?.fallback);
  return fallback ?? "/tasks";
};

type ResolveSettingsFromPathArgs = {
  locationPathname: string;
  currentLocationPath: string;
  searchParams: URLSearchParams;
};

export const resolveSettingsFromPathValue = ({
  locationPathname,
  currentLocationPath,
  searchParams,
}: ResolveSettingsFromPathArgs): string => {
  if (isProtectedPath(locationPathname) && locationPathname !== "/settings") {
    return currentLocationPath;
  }
  const fromParam = toProtectedFromPathCandidate(searchParams.get("from"));
  return fromParam ?? "/tasks";
};
