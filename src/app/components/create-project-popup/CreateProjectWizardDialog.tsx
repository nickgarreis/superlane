import React, { useState, useCallback, useReducer, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import Loading03 from "../../../imports/Loading03";
import svgPaths from "../../../imports/svg-v61uoamt04";
import createProjectBgFallbackPng from "../../../assets/optimized/create-project-bg-fallback.png";
import createProjectBgWebp from "../../../assets/optimized/create-project-bg.webp";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker } from "react-day-picker";
import { toast } from "sonner";
import "react-day-picker/dist/style.css";
import { ProjectLogo } from "../ProjectLogo";
import { createClientId } from "../../lib/id";
import type { CreateProjectPayload, CreateProjectResult } from "../../dashboard/types";
import {
  ProjectDraftData,
  ProjectData,
  ReviewComment,
  WorkspaceRole,
} from "../../types";
import {
  formatProjectDeadlineLong,
  formatProjectDeadlineMedium,
  fromUtcNoonEpochMsToDateOnly,
  toUtcNoonEpochMsFromDateOnly,
} from "../../lib/dates";
import { useDraftAttachments } from "./useDraftAttachments";
import { CreateProjectWizardConfirmDialogs } from "./CreateProjectWizardConfirmDialogs";
import { WizardCloseButton } from "./WizardCloseButton";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  getProjectLifecycleDeniedReason,
  getReviewApprovalDeniedReason,
  getReviewCommentAuthorDeniedReason,
  isAdminOrOwner,
} from "../../lib/permissionRules";
import {
  type CreateProjectWizardState,
  createInitialCreateProjectWizardState,
  reduceCreateProjectWizardState,
} from "./wizardState";

const step3Paths = {
  p7659d00: "M5.25317 6.2182C5.46077 6.0106 5.7822 6.01729 5.96969 6.21152L8.56792 8.96373L11.1527 6.21152C11.3402 6.0106 11.675 6.01729 11.8692 6.22489C12.05 6.41237 12.0433 6.72043 11.8491 6.92803L9.21746 9.71373C8.86923 10.0954 8.25317 10.0954 7.90494 9.71373L5.27323 6.92803C5.09917 6.74049 5.08574 6.39232 5.25317 6.2182Z",
};

const SERVICES = ["Web Design"];

const JOB_OPTIONS = ["I would like to discuss some possibilities", "Create something new", "Refine something existing"];

const WEB_DESIGN_SCOPE = ["UI/UX Audit", "Landing page(s)", "Website", "Web content or elements", "Design system", "Product design", "Interactive animations"];

const WEB_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "UI/UX Audit": "\u{1F4E5}",
  "Landing page(s)": "\u{1F4C4}",
  "Website": "\u{1F310}",
  "Web content or elements": "\u{1F58C}\uFE0F",
  "Design system": "\u{1F3A8}",
  "Product design": "\u{1F4F1}",
  "Interactive animations": "\u{1F300}",
};

const createDraftSessionId = () => createClientId("draft");

