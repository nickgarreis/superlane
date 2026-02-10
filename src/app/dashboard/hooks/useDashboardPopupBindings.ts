import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react";
import type { ViewerIdentity } from "../../types";
import { reportUiError } from "../../lib/errors";
import { parseSettingsTab, type PendingHighlight, type SettingsTab } from "../types";

type SearchHighlight = { type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string };

type UseDashboardPopupBindingsArgs = {
  viewerIdentity: ViewerIdentity;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  openSettings: (tab?: SettingsTab) => void;
  preloadSearchPopupModule: () => Promise<unknown>;
  preloadCreateProjectPopupModule: () => Promise<unknown>;
  preloadSettingsPopupModule: () => Promise<unknown>;
  signOut: () => Promise<unknown> | void;
};

export const useDashboardPopupBindings = ({
  viewerIdentity,
  setPendingHighlight,
  openSettings,
  preloadSearchPopupModule,
  preloadCreateProjectPopupModule,
  preloadSettingsPopupModule,
  signOut,
}: UseDashboardPopupBindingsArgs) => {
  const viewerName = viewerIdentity.name;
  const viewerAvatar = viewerIdentity.avatarUrl || "";

  const createProjectViewer = useMemo(
    () => ({
      userId: viewerIdentity.userId ?? undefined,
      name: viewerName,
      avatar: viewerAvatar,
      role: viewerIdentity.role ?? undefined,
    }),
    [viewerAvatar, viewerIdentity.role, viewerIdentity.userId, viewerName],
  );

  const searchPopupOpenSettings = useCallback(
    (tab?: string) => {
      openSettings(parseSettingsTab(tab));
    },
    [openSettings],
  );

  const searchPopupHighlightNavigate = useCallback(
    (projectId: string, highlight: SearchHighlight) => {
      setPendingHighlight({ projectId, ...highlight });
    },
    [setPendingHighlight],
  );

  const handleSearchIntent = useCallback(() => {
    void preloadSearchPopupModule();
  }, [preloadSearchPopupModule]);

  const handleCreateProjectIntent = useCallback(() => {
    void preloadCreateProjectPopupModule();
  }, [preloadCreateProjectPopupModule]);

  const handleSettingsIntent = useCallback(() => {
    void preloadSettingsPopupModule();
  }, [preloadSettingsPopupModule]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      reportUiError("dashboard.signOut", error, {
        userMessage: "Failed to sign out",
      });
    }
  }, [signOut]);

  return {
    createProjectViewer,
    searchPopupOpenSettings,
    searchPopupHighlightNavigate,
    handleSearchIntent,
    handleCreateProjectIntent,
    handleSettingsIntent,
    handleSignOut,
  };
};
