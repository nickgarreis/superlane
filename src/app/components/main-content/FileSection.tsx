import React from "react";
import { cn } from "../../../lib/utils";
import type { ProjectFileTab } from "../../types";
import svgPaths from "../../../imports/svg-0erue6fqwq";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
import {
  DASHBOARD_SEARCH_BORDER_CLASS,
  DASHBOARD_SEARCH_CONTAINER_CLASS,
  DASHBOARD_SEARCH_CONTENT_CLASS,
  DASHBOARD_SEARCH_ICON_WRAP_CLASS,
  DASHBOARD_SEARCH_INPUT_CLASS,
} from "../ui/dashboardChrome";
type FileSectionProps = {
  isMobile?: boolean;
  activeTab: ProjectFileTab;
  setActiveTab: (value: ProjectFileTab) => void;
  handleUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  canMutateProjectFiles: boolean;
  fileMutationDisabledMessage: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: "relevance" | "name";
  setSortBy: (value: "relevance" | "name") => void;
  isSortOpen: boolean;
  setIsSortOpen: (value: boolean) => void;
  shouldOptimizeFileRows: boolean;
  renderedFileRows: React.ReactNode;
  filteredFilesLength: number;
};
export const FileSection = React.memo(function FileSection({
  isMobile = false,
  activeTab,
  setActiveTab,
  handleUploadClick,
  fileInputRef,
  handleFileChange,
  canMutateProjectFiles,
  fileMutationDisabledMessage,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  isSortOpen,
  setIsSortOpen,
  shouldOptimizeFileRows,
  renderedFileRows,
  filteredFilesLength,
}: FileSectionProps) {
  return (
    <>
      <div
        data-testid="file-section-tabs-actions-row"
        className="flex items-center justify-between gap-3 md:gap-4 mb-8 pt-[24px] md:pt-[45px] pr-[0px] pb-[0px] pl-[0px]"
      >
        <div
          data-testid="file-section-tabs-strip"
          className="flex flex-1 min-w-0 items-center gap-2 md:gap-4 overflow-x-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={() => setActiveTab("Assets")}
            className={cn(
              "shrink-0 px-[14px] md:px-[17px] py-[7px] txt-role-body-lg font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Assets"
                ? "bg-control-surface-soft txt-tone-primary backdrop-blur-[6px]"
                : "txt-tone-subtle hover:txt-tone-primary",
            )}
          >
            Assets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Contract")}
            className={cn(
              "shrink-0 px-[14px] md:px-[17px] py-[7px] txt-role-body-lg font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Contract"
                ? "bg-control-surface-soft txt-tone-primary backdrop-blur-[6px]"
                : "txt-tone-subtle hover:txt-tone-primary",
            )}
          >
            Contract
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Attachments")}
            className={cn(
              "shrink-0 px-[14px] md:px-[17px] py-[7px] txt-role-body-lg font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Attachments"
                ? "bg-control-surface-soft txt-tone-primary backdrop-blur-[6px]"
                : "txt-tone-subtle hover:txt-tone-primary",
            )}
          >
            Attachments
          </button>
        </div>
        <DeniedAction
          className="shrink-0"
          denied={!canMutateProjectFiles}
          reason={fileMutationDisabledMessage}
          tooltipAlign="right"
        >
          <button
            onClick={handleUploadClick}
            disabled={!canMutateProjectFiles}
            className={cn(
              "shrink-0 flex items-center gap-1 pl-[9px] pr-[13px] py-[7.75px] rounded-full transition-colors",
              canMutateProjectFiles
                ? "bg-text-tone-primary hover:bg-white txt-tone-inverse cursor-pointer"
                : "bg-popup-primary-disabled-45 text-text-inverse-strong/45 cursor-not-allowed",
            )}
          >
            <div className="w-4 h-4 shrink-0 txt-tone-inverse">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p34261000} fill="currentColor" />
              </svg>
            </div>
            <span className="txt-role-body-md font-medium txt-tone-inverse txt-leading-body">
              {`Add ${
                activeTab === "Assets"
                  ? "asset"
                  : activeTab === "Contract"
                    ? "contract"
                    : "attachment"
              }`}
            </span>
          </button>
        </DeniedAction>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between mb-6 z-10 relative">
        <div className={DASHBOARD_SEARCH_CONTAINER_CLASS}>
          <div className={DASHBOARD_SEARCH_BORDER_CLASS} />
          <div className={DASHBOARD_SEARCH_CONTENT_CLASS}>
            <div className={DASHBOARD_SEARCH_ICON_WRAP_CLASS}>
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p3f80a980} fill="currentColor" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search content"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={DASHBOARD_SEARCH_INPUT_CLASS}
            />
          </div>
        </div>
        <div className={cn("relative", isMobile && "self-end")}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsSortOpen(false);
              }
            }}
            aria-haspopup="true"
            aria-expanded={isSortOpen}
            className="flex items-center gap-2 txt-role-body-lg font-medium txt-tone-subtle hover:txt-tone-primary transition-colors cursor-pointer"
          >
            {sortBy === "relevance" ? "Relevance" : "Name (A-Z)"}
            <div className="w-4 h-4 shrink-0 txt-tone-primary/80">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p7659d00} fill="currentColor" />
              </svg>
            </div>
          </button>
          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSortOpen(false)}
              />
              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-40 py-1 z-20",
                  MENU_SURFACE_CLASS,
                )}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSortOpen(false);
                  }
                }}
                tabIndex={-1}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("relevance");
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    MENU_ITEM_CLASS,
                    "px-4",
                    sortBy === "relevance"
                      ? cn(MENU_ITEM_ACTIVE_CLASS, "font-medium")
                      : "text-white/60",
                  )}
                >
                  Relevance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("name");
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    MENU_ITEM_CLASS,
                    "px-4",
                    sortBy === "name"
                      ? cn(MENU_ITEM_ACTIVE_CLASS, "font-medium")
                      : "text-white/60",
                  )}
                >
                  Name (A-Z)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className="flex flex-col gap-2"
        style={
          shouldOptimizeFileRows
            ? ({
                contentVisibility: "auto",
                containIntrinsicSize: "640px",
              } as const)
            : undefined
        }
      >
        <div>{renderedFileRows}</div>
        {filteredFilesLength === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <p className="text-sm">
              {searchQuery
                ? `No files found matching \"${searchQuery}\"`
                : `No ${activeTab === "Assets" ? "assets" : activeTab === "Contract" ? "contracts" : "attachments"} yet`}
            </p>
          </div>
        )}
      </div>
    </>
  );
});