export function CreateProjectPopup({ 
  isOpen, 
  onClose,
  onCreate,
  user,
  editProjectId,
  initialDraftData,
  onDeleteDraft,
  reviewProject,
  onUpdateComments,
  onApproveReviewProject,
  onUploadAttachment,
  onRemovePendingAttachment,
  onDiscardDraftUploads,
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreate?: (data: CreateProjectPayload) => Promise<CreateProjectResult> | CreateProjectResult | void;
  user?: { userId?: string; name: string; avatar: string; role?: WorkspaceRole };
  editProjectId?: string | null;
  initialDraftData?: ProjectDraftData | null;
  onDeleteDraft?: (id: string) => void;
  reviewProject?: ProjectData | null;
  onUpdateComments?: (projectId: string, comments: ReviewComment[]) => Promise<unknown>;
  onApproveReviewProject?: (projectId: string) => Promise<unknown>;
  onUploadAttachment?: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  onRemovePendingAttachment?: (pendingUploadId: string) => Promise<void>;
  onDiscardDraftUploads?: (draftSessionId: string) => Promise<void>;
}) {
  const [wizardState, dispatchWizard] = useReducer(
    reduceCreateProjectWizardState,
    undefined,
    createInitialCreateProjectWizardState,
  );
  const { step, showCloseConfirm, showDeleteConfirm, showDeleteProjectConfirm, createdProjectId, isApprovingReview } = wizardState;
  const patchWizardState = useCallback((patch: Partial<CreateProjectWizardState>) => {
    dispatchWizard({ type: "patch", patch });
  }, []);
  const setStep = useCallback((value: number) => {
    patchWizardState({ step: value });
  }, [patchWizardState]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [draftSessionId, setDraftSessionId] = useState(() => createDraftSessionId());
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const {
    attachments,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveAttachment,
    handleRetryAttachment,
    markDiscardRequested,
    resetAttachments,
  } = useDraftAttachments({
    draftSessionId,
    onUploadAttachment,
    onRemovePendingAttachment,
  });

  useEffect(() => {
    if (isOpen && initialDraftData) {
      setSelectedService(initialDraftData.selectedService);
      setProjectName(initialDraftData.projectName);
      setSelectedJob(initialDraftData.selectedJob);
      setDescription(initialDraftData.description);
      setIsAIEnabled(initialDraftData.isAIEnabled);
      setDeadline(fromUtcNoonEpochMsToDateOnly(initialDraftData.deadlineEpochMs));
      setStep(initialDraftData.lastStep);
    }
  }, [isOpen, initialDraftData]);

  useEffect(() => {
    if (isOpen && reviewProject) {
      const categoryMap: Record<string, string> = {
        "webdesign": "Web Design", "web design": "Web Design",
        "automation": "AI Automation", "ai automation": "AI Automation",
        "marketing": "Marketing Campaigns", "marketing campaigns": "Marketing Campaigns",
        "presentation": "Presentation", "ai consulting": "AI Consulting",
        "creative strategy & concept": "Creative Strategy & Concept",
      };
      setSelectedService(categoryMap[reviewProject.category.toLowerCase()] || reviewProject.category);
      setProjectName(reviewProject.name);
      setSelectedJob(reviewProject.scope || null);
      setDescription(reviewProject.description);
      setDeadline(fromUtcNoonEpochMsToDateOnly(reviewProject.deadlineEpochMs));
      setReviewComments(reviewProject.comments || []);
      setStep(4);
    }
  }, [isOpen, reviewProject]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setDraftSessionId(createDraftSessionId());
    resetAttachments();
  }, [isOpen, resetAttachments]);

  type ServiceKey = typeof SERVICES[number];

  const getStep2Config = (service: ServiceKey) => ({
    title: "Define project details",
    logo: <ProjectLogo size={108} category={service} />,
    jobLabel: service === "Web Design" ? "Scope" : "Job",
    jobOptions: service === "Web Design" ? WEB_DESIGN_SCOPE : JOB_OPTIONS,
    jobIcons: service === "Web Design" ? WEB_DESIGN_SCOPE_ICONS : null,
  });

  const step3Config = {
    title: "Let's explore some possibilities",
    showAttachments: true,
    showAI: true,
    showDeadline: true,
  };

  const step2Config = selectedService ? getStep2Config(selectedService as ServiceKey) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setStep(1);
    setSelectedService(null);
    setProjectName("");
    setSelectedJob(null);
    setDescription("");
    setIsAIEnabled(true);
    setDeadline(undefined);
    setIsCalendarOpen(false);
    resetAttachments();
    patchWizardState({
      showCloseConfirm: false,
      showDeleteConfirm: false,
      showDeleteProjectConfirm: false,
    });
    setReviewComments([]);
    setCommentInput("");
    patchWizardState({ createdProjectId: null });
    setDraftSessionId(createDraftSessionId());
  }, [isOpen, resetAttachments]);

  if (!isOpen) return null;

  const isStepValid = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!projectName.trim() && !!selectedJob;
    return true;
  };
  const isNextDisabled = !isStepValid() || (step === 3 && isUploading);

  const hasUnsavedWork = () => {
    if (!editProjectId) {
      return !!selectedService || !!projectName.trim();
    }
    if (initialDraftData) {
      if ((selectedService || "") !== (initialDraftData.selectedService || "")) return true;
      if (projectName !== (initialDraftData.projectName || "")) return true;
      if ((selectedJob || "") !== (initialDraftData.selectedJob || "")) return true;
      if (description !== (initialDraftData.description || "")) return true;
      if (isAIEnabled !== initialDraftData.isAIEnabled) return true;
      const initialDeadlineEpochMs = initialDraftData.deadlineEpochMs ?? null;
      const currentDeadlineEpochMs = deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null;
      if (currentDeadlineEpochMs !== initialDeadlineEpochMs) return true;
      if (attachments.length > 0) return true;
      return false;
    }
    return !!selectedService || !!projectName.trim();
  };

  const buildDraftData = (): ProjectDraftData => ({
    selectedService: selectedService || "",
    projectName,
    selectedJob: selectedJob || "",
    description,
    isAIEnabled,
    deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
    lastStep: step,
  });

  const createProject = (status: string): Promise<CreateProjectResult | null> => {
    if (isUploading) {
      toast.error("Please wait for attachments to finish uploading");
      return Promise.reject(new Error("Attachments are still uploading"));
    }

    const attachmentPendingUploadIds = attachments
      .filter((file) => file.status === "uploaded" && file.pendingUploadId)
      .map((file) => file.pendingUploadId as string);

    const projectData: CreateProjectPayload = {
      name: projectName,
      description,
      category: selectedService ?? undefined,
      scope: selectedJob ?? undefined,
      deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
      attachmentPendingUploadIds,
      status,
    };

    if (status === "Draft") {
      projectData.draftData = buildDraftData();
    } else {
      projectData.draftData = null;
    }

    if (editProjectId) {
      projectData._editProjectId = editProjectId;
    }
    
    if (!onCreate) {
      return Promise.resolve(null);
    }
    return Promise.resolve(onCreate(projectData)).then((result) => {
      if (result && typeof result === "object" && "publicId" in result && typeof result.publicId === "string") {
        patchWizardState({ createdProjectId: result.publicId });
        return result;
      }
      return null;
    });
  };

  const handleNext = async () => {
    if (step === 1 && isStepValid()) {
      setStep(2);
    } else if (step === 2 && isStepValid()) {
      setStep(3);
    } else if (step === 3) {
      try {
        await createProject("Review");
        setStep(4);
      } catch (error) {
        console.error(error);
        toast.error("Failed to create project");
      }
    }
  };

  const handleDeleteDraft = () => {
    patchWizardState({ showDeleteConfirm: true });
  };

  const handleConfirmDelete = () => {
    if (editProjectId && onDeleteDraft) {
      onDeleteDraft(editProjectId);
    }
    patchWizardState({ showDeleteConfirm: false });
    handleCancel();
  };

  const handleConfirmDeleteProject = () => {
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onDeleteDraft) {
      onDeleteDraft(projectId);
    }
    patchWizardState({ showDeleteProjectConfirm: false });
    handleCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const handleCancel = (options?: { discardUploads?: boolean }) => {
    const shouldDiscardUploads = options?.discardUploads !== false;
    if (shouldDiscardUploads) {
      markDiscardRequested();
    }
    if (
      shouldDiscardUploads &&
      onDiscardDraftUploads &&
      attachments.length > 0
    ) {
      void onDiscardDraftUploads(draftSessionId).catch(() => {
      });
    }

    onClose();
  };

  const handleCloseClick = () => {
    if (reviewProject) {
      handleCancel();
      return;
    }
    if (hasUnsavedWork()) {
      patchWizardState({ showCloseConfirm: true });
    } else {
      handleCancel();
    }
  };

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: ReviewComment = {
      id: createClientId("review-comment"),
      author: { userId: user?.userId, name: user?.name || "You", avatar: user?.avatar || "" },
      content: commentInput.trim(),
      timestamp: "Just now",
    };
    const previous = reviewComments;
    const updated = [...previous, newComment];
    setReviewComments(updated);
    setCommentInput("");
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onUpdateComments) {
      void onUpdateComments(projectId, updated).catch((error) => {
        console.error(error);
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }
    requestAnimationFrame(() => {
      if (typeof commentsEndRef.current?.scrollIntoView === "function") {
        commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = reviewComments.find((entry) => entry.id === commentId);
    if (!comment) {
      return;
    }

    if (!user?.userId || comment.author.userId !== user.userId) {
      toast.error("You can only delete your own comments");
      return;
    }

    const previous = reviewComments;
    const updated = previous.filter((c) => c.id !== commentId);
    setReviewComments(updated);
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onUpdateComments) {
      void onUpdateComments(projectId, updated).catch((error) => {
        console.error(error);
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }
  };

  const canRenderReviewApprovalAction =
    !!reviewProject?.id &&
    reviewProject.status.label === "Review" &&
    !!onApproveReviewProject;
  const canApproveReviewProject = canRenderReviewApprovalAction && user?.role === "owner";
  const canDeleteReviewProject = isAdminOrOwner(user?.role);
  const reviewApprovalDeniedReason = getReviewApprovalDeniedReason(user?.role);
  const reviewDeleteDeniedReason = getProjectLifecycleDeniedReason(user?.role);

  const handleApproveReview = () => {
    if (!canApproveReviewProject || !reviewProject?.id || !onApproveReviewProject || isApprovingReview) {
      return;
    }

    patchWizardState({ isApprovingReview: true });
    void onApproveReviewProject(reviewProject.id)
      .then(() => {
        handleCancel();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to approve project");
      })
      .finally(() => {
        patchWizardState({ isApprovingReview: false });
      });
  };

  const handleConfirmSave = async () => {
    try {
      await createProject("Draft");
      patchWizardState({ showCloseConfirm: false });
      handleCancel({ discardUploads: false });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft");
    }
  };

  const handleConfirmCancel = () => {
    if (editProjectId && initialDraftData) {
      const revertData: CreateProjectPayload = {
        name: initialDraftData.projectName,
        description: initialDraftData.description,
        category: initialDraftData.selectedService,
        scope: initialDraftData.selectedJob,
        deadlineEpochMs: initialDraftData.deadlineEpochMs ?? null,
        status: "Draft",
        draftData: initialDraftData,
        _editProjectId: editProjectId,
      };
      if (onCreate) {
        void Promise.resolve(onCreate(revertData)).catch((error) => {
          console.error(error);
          toast.error("Failed to restore original draft");
        });
      }
    }
    patchWizardState({ showCloseConfirm: false });
    handleCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleCloseClick}>
      <div className={`bg-[#1e1f20] relative rounded-[40px] w-full max-w-[514px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_12px_32px_0px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {/* Border stroke */}
        <div aria-hidden="true" className="absolute border border-[#131314] border-solid inset-0 pointer-events-none rounded-[40px] z-20" />
        
        <div className={`flex flex-col items-start w-full relative rounded-[inherit] ${step === 4 ? 'flex-1 overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
          
          {/* Header Image Area (Step 1 only) */}
          {step === 1 && (
            <div className="h-[187px] relative shrink-0 w-full">
              <picture className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 max-w-none pointer-events-none size-full">
                <source srcSet={createProjectBgWebp} type="image/webp" />
                <img
                  alt=""
                  className="size-full object-cover pointer-events-none"
                  src={createProjectBgFallbackPng}
                />
              </picture>
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[32px] py-[24px] relative size-full">
                <div className="content-stretch flex items-center relative shrink-0 w-full justify-between">
                  <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap">
                    <p className="leading-[25.2px]">{editProjectId ? "Edit Project" : "Create a new Project"}</p>
                  </div>
                  
                  {/* Close Button */}
                  <WizardCloseButton className="z-30" onClick={handleCloseClick} />
                </div>
              </div>
            </div>
          )}

          {/* Close Button (Steps 2 & 3) */}
          {(step === 2 || step === 3) && (
             <div className="absolute right-[25px] top-[25px] z-30">
                <WizardCloseButton onClick={handleCloseClick} />
             </div>
          )}

          {/* Step 3 Header Title */}
          {step === 3 && step3Config && (
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="px-[33px] pt-[29px] w-full"
            >
               <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap">
                  <p className="leading-[25.2px]">{step3Config.title}</p>
               </div>
            </motion.div>
          )}

          {/* Content Area */}
          <div className={`${step === 1 ? 'p-[32px]' : step === 4 ? 'flex-1 flex flex-col overflow-hidden' : 'px-[33px] pb-[33px]'} w-full flex flex-col`}>
            
            {/* Step 1 Content */}
            {step === 1 && (
              <>
                <motion.div 
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.35 }}
                  className="mb-6 w-full"
                >
                  <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#e8e8e8] text-[14px] mb-2">
                    <p className="leading-[19.6px] whitespace-pre-wrap">Solutions</p>
                  </div>
                  <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[13.8px] text-[rgba(232,232,232,0.6)] w-full">
                    <p className="leading-[19.6px] whitespace-pre-wrap">Choose the service that fit your needs.</p>
                  </div>
                </motion.div>

                <div className="flex flex-wrap gap-4 w-full mb-8">
                  {SERVICES.map((service, idx) => (
                    <motion.div 
                      key={service}
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12 + idx * 0.05, duration: 0.3 }}
                      onClick={() => setSelectedService(service)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => setSelectedService(service))}
                      className={`
                        content-stretch flex gap-[8px] h-[36px] items-center px-[14px] relative rounded-full shrink-0 cursor-pointer transition-all border outline-none focus-visible:ring-2 focus-visible:ring-white/50
                        ${selectedService === service 
                          ? "bg-white/10 border-white/20 text-white" 
                          : "bg-transparent border-transparent hover:bg-white/5 text-[#e8e8e8]"}
                      `}
                    >
                      <ProjectLogo size={16} category={service} />
                      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] whitespace-nowrap">
                        <p className="leading-[21px]">{service}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                

              </>
            )}

            {/* Step 2 Content */}
            {step === 2 && step2Config && (
              <div className="pt-[29px] flex flex-col items-center gap-[32px] w-full">
                 <div className="flex flex-col items-center gap-4 pt-[20px]">
                   <motion.div
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   >
                     {step2Config.logo}
                   </motion.div>
                   <motion.div
                     initial={{ y: 6, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.15, duration: 0.35 }}
                     className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap"
                   >
                      <p className="leading-[25.2px]">{step2Config.title}</p>
                   </motion.div>
                 </div>

                 <div className="w-full flex flex-col gap-[16px]">
                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25, duration: 0.35 }}
                      className="w-full flex flex-col gap-[0.01px]"
                    >
                       <div className="pb-[8px] w-full">
                          <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">Project name</p>
                       </div>
                       <div className="w-full border-b border-[rgba(232,232,232,0.1)] pb-[5px]">
                          <input 
                             type="text" 
                             value={projectName}
                             onChange={(e) => setProjectName(e.target.value)}
                             className="w-full bg-transparent border-none outline-none font-medium text-[#e8e8e8] text-[19.5px] leading-[32px] p-0 placeholder-white/20"
                             placeholder="Enter project name..."
                          />
                       </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.35 }}
                      className="w-full pt-[16px]"
                    >
                       <div className="pb-[8px] w-full">
                          <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">{step2Config.jobLabel}</p>
                       </div>
                       <div className="flex flex-wrap gap-[6px] items-start w-full">
                          {step2Config.jobOptions.map((job, idx) => (
                             <motion.div 
                                key={job}
                                initial={{ y: 6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.42 + idx * 0.04, duration: 0.3 }}
                                onClick={() => setSelectedJob(job)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyDown(e, () => setSelectedJob(job))}
                                className={`
                                   backdrop-blur-[6px] bg-[rgba(232,232,232,0.04)] content-stretch flex h-[36px] items-center px-[17px] py-[7px] relative rounded-full shrink-0 cursor-pointer border transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/50
                                   ${selectedJob === job 
                                     ? "bg-white/10 border-white/20 text-white" 
                                     : "border-[rgba(232,232,232,0.04)] hover:bg-white/5 text-[#e8e8e8]"}
                                `}
                             >
                                <p className="font-medium text-[14px] leading-[20px] whitespace-nowrap">
                                   {step2Config.jobIcons?.[job] && <span className="mr-[6px]">{step2Config.jobIcons[job]}</span>}
                                   {job}
                                </p>
                             </motion.div>
                          ))}
                       </div>
                    </motion.div>
                 </div>
              </div>
            )}

            {/* Step 3 Content */}
            {step === 3 && step3Config && (
               <div className="pt-[16px] w-full flex flex-col h-[480px] overflow-y-auto custom-scrollbar pr-1">
                  {/* Project Description */}
                  <motion.div
                     initial={{ y: 8, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.1, duration: 0.35 }}
                     className="w-full mb-[32px]"
                  >
                     <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">Project description</p>
                     <div className="bg-[rgba(232,232,232,0.04)] h-[104px] rounded-[18px] w-full border border-[rgba(232,232,232,0.04)] relative">
                        <textarea 
                           className="w-full h-full bg-transparent border-none outline-none resize-none p-[16px] text-[#e8e8e8] text-[14px] placeholder-[rgba(232,232,232,0.4)]"
                           placeholder="Enter workflow description"
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                        />
                     </div>
                  </motion.div>

                  {/* Attachments */}
                  {step3Config.showAttachments && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                        className="w-full mb-[32px]"
                     >
                        <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">Attachments</p>
                        
                        <div 
                           {...getRootProps()}
                           className={`
                               border border-dashed border-[rgba(232,232,232,0.2)] rounded-[18px] w-full min-h-[64px] flex flex-col items-center justify-center cursor-pointer transition-colors relative p-4
                               ${isDragActive ? "bg-white/10 border-white/40" : "hover:bg-[rgba(232,232,232,0.04)]"}
                           `}
                        >
                           <input {...getInputProps()} />
                           <div className="flex items-center gap-2 mb-1">
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#e8e8e8] opacity-60">
                                   <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                               </svg>
                               <span className="text-[14px] text-[#e8e8e8] opacity-60 font-medium">
                                   {isDragActive ? "Drop files here..." : "Upload file"}
                               </span>
                           </div>
                           
                           {attachments.length > 0 && (
                               <div className="flex flex-col gap-1 mt-2 w-full">
                                   {attachments.map((file) => (
                                       <div key={file.clientId} className="flex items-center justify-between text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                                           <div className="flex flex-col min-w-0">
                                             <span className="truncate max-w-[250px]">{file.name}</span>
                                             <span className="text-[10px] text-white/40">
                                               {file.status === "uploading" && "Uploading..."}
                                               {file.status === "uploaded" && "Uploaded"}
                                               {file.status === "error" && (file.error || "Upload failed")}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-2 shrink-0">
                                             {file.status === "error" && (
                                               <button
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleRetryAttachment(file.clientId);
                                                 }}
                                                 className="text-[10px] text-white/70 hover:text-white"
                                               >
                                                 Retry
                                               </button>
                                             )}
                                             <button
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleRemoveAttachment(file.clientId);
                                               }}
                                               className="hover:text-white"
                                             >
                                               &times;
                                             </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                        </div>
                     </motion.div>
                  )}

                  {/* Allow AI usage */}
                  {step3Config.showAI && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.35 }}
                        className="w-full mb-[32px]"
                     >
                        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Allow AI usage</p>
                        <p className="text-[13.8px] text-[rgba(232,232,232,0.6)] mb-[8px] leading-[19.6px]">
                           Superlane will leverage AI tools when and if it&apos;s useful; for ideation, efficiency, volume and quality.
                        </p>
                        <div 
                           className={`${isAIEnabled ? "bg-[#22c55e]" : "bg-[rgba(232,232,232,0.08)]"} flex h-[16px] items-center px-[2px] relative rounded-[16px] w-[26px] cursor-pointer transition-colors`}
                           onClick={() => setIsAIEnabled(!isAIEnabled)}
                        >
                           <motion.div 
                              className="bg-white rounded-[6px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] size-[12px]" 
                              animate={{ x: isAIEnabled ? 10 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                           />
                        </div>
                     </motion.div>
                  )}

                  {/* Final Deadline */}
                  {step3Config.showDeadline && (
                     <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.35 }}
                        className="w-full mb-[24px]"
                     >
                        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Final deadline</p>
                        <p className="text-[13.7px] text-[rgba(232,232,232,0.6)] mb-[8px]">When do you expect to receive all assets ready to use?</p>
                        
                        <div className="relative w-full" ref={calendarRef}>
                           <div 
                              className="bg-[rgba(255,255,255,0)] flex items-center h-[36px] rounded-[100px] shadow-[0px_0px_0px_1px_rgba(232,232,232,0.15)] w-full px-[20px] relative cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                           >
                              <div className="flex-1 text-[#e8e8e8] text-[14px] font-medium">
                                 {formatProjectDeadlineLong(
                                   deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
                                 )}
                              </div>
                              <div className="size-[16px] shrink-0 opacity-80">
                                 <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                                    <path d={step3Paths.p7659d00} fill="var(--fill-0, #E8E8E8)" fillOpacity="0.8" />
                                 </svg>
                              </div>
                           </div>

                           <AnimatePresence>
                              {isCalendarOpen && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-[calc(100%+8px)] right-0 z-50 p-2 bg-[rgba(30,31,32,0.98)] rounded-[14px] shadow-[0px_18px_40px_-28px_rgba(0,0,0,0.9)] border border-[rgba(232,232,232,0.12)]"
                                 >
                                    <DayPicker
                                       className="rdp-dark-theme"
                                       mode="single"
                                       selected={deadline}
                                       onSelect={(date) => {
                                           if (date) {
                                               setDeadline(date);
                                               setIsCalendarOpen(false);
                                           }
                                       }}
                                       showOutsideDays
                                       disabled={{ before: new Date() }}
                                    />
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </motion.div>
                  )}
               </div>
            )}

            {/* Step 4 Content: Success — fixed header, scrollable middle, fixed footer */}
            {step === 4 && (
              <div className="flex flex-col w-full flex-1 overflow-hidden">
                {/* Fixed Header */}
                <div className="px-[33px] pt-[29px] pb-[20px] shrink-0 relative">
                  {/* Close button */}
                  <div className="absolute right-[25px] top-[25px] z-30">
                    <WizardCloseButton onClick={() => handleCancel()} />
                  </div>

                  {/* Success header */}
                  <div className="flex items-center gap-3">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="size-[36px] rounded-full bg-[#f97316]/10 flex items-center justify-center shrink-0"
                    >
                      <Loading03 className="size-[18px] animate-spin [animation-duration:4s] [--stroke-0:#f97316]" />
                    </motion.div>
                    <motion.div
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 0.35 }}
                    >
                      <h2 className="text-[17.7px] font-medium text-[#e8e8e8] leading-[25.2px]">{editProjectId ? "Project updated" : "Your Project is in Review"}</h2>
                    </motion.div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-[33px]">
                  {/* Summary */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.35 }}
                    className="w-full rounded-[16px] bg-[rgba(232,232,232,0.03)] border border-[rgba(232,232,232,0.06)] p-[20px] mb-[28px]"
                  >
                    <div className="grid grid-cols-2 gap-y-[16px] gap-x-[24px]">
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Service</span>
                        <div className="flex items-center gap-[6px]">
                          {selectedService && <ProjectLogo size={14} category={selectedService} />}
                          <span className="text-[14px] text-[#e8e8e8] font-medium">{selectedService || "\u2014"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">{step2Config?.jobLabel || "Scope"}</span>
                        <span className="text-[14px] text-[#e8e8e8] font-medium">{selectedJob || "\u2014"}</span>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Created by</span>
                        <div className="flex items-center gap-[6px]">
                          {user?.avatar && (
                            <img src={user.avatar} alt={user.name} className="size-[16px] rounded-full object-cover" />
                          )}
                          <span className="text-[14px] text-[#e8e8e8] font-medium">{user?.name || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-[12px] text-[rgba(232,232,232,0.4)] tracking-wide uppercase">Deadline</span>
                        <span className="text-[14px] text-[#e8e8e8] font-medium">
                          {formatProjectDeadlineMedium(
                            deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                {/* Comments Section */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="w-full mb-[28px]"
                  >
                    <p className="text-[14px] text-[rgba(232,232,232,0.5)] font-medium mb-[12px]">Add additional comments</p>

                    {/* Comment Input */}
                    <div className="flex items-start gap-[10px] mb-[16px]">
                      <div className="shrink-0 pt-[3px]">
                        <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                          {user?.avatar && <img src={user.avatar} alt={user?.name || "You"} className="w-full h-full object-cover" />}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-[8px]">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && commentInput.trim()) { e.preventDefault(); handleAddComment(); } }}
                          placeholder="Add a comment..."
                          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-[14px] py-[7px] text-[13px] text-[#E8E8E8] placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!commentInput.trim()}
                          className="shrink-0 size-[32px] rounded-full bg-[#e8e8e8] hover:bg-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#131314" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Comment List */}
                    {reviewComments.length > 0 && (
                      <div className="flex flex-col">
                        {reviewComments.map((comment) => (
                          <div key={comment.id} className="group/comment flex items-start gap-[10px] py-[10px] px-[2px] rounded-xl">
                            <div className="shrink-0 pt-[1px]">
                              <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                                {comment.author.avatar && <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-[8px] mb-[2px]">
                                <span className="text-[13px] text-[#E8E8E8]">{comment.author.name}</span>
                                <span className="text-[11px] text-white/25 select-none">{comment.timestamp}</span>
                              </div>
                              <p className="text-[13.5px] text-[#E8E8E8]/75 leading-[1.55] whitespace-pre-wrap break-words">{comment.content}</p>
                            </div>
                            <DeniedAction
                              denied={!(user?.userId && comment.author.userId === user.userId)}
                              reason={getReviewCommentAuthorDeniedReason(
                                Boolean(user?.userId && comment.author.userId === user.userId),
                              )}
                              tooltipAlign="right"
                            >
                              <button
                                onClick={() => {
                                  if (!user?.userId || comment.author.userId !== user.userId) {
                                    return;
                                  }
                                  handleDeleteComment(comment.id);
                                }}
                                className={`shrink-0 mt-[2px] opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150 p-[5px] rounded-md ${
                                  user?.userId && comment.author.userId === user.userId
                                    ? "hover:bg-white/[0.06] cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                                title="Delete comment"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={user?.userId && comment.author.userId === user.userId ? "rgba(232,232,232,0.35)" : "rgba(232,232,232,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </DeniedAction>
                          </div>
                        ))}
                      </div>
                    )}


                  </motion.div>

                  {/* What happens next */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.35 }}
                    className="w-full mb-[8px]"
                  >
                    <p className="text-[14px] text-[rgba(232,232,232,0.5)] font-medium mb-[20px]">Here&#39;s what happens next:</p>

                    <div className="flex flex-col relative">
                      {/* Vertical connector line */}
                      <div className="absolute left-[11px] top-[24px] bottom-[24px] w-px bg-[rgba(232,232,232,0.06)]" />

                      {[
                        {
                          num: "1",
                          title: "Brief review",
                          desc: "Your PM will review your project request within 48 hours, confirm the details, and follow up with any questions so we\u2019re fully aligned."
                        },
                        {
                          num: "2",
                          title: "Kickoff call",
                          desc: "Our team may reach out if a kickoff call is needed to ensure the project\u2019s success."
                        },
                        {
                          num: "3",
                          title: "Scoping and estimates",
                          desc: "We\u2019ll prepare cost estimates for your approval before any work begins, ensuring everything\u2019s clear and agreed upfront."
                        },
                        {
                          num: "4",
                          title: "Project timeline",
                          desc: "Your PM will share a proposed timeline based on your requested delivery date, so you\u2019ll know exactly what\u2019s happening and when."
                        }
                      ].map((item, idx) => (
                        <motion.div
                          key={item.num}
                          initial={{ y: 6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                          className={`flex gap-[12px] ${idx < 3 ? "pb-[20px]" : ""}`}
                        >
                          <div className="size-[22px] rounded-full bg-[rgba(232,232,232,0.06)] flex items-center justify-center shrink-0 z-10">
                            <span className="text-[11px] text-[rgba(232,232,232,0.5)] font-medium">{item.num}</span>
                          </div>
                          <div className="flex flex-col gap-[2px] pt-[1px]">
                            <span className="text-[13.5px] text-[#e8e8e8] font-medium leading-[20px]">{item.title}</span>
                            <span className="text-[13px] text-[rgba(232,232,232,0.4)] leading-[18px]">{item.desc}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  <div ref={commentsEndRef} />
                </div>

                {/* Fixed Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85, duration: 0.3 }}
                  className="shrink-0 px-[33px] py-[20px] border-t border-[rgba(232,232,232,0.06)] flex justify-between items-center"
                >
                  <DeniedAction denied={!canDeleteReviewProject} reason={reviewDeleteDeniedReason} tooltipAlign="left">
                    <button 
                      onClick={() => {
                        if (!canDeleteReviewProject) {
                          return;
                        }
                        patchWizardState({ showDeleteProjectConfirm: true });
                      }}
                      className={`content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-[rgba(255,59,48,0.06)] transition-all ${
                        canDeleteReviewProject
                          ? "opacity-80 hover:opacity-100 cursor-pointer"
                          : "opacity-45 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ff3b30] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[20px]">Delete project</p>
                      </div>
                    </button>
                  </DeniedAction>
                  <div className="flex items-center gap-[10px]">
                    {canRenderReviewApprovalAction && (
                      <DeniedAction denied={!canApproveReviewProject} reason={reviewApprovalDeniedReason} tooltipAlign="right">
                        <button
                          onClick={handleApproveReview}
                          disabled={isApprovingReview}
                          className={`h-[36px] px-[20px] text-[#131314] rounded-full text-[14px] font-medium transition-all ${
                            canApproveReviewProject
                              ? "bg-[#e8e8e8] hover:bg-white disabled:bg-[#e8e8e8]/50 disabled:text-[#131314]/50 disabled:cursor-not-allowed cursor-pointer"
                              : "bg-[#e8e8e8]/45 text-[#131314]/45 cursor-not-allowed"
                          }`}
                        >
                          {isApprovingReview ? "Approving..." : "Approve"}
                        </button>
                      </DeniedAction>
                    )}
                    <button
                      onClick={() => handleCancel()}
                      className={`h-[36px] px-[20px] rounded-full text-[14px] font-medium transition-all cursor-pointer ${
                        canRenderReviewApprovalAction
                          ? "border border-[rgba(232,232,232,0.2)] text-[#e8e8e8] hover:bg-white/5"
                          : "bg-[#e8e8e8] hover:bg-white text-[#131314]"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Footer Buttons (Common) */}
            {step !== 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className={`w-full flex items-center ${step === 1 ? 'pt-[24px]' : 'pt-[24px]'}`}
              >
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="backdrop-blur-[6px] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 border border-[rgba(232,232,232,0.1)] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[14px] text-center whitespace-nowrap">
                      <p className="leading-[20px]">Previous</p>
                    </div>
                  </button>
                )}

                <div className="flex gap-[16px] ml-auto">
                  {editProjectId && (
                    <button 
                      onClick={handleDeleteDraft}
                      className="content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-[rgba(255,59,48,0.06)] opacity-80 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#ff3b30] text-[14px] text-center whitespace-nowrap">
                        <p className="leading-[20px]">Delete draft</p>
                      </div>
                    </button>
                  )}

                  <button 
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`
                      content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 transition-all cursor-pointer
                      ${isNextDisabled ? "bg-[#e8e8e8]/50 cursor-not-allowed text-[#131314]/50" : "bg-[#e8e8e8] hover:bg-white text-[#131314]"}
                    `}
                  >
                    <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center whitespace-nowrap">
                      <p className="leading-[20px]">{step === 3 ? (editProjectId ? "Update & submit" : "Review & submit") : "Next"}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      <CreateProjectWizardConfirmDialogs
        showCloseConfirm={showCloseConfirm}
        editProjectId={editProjectId}
        setShowCloseConfirm={(show) => patchWizardState({ showCloseConfirm: show })}
        handleConfirmCancel={handleConfirmCancel}
        handleConfirmSave={handleConfirmSave}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={(show) => patchWizardState({ showDeleteConfirm: show })}
        handleConfirmDelete={handleConfirmDelete}
        showDeleteProjectConfirm={showDeleteProjectConfirm}
        setShowDeleteProjectConfirm={(show) => patchWizardState({ showDeleteProjectConfirm: show })}
        handleConfirmDeleteProject={handleConfirmDeleteProject}
      />
    </div>
  );
}
