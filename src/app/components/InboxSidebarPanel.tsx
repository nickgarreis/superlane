import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Inbox as InboxIcon, Filter, Search, X } from "lucide-react";
import { useSessionBackedState } from "../dashboard/hooks/useSessionBackedState";
import { Z_LAYERS } from "../lib/zLayers";
import { cn } from "../../lib/utils";
import type { WorkspaceActivity } from "../types";
import { GHOST_ICON_BUTTON_CLASS } from "./ui/controlChrome";
import {
  ACTIVITY_FILTER_ITEM_CLASS,
  ACTIVITY_FILTER_MENU_CLASS,
  ACTIVITY_KIND_LABELS,
  ACTIVITY_KINDS,
  type ActivityKindFilter,
} from "./activities-page/activityChrome";
import { CollaborationActivityRow } from "./activities-page/rows/CollaborationActivityRow";
import { FileActivityRow } from "./activities-page/rows/FileActivityRow";
import { MembershipActivityRow } from "./activities-page/rows/MembershipActivityRow";
import { ProjectActivityRow } from "./activities-page/rows/ProjectActivityRow";
import { TaskActivityRow } from "./activities-page/rows/TaskActivityRow";
import { WorkspaceActivityRow } from "./activities-page/rows/WorkspaceActivityRow";

type InboxSidebarPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  activities: WorkspaceActivity[];
  unreadCount?: number;
  onMarkActivityRead?: (activityId: string) => void;
  onDismissActivity?: (activityId: string) => void;
  onMarkAllRead?: () => void;
  onActivityClick?: (activity: WorkspaceActivity) => void;
  activitiesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceActivities?: (numItems: number) => void;
};

const INBOX_UI_SEARCH_KEY = "inbox.search";
const INBOX_UI_FILTER_KINDS_KEY = "inbox.filterKinds";
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

type RenderInboxActivityArgs = {
  showReadState: boolean;
  onMarkActivityRead?: (activityId: string) => void;
  onDismissActivity?: (activityId: string) => void;
  onActivityClick?: (activity: WorkspaceActivity) => void;
  onClose?: () => void;
};

