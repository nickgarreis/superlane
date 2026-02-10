const DASHBOARD_STORAGE_VERSION = 1 as const;
const DASHBOARD_STORAGE_KEY = "dashboard:v1";
const LEGACY_ACTIVE_WORKSPACE_SLUG_STORAGE_KEY = "dashboard.activeWorkspaceSlug";

const isValidWorkspaceSlug = (value: string): boolean => /^[a-z0-9-]+$/.test(value);

type DashboardStorageV1 = {
  version: typeof DASHBOARD_STORAGE_VERSION;
  activeWorkspaceSlug: string | null;
};

const normalizeWorkspaceSlug = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized || !isValidWorkspaceSlug(normalized)) {
    return null;
  }

  return normalized;
};

const parseStorage = (rawValue: string | null): DashboardStorageV1 | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DashboardStorageV1>;
    if (parsed.version !== DASHBOARD_STORAGE_VERSION) {
      return null;
    }

    return {
      version: DASHBOARD_STORAGE_VERSION,
      activeWorkspaceSlug: normalizeWorkspaceSlug(parsed.activeWorkspaceSlug),
    };
  } catch {
    return null;
  }
};

const readStorageValue = (): DashboardStorageV1 | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStorage(window.localStorage.getItem(DASHBOARD_STORAGE_KEY));
};

const migrateLegacyStorageValue = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const legacyValue = normalizeWorkspaceSlug(
    window.localStorage.getItem(LEGACY_ACTIVE_WORKSPACE_SLUG_STORAGE_KEY),
  );

  window.localStorage.removeItem(LEGACY_ACTIVE_WORKSPACE_SLUG_STORAGE_KEY);

  if (!legacyValue) {
    return null;
  }

  writeDashboardWorkspaceSlug(legacyValue);
  return legacyValue;
};

export const readPersistedDashboardWorkspaceSlug = (): string | null => {
  const persisted = readStorageValue()?.activeWorkspaceSlug;
  if (persisted) {
    return persisted;
  }

  return migrateLegacyStorageValue();
};

export const writeDashboardWorkspaceSlug = (workspaceSlug: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedWorkspaceSlug = normalizeWorkspaceSlug(workspaceSlug);
  if (!normalizedWorkspaceSlug) {
    window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    return;
  }

  const payload: DashboardStorageV1 = {
    version: DASHBOARD_STORAGE_VERSION,
    activeWorkspaceSlug: normalizedWorkspaceSlug,
  };

  window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(payload));
};

export const dashboardStorageKeys = {
  current: DASHBOARD_STORAGE_KEY,
  legacy: LEGACY_ACTIVE_WORKSPACE_SLUG_STORAGE_KEY,
};
