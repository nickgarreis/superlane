import React from "react";
import { Filter, Search } from "lucide-react";
import HorizontalBorder from "../../../imports/HorizontalBorder";
import { cn } from "../../../lib/utils";
import type { WorkspaceActivity } from "../../types";
import {
  DASHBOARD_ICON_TRIGGER_ACCENT_CLASS,
  DASHBOARD_ICON_TRIGGER_CLASS,
  DASHBOARD_ICON_TRIGGER_IDLE_CLASS,
  DASHBOARD_ICON_TRIGGER_OPEN_CLASS,
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "../ui/dashboardChrome";
import {
  ACTIVITY_EMPTY_STATE_CLASS,
  ACTIVITY_FILTER_ITEM_CLASS,
  ACTIVITY_FILTER_MENU_CLASS,
  ACTIVITY_KINDS,
  ACTIVITY_KIND_LABELS,
  ACTIVITY_PAGE_ROOT_CLASS,
  ACTIVITY_PAGE_SURFACE_CLASS,
  type ActivityKindFilter,
} from "./activityChrome";
import { CollaborationActivityRow } from "./rows/CollaborationActivityRow";
import { FileActivityRow } from "./rows/FileActivityRow";
import { MembershipActivityRow } from "./rows/MembershipActivityRow";
import { ProjectActivityRow } from "./rows/ProjectActivityRow";
import { TaskActivityRow } from "./rows/TaskActivityRow";
import { WorkspaceActivityRow } from "./rows/WorkspaceActivityRow";

type ActivitiesViewProps = {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedKinds: ActivityKindFilter[];
  isFilterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  onToggleKind: (kind: ActivityKindFilter) => void;
  onClearKinds: () => void;
  activities: WorkspaceActivity[];
  activitiesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
};

const renderActivity = (activity: WorkspaceActivity) => {
  switch (activity.kind) {
    case "project":
      return <ProjectActivityRow key={activity.id} activity={activity} />;
    case "task":
      return <TaskActivityRow key={activity.id} activity={activity} />;
    case "collaboration":
      return <CollaborationActivityRow key={activity.id} activity={activity} />;
    case "file":
      return <FileActivityRow key={activity.id} activity={activity} />;
    case "membership":
      return <MembershipActivityRow key={activity.id} activity={activity} />;
    case "workspace":
    case "organization":
    default:
      return <WorkspaceActivityRow key={activity.id} activity={activity} />;
  }
};

export function ActivitiesView({
  onToggleSidebar,
  searchQuery,
  onSearchQueryChange,
  selectedKinds,
  isFilterOpen,
  onFilterOpenChange,
  onToggleKind,
  onClearKinds,
  activities,
  activitiesPaginationStatus,
  scrollContainerRef,
  onScroll,
}: ActivitiesViewProps) {
  return (
    <div className={ACTIVITY_PAGE_ROOT_CLASS}>
      <div className={ACTIVITY_PAGE_SURFACE_CLASS}>
        <div className="h-[57px] w-full shrink-0">
          <HorizontalBorder onToggleSidebar={onToggleSidebar} />
        </div>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-[80px] py-[40px]"
          onScroll={onScroll}
        >
          <div className="mb-10 flex items-center gap-6">
            <div className="flex-1">
              <h1 className="tracking-tight txt-role-page-title txt-tone-primary">
                Activities
              </h1>
              <p className="mt-1 txt-role-body-md txt-tone-faint">
                Workspace activity log from this release onward.
              </p>
            </div>
          </div>

          <div className="relative z-10 mb-6 flex items-center justify-between">
            <div className={DASHBOARD_SEARCH_CONTAINER_CLASS}>
              <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
              <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
                <Search size={16} className="mr-2 shrink-0 txt-tone-faint" />
                <input
                  type="text"
                  placeholder="Search activities"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  className={DASHBOARD_SEARCH_INPUT_CLASS}
                />
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => onFilterOpenChange(!isFilterOpen)}
                className={cn(
                  DASHBOARD_ICON_TRIGGER_CLASS,
                  selectedKinds.length > 0
                    ? DASHBOARD_ICON_TRIGGER_ACCENT_CLASS
                    : isFilterOpen
                      ? DASHBOARD_ICON_TRIGGER_OPEN_CLASS
                      : DASHBOARD_ICON_TRIGGER_IDLE_CLASS,
                )}
                title="Filter activities"
              >
                <Filter size={16} strokeWidth={2} />
              </button>
              {isFilterOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Close activity filter"
                    className="fixed inset-0 z-10"
                    onClick={() => onFilterOpenChange(false)}
                  />
                  <div className={ACTIVITY_FILTER_MENU_CLASS}>
                    <div className="flex items-center justify-between px-2.5 py-2">
                      <p className="txt-role-kbd txt-tone-faint uppercase tracking-wider">
                        Filter by type
                      </p>
                      <button
                        type="button"
                        className="txt-role-body-sm txt-tone-accent transition-colors hover:txt-tone-primary"
                        onClick={onClearKinds}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {ACTIVITY_KINDS.map((kind) => {
                        const selected = selectedKinds.includes(kind);
                        return (
                          <button
                            key={kind}
                            type="button"
                            onClick={() => onToggleKind(kind)}
                            className={cn(
                              ACTIVITY_FILTER_ITEM_CLASS,
                              selected
                                ? "bg-surface-active-soft txt-tone-primary"
                                : "txt-tone-muted hover:bg-surface-hover-soft hover:txt-tone-primary",
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex h-4 w-4 items-center justify-center rounded-sm border",
                                selected
                                  ? "border-accent-soft-border bg-accent-soft-bg txt-tone-accent"
                                  : "border-border-soft txt-tone-faint",
                              )}
                            >
                              {selected ? "✓" : ""}
                            </span>
                            <span>{ACTIVITY_KIND_LABELS[kind]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {activities.length === 0 ? (
            <div className={ACTIVITY_EMPTY_STATE_CLASS}>
              <p className="txt-role-body-lg txt-tone-primary">No activities found</p>
              <p className="mt-1 txt-role-body-md txt-tone-faint">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center border-b border-border-subtle-soft px-4 py-2 txt-role-meta uppercase tracking-wider txt-tone-faint">
                <div className="flex-1 min-w-0">Activity</div>
                <div className="w-[120px] shrink-0 text-right">Type</div>
              </div>
              <div className="flex flex-col">{activities.map(renderActivity)}</div>
            </div>
          )}

          <div className="pt-4 txt-role-body-sm txt-tone-faint">
            {activitiesPaginationStatus === "LoadingMore"
              ? "Loading more activities..."
              : activitiesPaginationStatus === "CanLoadMore"
                ? "Scroll to load more activities."
                : activities.length > 0
                  ? "You are up to date."
                  : null}
          </div>
        </div>
      </div>
    </div>
  );
}
