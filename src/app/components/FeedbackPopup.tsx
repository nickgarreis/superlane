import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lightbulb, Bug, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import {
  POPUP_CLOSE_BUTTON_CLASS,
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "./popup/popupChrome";
type FeedbackType = "feature" | "bug";
interface FeedbackPopupProps {
  isOpen: boolean;
  type: FeedbackType;
  onClose: () => void;
}
export function FeedbackPopup({ isOpen, type, onClose }: FeedbackPopupProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [isOpen, type]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);
  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success(
      type === "feature"
        ? "Feature request submitted — thank you!"
        : "Bug report submitted — we'll look into it",
    );
    setIsSubmitting(false);
    onClose();
  };
  const isFeature = type === "feature";
  const canSubmit = title.trim().length > 0 && !isSubmitting;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${POPUP_OVERLAY_CENTER_CLASS} z-[200]`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`${POPUP_SHELL_CLASS} max-w-[480px]`}
            onClick={(e: React.MouseEvent<HTMLDivElement>) =>
              e.stopPropagation()
            }
          >
            <div aria-hidden className={POPUP_SHELL_BORDER_CLASS} />
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center",
                    isFeature ? "bg-feedback-feature-soft" : "bg-feedback-bug-soft",
                  )}
                >
                  {isFeature ? (
                    <Lightbulb size={16} className="text-feedback-feature" />
                  ) : (
                    <Bug size={16} className="text-feedback-bug" />
                  )}
                </div>
                <h2 className="txt-role-body-lg font-medium txt-tone-primary">
                  {isFeature ? "Request a feature" : "Report a bug"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`${POPUP_CLOSE_BUTTON_CLASS} size-8 text-white/30 hover:text-white/60`}
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="txt-role-meta font-medium text-white/35 uppercase tracking-wider">
                  Title
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isFeature
                      ? "Brief summary of your idea"
                      : "What went wrong?"
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 txt-role-body-lg txt-tone-primary placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const ta = document.getElementById("feedback-desc");
                      ta?.focus();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="txt-role-meta font-medium text-white/35 uppercase tracking-wider">
                  Description
                  <span className="text-white/20 font-normal normal-case tracking-normal ml-1.5">
                    optional
                  </span>
                </label>
                <textarea
                  id="feedback-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isFeature
                      ? "Describe the feature and how it would help you..."
                      : "Steps to reproduce, what you expected to happen..."
                  }
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 txt-role-body-lg txt-tone-primary placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 px-6 pb-5">
              <button
                onClick={onClose}
                className="px-4 py-2 txt-role-body-md font-medium text-white/50 hover:text-white/80 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 txt-role-body-md font-medium rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                  canSubmit
                    ? isFeature
                      ? "bg-feedback-feature text-text-inverse-strong"
                      : "bg-feedback-bug text-text-inverse-strong"
                    : "bg-popup-control text-white/30",
                )}
              >
                {isSubmitting ? (
                  <div
                    className="size-3.5 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "transparent",
                      borderTopColor: "currentColor",
                    }}
                  />
                ) : (
                  <Send size={13} />
                )}
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
