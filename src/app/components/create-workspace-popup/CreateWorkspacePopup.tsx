import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const ACCEPTED_MIME_TYPES = "image/png,image/jpeg,image/gif,image/webp";
type CreateWorkspacePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    logoFile?: File | null;
  }) => Promise<void> | void;
};
export function CreateWorkspacePopup({
  isOpen,
  onClose,
  onCreate,
}: CreateWorkspacePopupProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = useMemo(
    () => workspaceName.trim().charAt(0).toUpperCase() || "W",
    [workspaceName],
  );
  const canSubmit = workspaceName.trim().length > 0 && !isSubmitting;
  useEffect(() => {
    if (!isOpen) {
      setWorkspaceName("");
      setLogoFile(null);
      setLogoPreviewUrl(null);
      setIsSubmitting(false);
      setSubmitError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSubmitting, onClose]);
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);
  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };
  const handleSelectLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      return;
    }
    setSubmitError(null);
    if (!nextFile.type.startsWith("image/")) {
      setSubmitError("Please upload an image file (PNG, JPG, GIF, or WebP).");
      event.target.value = "";
      return;
    }
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(nextFile);
    setLogoPreviewUrl(URL.createObjectURL(nextFile));
  };
  const handleRemoveLogo = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = workspaceName.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ name: trimmedName, logoFile });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create workspace";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.form
            initial={{ y: 8, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onSubmit={handleSubmit}
            onClick={(event: React.MouseEvent<HTMLFormElement>) =>
              event.stopPropagation()
            }
            className="bg-[#1e1f20] relative rounded-[32px] w-full max-w-[520px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_12px_32px_0px_rgba(0,0,0,0.08)] overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute border border-[#131314] border-solid inset-0 pointer-events-none rounded-[32px]"
            />
            <div className="px-[28px] py-[22px] border-b border-white/5 flex items-center justify-between gap-3">
              <div>
                <p className="txt-role-panel-title txt-leading-title txt-tone-primary">
                  Create a new Workspace
                </p>
                <p className="txt-role-body-md txt-leading-body txt-tone-subtle mt-1">
                  Add your workspace name and optionally upload a company
                  profile image.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] rounded-full size-[34px] flex items-center justify-center txt-tone-primary hover:bg-[rgba(232,232,232,0.1)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Close create workspace popup"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-[28px] py-[24px] flex flex-col gap-6">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_MIME_TYPES}
                onChange={handleSelectLogo}
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-4">
                <div className="size-[72px] rounded-2xl border border-white/10 bg-[#193cb8] overflow-hidden flex items-center justify-center text-white txt-role-display-badge font-semibold shrink-0">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Workspace logo preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="txt-role-body-lg txt-tone-primary font-medium">
                    Company profile image
                  </p>
                  <p className="txt-role-body-sm txt-tone-faint mt-1">
                    Optional. PNG, JPG, GIF, or WebP.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="cursor-pointer px-3 py-1.5 rounded-full border border-white/15 bg-white/5 txt-tone-primary txt-role-body-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      <Upload size={12} />
                      {logoFile ? "Replace image" : "Upload image"}
                    </button>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={isSubmitting}
                        className="cursor-pointer px-3 py-1.5 rounded-full border border-white/10 bg-transparent txt-tone-muted txt-role-body-sm font-medium hover:txt-tone-primary hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="txt-role-body-md font-medium txt-tone-subtle">
                  Workspace name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(event) => {
                    setWorkspaceName(event.target.value);
                    if (submitError) {
                      setSubmitError(null);
                    }
                  }}
                  maxLength={100}
                  autoFocus
                  disabled={isSubmitting}
                  placeholder="Enter workspace name..."
                  className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 txt-role-panel-title txt-leading-display txt-tone-primary focus:outline-none focus:border-white/35 transition-colors placeholder:text-white/20 disabled:opacity-50"
                />
              </div>
              {submitError && (
                <p className="txt-role-body-sm text-red-300/90">
                  {submitError}
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 rounded-full border border-white/15 bg-transparent txt-role-body-md font-medium txt-tone-muted hover:txt-tone-primary hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="cursor-pointer px-4 py-2 rounded-full bg-[#E8E8E8] txt-tone-inverse txt-role-body-md font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