const renderInboxActivity = (
  activity: WorkspaceActivity,
  args: RenderInboxActivityArgs,
) => {
  const onMarkRead = activity.isRead === false && args.onMarkActivityRead
    ? () => args.onMarkActivityRead?.(activity.id)
    : undefined;
  const onDismiss = args.onDismissActivity
    ? () => args.onDismissActivity?.(activity.id)
    : undefined;
  const onMentionClick = args.onActivityClick
    ? () => {
        if (activity.isRead === false) {
          args.onMarkActivityRead?.(activity.id);
        }
        args.onActivityClick?.(activity);
        args.onClose?.();
      }
    : undefined;
  switch (activity.kind) {
    case "project":
      return (
        <ProjectActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
    case "task":
      return (
        <TaskActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
    case "collaboration":
      return (
        <CollaborationActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
    case "file":
      return (
        <FileActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
    case "membership":
      return (
        <MembershipActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
    case "workspace":
    case "organization":
    default:
      return (
        <WorkspaceActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
        />
      );
  }
};

export const InboxSidebarPanel = React.memo(function InboxSidebarPanel({
  isOpen,
  onClose,
  activities,
  unreadCount = 0,
  onMarkActivityRead,
  onDismissActivity,
  onMarkAllRead,
  onActivityClick,
  activitiesPaginationStatus,
  loadMoreWorkspaceActivities,
}: InboxSidebarPanelProps) {
  const [searchQuery, setSearchQuery] = useSessionBackedState(
    INBOX_UI_SEARCH_KEY,
    "",
    deserializeString,
  );
  const [selectedKinds, setSelectedKinds] = useSessionBackedState<ActivityKindFilter[]>(
    INBOX_UI_FILTER_KINDS_KEY,
    EMPTY_KIND_FILTERS,
    deserializeKinds,
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setIsFilterOpen(false);
    }
  }, [isOpen]);

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
  const renderedActivities = useMemo(
    () =>
      filteredActivities.map((activity) =>
        renderInboxActivity(activity, {
          showReadState: typeof onMarkActivityRead === "function",
          onMarkActivityRead,
          onDismissActivity,
          onActivityClick,
          onClose,
        }),
      ),
    [
      filteredActivities,
      onMarkActivityRead,
      onDismissActivity,
      onActivityClick,
      onClose,
    ],
  );

  const handleToggleKind = useCallback(
    (kind: ActivityKindFilter) => {
      setSelectedKinds((current) =>
        current.includes(kind)
          ? current.filter((entry) => entry !== kind)
          : [...current, kind],
      );
    },
    [setSelectedKinds],
  );

  const handleClearKinds = useCallback(() => {
    setSelectedKinds([]);
  }, [setSelectedKinds]);

  const handleInboxScroll = useCallback(
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
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute left-full top-0 bottom-0 bg-bg-surface border-l border-r border-border-subtle-soft shadow-[16px_0_28px_-20px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden pointer-events-auto"
          style={{ zIndex: Z_LAYERS.dropdown }}
        >
          <div className="h-full w-[420px] flex flex-col">
            <div className="shrink-0 px-6 h-[57px] flex items-center border-b border-border-subtle-soft bg-bg-surface relative z-20">
              <div className="flex items-center gap-2 min-w-0">
                <InboxIcon className="w-4 h-4 txt-tone-primary shrink-0" />
                <h2 className="txt-role-body-lg txt-tone-primary">Inbox</h2>
                <span className="txt-role-kbd text-text-muted-weak">
                  {filteredActivities.length}
                </span>
                {unreadCount > 0 ? (
                  <span className="inline-flex rounded-full bg-accent-soft-bg px-2 py-0.5 txt-role-kbd txt-tone-accent">
                    {unreadCount > 99 ? "99+" : unreadCount} unread
                  </span>
                ) : null}
              </div>
              {unreadCount > 0 && onMarkAllRead ? (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="ml-auto mr-12 rounded-md border border-border-soft px-2.5 py-1 txt-role-body-sm txt-tone-subtle transition-colors hover:bg-control-surface-muted hover:txt-tone-primary"
                >
                  Mark all as read
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close inbox"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 right-3 p-2 text-text-muted-medium hover:text-text-tone-primary cursor-pointer",
                  GHOST_ICON_BUTTON_CLASS,
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              ref={scrollContainerRef}
              data-testid="inbox-scroll-region"
              className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4"
              onScroll={handleInboxScroll}
            >
              <div className="relative z-10 mb-4 flex items-center gap-2">
                <div className="relative h-9 flex-1">
                  <div className="absolute inset-0 rounded-[18px] border border-popup-border-emphasis pointer-events-none" />
                  <div className="flex h-full items-center px-3">
                    <Search size={16} className="mr-2 shrink-0 txt-tone-faint" />
                    <input
                      type="text"
                      aria-label="Search inbox"
                      placeholder="Search inbox"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full bg-transparent border-none txt-role-body-md txt-tone-primary placeholder:txt-tone-faint focus:outline-none"
                    />
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                      selectedKinds.length > 0
                        ? "bg-accent-soft-bg txt-tone-accent"
                        : isFilterOpen
                          ? "bg-control-surface-muted txt-tone-primary"
                          : "txt-tone-subtle hover:txt-tone-primary hover:bg-control-surface-muted",
                    )}
                    title="Filter inbox"
                  >
                    <Filter size={16} strokeWidth={2} />
                  </button>
                  {isFilterOpen ? (
                    <>
                      <button
                        type="button"
                        aria-label="Close inbox filter"
                        className="fixed inset-0 z-10"
                        onClick={() => setIsFilterOpen(false)}
                      />
                      <div className={ACTIVITY_FILTER_MENU_CLASS}>
                        <div className="flex items-center justify-between px-2.5 py-2">
                          <p className="txt-role-kbd txt-tone-faint uppercase tracking-wider">
                            Filter by type
                          </p>
                          <button
                            type="button"
                            className="txt-role-body-sm txt-tone-accent transition-colors hover:txt-tone-primary"
                            onClick={handleClearKinds}
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
                                onClick={() => handleToggleKind(kind)}
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
              {filteredActivities.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="txt-role-body-lg txt-tone-primary">No inbox activity found</p>
                  <p className="mt-1 txt-role-body-md txt-tone-faint">
                    Try a different search or filter.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="py-2 txt-role-meta uppercase tracking-wider txt-tone-faint">
                    Activities
                  </div>
                  <div className="flex flex-col">
                    {renderedActivities}
                  </div>
                </div>
              )}
              <div className="pt-4 txt-role-body-sm txt-tone-faint">
                {activitiesPaginationStatus === "LoadingMore"
                  ? "Loading more activity..."
                  : activitiesPaginationStatus === "CanLoadMore"
                    ? "Scroll to load more activity."
                    : filteredActivities.length > 0
                      ? "You are up to date."
                      : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
