import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSessionBackedState } from "../dashboard/hooks/useSessionBackedState";
import type { WorkspaceActivity } from "../types";
import { ActivitiesView } from "./activities-page/ActivitiesView";
import type { ActivityKindFilter } from "./activities-page/activityChrome";

const ACTIVITIES_UI_SEARCH_KEY = "activities.search";
const ACTIVITIES_UI_FILTER_KINDS_KEY = "activities.filterKinds";
const EMPTY_KIND_FILTERS: ActivityKindFilter[] = [];

const deserializeString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const deserializeKinds = (value: unknown): ActivityKindFilter[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const next = value.filter(
    (entry): entry is ActivityKindFilter =>
      entry === "project" ||
      entry === "task" ||
      entry === "collaboration" ||
      entry === "file" ||
      entry === "membership" ||
      entry === "workspace" ||
      entry === "organization",
  );
  return next.slice(0, 20);
};

type ActivitiesProps = {
  onToggleSidebar: () => void;
  activities: WorkspaceActivity[];
  activitiesPaginationStatus?:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceActivities?: (numItems: number) => void;
};

export function Activities({
  onToggleSidebar,
  activities,
  activitiesPaginationStatus = "Exhausted",
  loadMoreWorkspaceActivities,
}: ActivitiesProps) {
  const [searchQuery, setSearchQuery] = useSessionBackedState(
    ACTIVITIES_UI_SEARCH_KEY,
    "",
    deserializeString,
  );
  const [selectedKinds, setSelectedKinds] = useSessionBackedState<ActivityKindFilter[]>(
    ACTIVITIES_UI_FILTER_KINDS_KEY,
    EMPTY_KIND_FILTERS,
    deserializeKinds,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (activitiesPaginationStatus !== "LoadingMore") {
      isLoadingMoreRef.current = false;
    }
  }, [activitiesPaginationStatus]);

  const normalizedQuery = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  );

  const selectedKindsSet = useMemo(() => new Set(selectedKinds), [selectedKinds]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (
        selectedKindsSet.size > 0 &&
        !selectedKindsSet.has(activity.kind as ActivityKindFilter)
      ) {
        return false;
      }
      if (normalizedQuery.length === 0) {
        return true;
      }
      const searchable = [
        activity.kind,
        activity.action,
        activity.actorName,
        activity.projectName,
        activity.taskTitle,
        activity.fileName,
        activity.fileTab,
        activity.targetUserName,
        activity.fromValue,
        activity.toValue,
        activity.message,
      ]
        .filter((entry): entry is string => typeof entry === "string")
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [activities, normalizedQuery, selectedKindsSet]);

  const handleToggleKind = useCallback((kind: ActivityKindFilter) => {
    setSelectedKinds((current) =>
      current.includes(kind)
        ? current.filter((entry) => entry !== kind)
        : [...current, kind],
    );
  }, [setSelectedKinds]);

  const handleClearKinds = useCallback(() => {
    setSelectedKinds([]);
  }, [setSelectedKinds]);

  const handleActivitiesScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (
        isLoadingMoreRef.current ||
        activitiesPaginationStatus !== "CanLoadMore" ||
        !loadMoreWorkspaceActivities
      ) {
        return;
      }
      const element = event.currentTarget;
      const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 240) {
        isLoadingMoreRef.current = true;
        loadMoreWorkspaceActivities(100);
      }
    },
    [activitiesPaginationStatus, loadMoreWorkspaceActivities],
  );

  return (
    <ActivitiesView
      onToggleSidebar={onToggleSidebar}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      selectedKinds={selectedKinds}
      isFilterOpen={isFilterOpen}
      onFilterOpenChange={setIsFilterOpen}
      onToggleKind={handleToggleKind}
      onClearKinds={handleClearKinds}
      activities={filteredActivities}
      activitiesPaginationStatus={activitiesPaginationStatus}
      scrollContainerRef={scrollContainerRef}
      onScroll={handleActivitiesScroll}
    />
  );
}
