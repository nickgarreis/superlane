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
import svgPathsStatus from "../../../imports/svg-95p4xxlon7";

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
  const backToLabel = navigationActions?.backTo
    ? `${navigationActions.backTo.charAt(0).toUpperCase()}${navigationActions.backTo.slice(1)}`
    : "Archive";

  return (
    <>
      {navigationActions?.back && (
        <button
          onClick={navigationActions.back}
          className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to {backToLabel}</span>
        </button>
      )}

      <div className="flex gap-6 mb-10 items-center">
        <ProjectLogo size={140} category={project.category} />

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-5 w-full">
            <h1 className="text-[22.7px] font-medium text-[#E8E8E8] leading-[33.6px]">{project.name}</h1>
            <MenuIcon
              isArchived={project.archived}
              isCompleted={project.status.label === "Completed"}
              viewerRole={viewerIdentity.role}
              onArchive={() => projectActions.archive?.(project.id)}
              onUnarchive={() => projectActions.unarchive?.(project.id)}
              onDelete={() => projectActions.remove?.(project.id)}
              onComplete={() => projectActions.updateStatus?.(project.id, "Completed")}
              onUncomplete={() => projectActions.updateStatus?.(project.id, "Active")}
            />
          </div>
          <div className="max-w-[672px]">
            <p className="text-[15.4px] text-[rgba(232,232,232,0.6)] font-normal leading-[24px]">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12 pt-[24px] pb-[55px] w-full border-t border-[rgba(232,232,232,0.05)] pr-[0px] pl-[0px]">
        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Created by</div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
              {project.creator.avatar ? (
                <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px] font-medium text-white/80">
                  {project.creator.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[14px] font-medium text-[#E8E8E8]">{project.creator.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 relative z-20">
          <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Status</div>
          <div
            className={cn(
              "flex gap-[6px] items-center relative shrink-0 px-3 py-1 rounded-full self-start select-none",
              project.archived ? "opacity-80" : "",
            )}
            style={{ backgroundColor: project.archived ? "rgba(156, 163, 175, 0.1)" : project.status.bgColor }}
          >
            <div className="relative shrink-0 size-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                <g>
                  <path d={svgPathsStatus.p2d5480} fill={project.archived ? "#9CA3AF" : project.status.color} />
                  <path d={svgPathsStatus.pc8d3c00} fill={project.archived ? "#9CA3AF" : project.status.color} />
                </g>
              </svg>
            </div>
            <span className="text-[13px] leading-[20px] font-medium" style={{ color: project.archived ? "#9CA3AF" : project.status.color }}>
              {project.archived ? "Archived" : project.status.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Scope</div>
          <div className="text-[14px] font-medium text-[#E8E8E8]">{project.scope || project.category}</div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Deadline</div>
          <div className="text-[14px] font-medium text-[#E8E8E8]">
            {formatProjectDeadlineShort(project.deadlineEpochMs) || "Not set"}
          </div>
        </div>

        {project.completedAt && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Completed on</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span className="text-[14px] font-medium text-[#22c55e]">
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
