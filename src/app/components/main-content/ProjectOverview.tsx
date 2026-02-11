import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ProjectLogo } from "../ProjectLogo";
import { MenuIcon } from "./MenuIcon";
import type {
  MainContentNavigationActions,
  MainContentProjectActions,
} from "../../dashboard/types";
import type { ProjectData, ViewerIdentity } from "../../types";
import { formatProjectDeadlineShort } from "../../lib/dates";
import { StatusBadgeIcon } from "../status/StatusBadgeIcon";
type ProjectOverviewProps = {
  project: ProjectData;
  viewerIdentity: ViewerIdentity;
  projectActions: MainContentProjectActions;
  navigationActions?: MainContentNavigationActions;
};
export function ProjectOverview({
  project,
  viewerIdentity,
  projectActions,
  navigationActions,
}: ProjectOverviewProps) {
  const backToLabel = navigationActions?.backLabel
    ? navigationActions.backLabel
    : navigationActions?.backTo
      ? `${navigationActions.backTo.charAt(0).toUpperCase()}${navigationActions.backTo.slice(1)}`
      : "Archive";
  const statusColor = project.archived
    ? "var(--file-type-default)"
    : (project.status.color ?? "var(--status-draft)");
  return (
    <>
      {navigationActions?.back && (
        <button
          onClick={navigationActions.back}
          className="flex items-center gap-2 txt-role-body-md text-white/50 hover:text-white/80 transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to {backToLabel}</span>
        </button>
      )}
      <div className="flex gap-6 mb-10 items-center">
        <ProjectLogo size={140} category={project.category} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-5 w-full">
            <h1 className="txt-role-screen-title txt-tone-primary txt-leading-hero">
              {project.name}
            </h1>
            <MenuIcon
              isArchived={project.archived}
              isCompleted={project.status.label === "Completed"}
              viewerRole={viewerIdentity.role}
              onArchive={() => projectActions.archive?.(project.id)}
              onUnarchive={() => projectActions.unarchive?.(project.id)}
              onDelete={() => projectActions.remove?.(project.id)}
              onComplete={() =>
                projectActions.updateStatus?.(project.id, "Completed")
              }
              onUncomplete={() =>
                projectActions.updateStatus?.(project.id, "Active")
              }
            />
          </div>
          <div className="max-w-[672px]">
            <p className="txt-role-body-lg txt-tone-subtle font-normal txt-leading-title">
              {project.description}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-12 pt-[24px] pb-[55px] w-full border-t border-[rgba(232,232,232,0.05)] pr-[0px] pl-[0px]">
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Created by
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
              {project.creator.avatar ? (
                <img
                  src={project.creator.avatar}
                  alt={project.creator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center txt-role-micro font-medium text-white/80">
                  {project.creator.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <span className="txt-role-body-lg font-medium txt-tone-primary">
              {project.creator.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 relative z-20">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Status
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-[6px] relative shrink-0 px-0 py-[4px] rounded-full self-start select-none",
            )}
          >
            <StatusBadgeIcon
              statusLabel={project.status.label}
              archived={project.archived}
              className="size-4 shrink-0"
              color={statusColor}
            />
            <span
              className="txt-role-body-md txt-leading-body font-medium"
              style={{ color: statusColor }}
            >
              {project.archived ? "Archived" : project.status.label}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Scope
          </div>
          <div className="txt-role-body-lg font-medium txt-tone-primary">
            {project.scope || project.category}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Deadline
          </div>
          <div className="txt-role-body-lg font-medium txt-tone-primary">
            {formatProjectDeadlineShort(project.deadlineEpochMs) || "Not set"}
          </div>
        </div>
        {project.completedAt && (
          <div className="flex flex-col gap-1.5">
            <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
              Completed on
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 txt-tone-success" />
              <span className="txt-role-body-lg font-medium txt-tone-success">
                {new Date(project.completedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
