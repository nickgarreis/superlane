import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  ChevronDown,
  CheckCheck,
  MessageSquare,
  Send,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { CollaborationComment, ProjectData } from "../../types";
import type { AppView } from "../../lib/routing";
import { MentionItem as MentionItemType, MentionTextarea } from "../MentionTextarea";
import { ProjectDropdown } from "./ProjectDropdown";

type ChatSidebarViewProps = {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
  sortedProjects: ProjectData[];
  isDropdownOpen: boolean;
  onDropdownOpenChange: (value: boolean) => void;
  onSwitchProject?: (view: AppView) => void;
  totalThreadCount: number;
  currentComments: CollaborationComment[];
  unresolvedComments: CollaborationComment[];
  resolvedCommentItems: React.ReactNode;
  unresolvedCommentItems: React.ReactNode;
  resolvedCount: number;
  showResolvedThreads: boolean;
  onToggleResolvedThreads: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  shouldOptimizeCommentRows: boolean;
  currentUserName: string;
  currentUserAvatar: string;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  inputFocused: boolean;
  onInputFocusChange: (value: boolean) => void;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  onSubmitComment: (event?: React.FormEvent) => void;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const resolvedThreadsPanelId = "resolved-threads-panel";

export const ChatSidebarView = React.memo(function ChatSidebarView({
  isOpen,
  onClose,
  activeProject,
  sortedProjects,
  isDropdownOpen,
  onDropdownOpenChange,
  onSwitchProject,
  totalThreadCount,
  currentComments,
  unresolvedComments,
  resolvedCommentItems,
  unresolvedCommentItems,
  resolvedCount,
  showResolvedThreads,
  onToggleResolvedThreads,
  scrollRef,
  shouldOptimizeCommentRows,
  currentUserName,
  currentUserAvatar,
  inputValue,
  onInputValueChange,
  inputFocused,
  onInputFocusChange,
  mentionItems,
  onMentionClick,
  onSubmitComment,
}: ChatSidebarViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute top-0 right-0 bottom-0 w-[420px] bg-bg-surface border-l border-white/[0.05] shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
        >
          <div className="shrink-0 px-4 h-[57px] flex items-center border-b border-white/[0.05] bg-bg-surface relative z-20">
            <div className="flex items-center w-full pr-10">
              <ProjectDropdown
                activeProject={activeProject}
                sortedProjects={sortedProjects}
                isOpen={isDropdownOpen}
                onOpenChange={onDropdownOpenChange}
                onSwitchProject={onSwitchProject}
              />
              {totalThreadCount > 0 && (
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/25 select-none mr-2">
                  <MessageSquare className="w-3 h-3" />
                  <span>{totalThreadCount}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="absolute top-1/2 -translate-y-1/2 right-3 p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.04]">
            <form onSubmit={onSubmitComment}>
              <div
                className={cn(
                  "flex items-start gap-2.5 rounded-xl p-3 transition-all duration-200 border",
                  inputFocused
                    ? "bg-white/[0.03] border-white/[0.08]"
                    : "bg-transparent border-transparent hover:bg-white/[0.02]",
                )}
              >
                <div className="shrink-0 pt-0.5">
                  <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                    {currentUserAvatar ? (
                      <img
                        src={currentUserAvatar}
                        alt={currentUserName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/80">
                        {getInitials(currentUserName)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <MentionTextarea
                    value={inputValue}
                    onChange={onInputValueChange}
                    items={mentionItems}
                    onFocus={() => onInputFocusChange(true)}
                    onBlur={() => onInputFocusChange(false)}
                    placeholder="Leave a comment... (@ to mention)"
                    className="w-full bg-transparent border-none p-0 text-[13.5px] text-[#E8E8E8] placeholder:text-white/20 focus:outline-none resize-none leading-[1.5] min-h-[22px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        onSubmitComment();
                      }
                    }}
                    onMentionClick={onMentionClick}
                  />
                  <AnimatePresence>
                    {(inputValue.trim() || inputFocused) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.12 }}
                        className="flex items-center justify-between mt-2 overflow-hidden"
                      >
                        <span className="text-[10px] text-white/15 select-none">
                          ⌘Enter to send · @ to mention
                        </span>
                        <button
                          type="submit"
                          disabled={!inputValue.trim()}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer",
                            inputValue.trim()
                              ? "bg-white/90 text-bg-base hover:bg-white"
                              : "bg-white/[0.06] text-white/20 cursor-not-allowed",
                          )}
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>
          </div>

          <div
            ref={scrollRef}
            className="chat-comment-list flex-1 overflow-y-auto px-1.5 pb-8"
            style={shouldOptimizeCommentRows
              ? ({ contentVisibility: "auto", containIntrinsicSize: "900px" } as const)
              : undefined}
          >
            {currentComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-white/15" />
                </div>
                <p className="text-[13px] text-white/25 mb-1">
                  No comments yet
                </p>
                <p className="text-[12px] text-white/12 max-w-[200px]">
                  Start a conversation about {activeProject.name}
                </p>
              </div>
            ) : (
              <>
                {unresolvedComments.length > 0 && (
                  <div className="pt-2">
                    {unresolvedCommentItems}
                  </div>
                )}

                {resolvedCount > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={onToggleResolvedThreads}
                      aria-expanded={showResolvedThreads}
                      aria-controls={resolvedThreadsPanelId}
                      aria-label={showResolvedThreads ? "Collapse resolved threads" : "Expand resolved threads"}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white/20 hover:text-white/35 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex-1 h-px bg-white/[0.04]" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CheckCheck className="w-3 h-3" />
                        <span>
                          {resolvedCount} resolved{" "}
                          {resolvedCount === 1 ? "thread" : "threads"}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 transition-transform duration-200",
                            showResolvedThreads && "rotate-180",
                          )}
                        />
                      </div>
                      <div className="flex-1 h-px bg-white/[0.04]" />
                    </button>

                    <AnimatePresence>
                      {showResolvedThreads && (
                        <motion.div
                          id={resolvedThreadsPanelId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="opacity-50">
                            {resolvedCommentItems}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
