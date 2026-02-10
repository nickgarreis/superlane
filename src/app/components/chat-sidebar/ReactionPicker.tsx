import React from "react";
import { motion, AnimatePresence } from "motion/react";

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
          className="absolute left-0 bottom-full mb-1 bg-[#1E1F20] border border-white/10 rounded-lg shadow-xl shadow-black/40 flex items-center gap-0.5 p-1 z-50"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onToggleReaction(commentId, emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-[14px] cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
