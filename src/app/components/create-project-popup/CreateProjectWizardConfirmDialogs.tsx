import React from "react";
import { AnimatePresence, motion } from "motion/react";
type CreateProjectWizardConfirmDialogsProps = {
  showCloseConfirm: boolean;
  editProjectId?: string | null;
  setShowCloseConfirm: (show: boolean) => void;
  handleConfirmCancel: () => void;
  handleConfirmSave: () => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleConfirmDelete: () => void;
  showDeleteProjectConfirm: boolean;
  setShowDeleteProjectConfirm: (show: boolean) => void;
  handleConfirmDeleteProject: () => void;
};
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");
const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      element.getClientRects().length > 0 &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.hasAttribute("disabled"),
  );
export function CreateProjectWizardConfirmDialogs({
  showCloseConfirm,
  editProjectId,
  setShowCloseConfirm,
  handleConfirmCancel,
  handleConfirmSave,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleConfirmDelete,
  showDeleteProjectConfirm,
  setShowDeleteProjectConfirm,
  handleConfirmDeleteProject,
}: CreateProjectWizardConfirmDialogsProps) {
  const closeConfirmOverlayRef = React.useRef<HTMLDivElement>(null);
  const closeConfirmDialogRef = React.useRef<HTMLDivElement>(null);
  const closeConfirmTitleId = React.useId();
  React.useEffect(() => {
    if (!showCloseConfirm) {
      return;
    }
    const previousFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = closeConfirmDialogRef.current;
    const [firstFocusable] = dialog ? getFocusableElements(dialog) : [];
    if (firstFocusable) {
      firstFocusable.focus();
    } else if (dialog) {
      dialog.focus();
    } else {
      closeConfirmOverlayRef.current?.focus();
    }
    return () => {
      if (previousFocusedElement && document.contains(previousFocusedElement)) {
        previousFocusedElement.focus();
      }
    };
  }, [showCloseConfirm]);
  const handleCloseConfirmKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowCloseConfirm(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const dialog = closeConfirmDialogRef.current;
      if (!dialog) {
        return;
      }
      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (event.shiftKey) {
        if (
          activeElement === firstFocusable ||
          !dialog.contains(activeElement)
        ) {
          event.preventDefault();
          lastFocusable.focus();
        }
        return;
      }
      if (activeElement === lastFocusable || !dialog.contains(activeElement)) {
        event.preventDefault();
        firstFocusable.focus();
      }
    },
    [setShowCloseConfirm],
  );
  return (
    <>
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowCloseConfirm(false)}
            onKeyDown={handleCloseConfirmKeyDown}
            ref={closeConfirmOverlayRef}
            tabIndex={-1}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation()
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby={closeConfirmTitleId}
              ref={closeConfirmDialogRef}
              tabIndex={-1}
            >
              <p
                id={closeConfirmTitleId}
                className="txt-role-body-lg txt-tone-primary font-medium mb-[6px]"
              >
                {editProjectId ? "Save your progress?" : "Save as draft?"}
              </p>
              <p className="txt-role-body-md txt-tone-subtle mb-[24px] txt-leading-body">
                {editProjectId
                  ? "Would you like to save your changes before closing?"
                  : "You can continue where you left off later."}
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] txt-role-body-lg font-medium txt-tone-primary hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="h-[36px] px-[17px] rounded-full bg-[#e8e8e8] hover:bg-white txt-tone-inverse txt-role-body-lg font-medium transition-all cursor-pointer"
                >
                  {editProjectId ? "Save progress" : "Save draft"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation()
              }
            >
              <p className="txt-role-body-lg txt-tone-primary font-medium mb-[6px]">
                Delete this draft?
              </p>
              <p className="txt-role-body-md txt-tone-subtle mb-[24px] txt-leading-body">
                This action cannot be undone. The draft and all its progress
                will be permanently removed.
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] txt-role-body-lg font-medium txt-tone-primary hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-[36px] px-[17px] rounded-full bg-[rgba(255,59,48,0.12)] hover:bg-[rgba(255,59,48,0.2)] txt-tone-danger txt-role-body-lg font-medium transition-all cursor-pointer"
                >
                  Delete draft
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDeleteProjectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
            onClick={() => setShowDeleteProjectConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#1e1f20] rounded-[24px] p-[24px] w-full max-w-[340px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.3)] border border-[rgba(232,232,232,0.06)]"
              onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation()
              }
            >
              <p className="txt-role-body-lg txt-tone-primary font-medium mb-[6px]">
                Delete this project?
              </p>
              <p className="txt-role-body-md txt-tone-subtle mb-[24px] txt-leading-body">
                This action cannot be undone. The project and all its data will
                be permanently removed.
              </p>
              <div className="flex gap-[10px] justify-end">
                <button
                  onClick={() => setShowDeleteProjectConfirm(false)}
                  className="h-[36px] px-[17px] rounded-full border border-[rgba(232,232,232,0.1)] txt-role-body-lg font-medium txt-tone-primary hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteProject}
                  className="h-[36px] px-[17px] rounded-full bg-[rgba(255,59,48,0.12)] hover:bg-[rgba(255,59,48,0.2)] txt-tone-danger txt-role-body-lg font-medium transition-all cursor-pointer"
                >
                  Delete project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
