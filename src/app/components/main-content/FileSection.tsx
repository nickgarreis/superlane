import React from "react";
import { cn } from "../../../lib/utils";
import type { ProjectFileTab } from "../../types";
import svgPaths from "../../../imports/svg-0erue6fqwq";
import { DeniedAction } from "../permissions/DeniedAction";

type FileSectionProps = {
  projectId: string;
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
  projectId,
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
      <div className="flex items-center justify-between mb-8 pt-[45px] pr-[0px] pb-[0px] pl-[0px]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("Assets")}
            className={cn(
              "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Assets" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]",
            )}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab("Contract")}
            className={cn(
              "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Contract" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]",
            )}
          >
            Contract
          </button>
          <button
            onClick={() => setActiveTab("Attachments")}
            className={cn(
              "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer",
              activeTab === "Attachments" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]",
            )}
          >
            Attachments
          </button>
        </div>

        <DeniedAction denied={!canMutateProjectFiles} reason={fileMutationDisabledMessage} tooltipAlign="right">
          <button
            onClick={handleUploadClick}
            disabled={!canMutateProjectFiles}
            className={cn(
              "flex items-center gap-1 pl-[9px] pr-[13px] py-[7.75px] rounded-full transition-colors",
              canMutateProjectFiles
                ? "bg-[#E8E8E8] hover:bg-white cursor-pointer"
                : "bg-[#E8E8E8]/45 text-black/45 cursor-not-allowed",
            )}
          >
            <div className="w-4 h-4 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p34261000} fill="black" fillOpacity="0.667" />
              </svg>
            </div>
            <span className="text-[13px] font-medium text-[#141415] leading-[19.5px]">
              Add {activeTab === "Assets" ? "asset" : (activeTab === "Contract" ? "contract" : "attachment")}
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

      <div className="flex items-center justify-between mb-6 z-10 relative">
        <div className="relative w-[384px] h-[36px]">
          <div className="absolute inset-0 rounded-[18px] border border-[rgba(232,232,232,0.15)] pointer-events-none" />
          <div className="flex items-center h-full px-3">
            <div className="w-4 h-4 shrink-0 mr-2 opacity-40">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p3f80a980} fill="#E8E8E8" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search content"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
            />
          </div>
        </div>

        <div className="relative">
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
            className="flex items-center gap-2 text-[14px] font-medium text-[rgba(232,232,232,0.6)] hover:text-[#E8E8E8] transition-colors cursor-pointer"
          >
            {sortBy === "relevance" ? "Relevance" : "Name (A-Z)"}
            <div className="w-4 h-4 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                <path d={svgPaths.p7659d00} fill="#E8E8E8" fillOpacity="0.8" />
              </svg>
            </div>
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-xl overflow-hidden py-1 z-20"
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
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors",
                    sortBy === "relevance" ? "text-white font-medium" : "text-white/60",
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
                    "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors",
                    sortBy === "name" ? "text-white font-medium" : "text-white/60",
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
        style={shouldOptimizeFileRows
          ? ({ contentVisibility: "auto", containIntrinsicSize: "640px" } as const)
          : undefined}
      >
        <div key={projectId + "-" + activeTab}>
          {renderedFileRows}
        </div>
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
