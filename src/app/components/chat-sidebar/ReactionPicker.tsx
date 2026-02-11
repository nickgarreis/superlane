import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";
import { MENU_SURFACE_CLASS } from "../ui/menuChrome";
const REACTION_OPTIONS = ["👍", "❤️", "👀", "🎉", "💡", "✅"];
type ReactionPickerProps = {
  commentId: string;
  isOpen: boolean;
  onToggleReaction: (commentId: string, emoji: string) => void;
};
export function ReactionPicker({
  commentId,
  isOpen,
  onToggleReaction,
}: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "absolute left-0 bottom-full mb-1 flex items-center gap-0.5 p-1 z-50",
            MENU_SURFACE_CLASS,
          )}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onToggleReaction(commentId, emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors txt-role-body-lg cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
