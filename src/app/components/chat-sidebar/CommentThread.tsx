import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";

type CommentThreadProps = {
  commentId: string;
  isTopLevel: boolean;
  hasReplies: boolean;
  replyCount: number;
  isCollapsed: boolean;
  onToggleThread: (id: string) => void;
  children: React.ReactNode;
};

export function CommentThread({
  commentId,
  isTopLevel,
  hasReplies,
  replyCount,
  isCollapsed,
  onToggleThread,
  children,
}: CommentThreadProps) {
  if (!hasReplies) {
    return null;
  }

  if (!isTopLevel) {
    return <div className="ml-[38px] border-l border-white/[0.06]">{children}</div>;
  }

  return (
    <div className="ml-[38px]">
      <button
        onClick={() => onToggleThread(commentId)}
        className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors py-1 px-1.5 rounded cursor-pointer select-none"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        <span>
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-l border-white/[0.06] ml-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
