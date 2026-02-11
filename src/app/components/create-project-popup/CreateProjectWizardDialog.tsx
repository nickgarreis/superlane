import { motion } from "motion/react";
import createProjectBgFallbackPng from "../../../assets/optimized/create-project-bg-fallback.png";
import createProjectBgWebp from "../../../assets/optimized/create-project-bg.webp";
import {
  POPUP_OVERLAY_CENTER_CLASS,
  POPUP_SHELL_BORDER_CLASS,
  POPUP_SHELL_CLASS,
} from "../popup/popupChrome";
import { CreateProjectWizardConfirmDialogs } from "./CreateProjectWizardConfirmDialogs";
import { WizardCloseButton } from "./WizardCloseButton";
import {
  type CreateProjectPopupProps,
  useCreateProjectWizardController,
} from "./hooks/useCreateProjectWizardController";
import { StepDetails, STEP_THREE_TITLE } from "./steps/StepDetails";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
export function CreateProjectPopup(props: CreateProjectPopupProps) {
  const { isOpen, editProjectId, user } = props;
  const {
    step,
    showCloseConfirm,
    showDeleteConfirm,
    showDeleteProjectConfirm,
    isApprovingReview,
    selectedService,
    setSelectedService,
    projectName,
    setProjectName,
    selectedJob,
    setSelectedJob,
    description,
    setDescription,
    isAIEnabled,
    setIsAIEnabled,
    deadline,
    setDeadline,
    isCalendarOpen,
    setIsCalendarOpen,
    commentInput,
    setCommentInput,
    reviewComments,
    step2JobLabel,
    calendarRef,
    commentsEndRef,
    attachments,
    isDragActive,
    getRootProps,
    getInputProps,
    handleRemoveAttachment,
    handleRetryAttachment,
    canRenderReviewApprovalAction,
    canApproveReviewProject,
    canDeleteReviewProject,
    reviewApprovalDeniedReason,
    reviewDeleteDeniedReason,
    isNextDisabled,
    setStep,
    handleNext,
    handleDeleteDraft,
    handleConfirmDelete,
    handleConfirmDeleteProject,
    handleCloseClick,
    handleAddComment,
    handleDeleteComment,
    handleApproveReview,
    handleConfirmSave,
    handleConfirmCancel,
    handleCancel,
    requestDeleteReviewProject,
    setShowCloseConfirm,
    setShowDeleteConfirm,
    setShowDeleteProjectConfirm,
  } = useCreateProjectWizardController(props);
  if (!isOpen) {
    return null;
  }
  return (
    <div
      className={POPUP_OVERLAY_CENTER_CLASS}
      onClick={handleCloseClick}
    >
      <div
        className={`${POPUP_SHELL_CLASS} max-w-[514px] transition-all duration-300 max-h-[90vh] flex flex-col`}
        onClick={(event) => event.stopPropagation()}
      >
        <div aria-hidden="true" className={`${POPUP_SHELL_BORDER_CLASS} z-20`} />
        <div
          className={`flex flex-col items-start w-full relative rounded-[inherit] ${step === 4 ? "flex-1 overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}
        >
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
                  <div className="flex flex-col font-app justify-center leading-none relative shrink-0 txt-tone-primary txt-role-panel-title whitespace-nowrap">
                    <p className="txt-leading-title">
                      {editProjectId ? "Edit Project" : "Create a new Project"}
                    </p>
                  </div>
                  <WizardCloseButton
                    className="z-30"
                    onClick={handleCloseClick}
                  />
                </div>
              </div>
            </div>
          )}
          {(step === 2 || step === 3) && (
            <div className="absolute right-[25px] top-[25px] z-30">
              <WizardCloseButton onClick={handleCloseClick} />
            </div>
          )}
          {step === 3 && (
            <motion.div
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="px-[33px] pt-[29px] w-full"
            >
              <div className="flex flex-col font-app justify-center leading-none relative shrink-0 txt-tone-primary txt-role-panel-title whitespace-nowrap">
                <p className="txt-leading-title">{STEP_THREE_TITLE}</p>
              </div>
            </motion.div>
          )}
          <div
            className={`${step === 1 ? "p-[32px]" : step === 4 ? "flex-1 flex flex-col overflow-hidden" : "px-[33px] pb-[33px]"} w-full flex flex-col`}
          >
            {step === 1 && (
              <StepService
                selectedService={selectedService}
                onSelectService={setSelectedService}
              />
            )}
            {(step === 2 || step === 3) && (
              <StepDetails
                step={step as 2 | 3}
                selectedService={selectedService}
                projectName={projectName}
                onProjectNameChange={setProjectName}
                selectedJob={selectedJob}
                onSelectJob={setSelectedJob}
                description={description}
                onDescriptionChange={setDescription}
                isAIEnabled={isAIEnabled}
                onToggleAIEnabled={() => setIsAIEnabled((value) => !value)}
                deadline={deadline}
                onSelectDeadline={setDeadline}
                isCalendarOpen={isCalendarOpen}
                onCalendarOpenChange={setIsCalendarOpen}
                calendarRef={calendarRef}
                attachments={attachments}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                onRetryAttachment={handleRetryAttachment}
                onRemoveAttachment={handleRemoveAttachment}
              />
            )}
            {step === 4 && (
              <StepReview
                editProjectId={editProjectId}
                user={user}
                selectedService={selectedService}
                selectedJob={selectedJob}
                step2JobLabel={step2JobLabel}
                deadline={deadline}
                commentInput={commentInput}
                setCommentInput={setCommentInput}
                reviewComments={reviewComments}
                commentsEndRef={commentsEndRef}
                canDeleteReviewProject={canDeleteReviewProject}
                reviewDeleteDeniedReason={reviewDeleteDeniedReason}
                canRenderReviewApprovalAction={canRenderReviewApprovalAction}
                canApproveReviewProject={canApproveReviewProject}
                reviewApprovalDeniedReason={reviewApprovalDeniedReason}
                isApprovingReview={isApprovingReview}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onApproveReview={handleApproveReview}
                onClose={() => handleCancel()}
                onRequestDeleteProject={requestDeleteReviewProject}
              />
            )}
            {step !== 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="w-full flex items-center pt-[24px]"
              >
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="backdrop-blur-[6px] content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 border border-popup-border-soft hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col font-app font-medium justify-center leading-none relative shrink-0 txt-tone-primary txt-role-body-lg text-center whitespace-nowrap">
                      <p className="txt-leading-body">Previous</p>
                    </div>
                  </button>
                )}
                <div className="flex gap-[16px] ml-auto">
                  {editProjectId && (
                    <button
                      onClick={handleDeleteDraft}
                      className="content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-popup-danger-soft opacity-80 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col font-app font-medium justify-center leading-none relative shrink-0 txt-tone-danger txt-role-body-lg text-center whitespace-nowrap">
                        <p className="txt-leading-body">Delete draft</p>
                      </div>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={` content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 transition-all cursor-pointer ${isNextDisabled ? "bg-popup-primary-disabled cursor-not-allowed txt-tone-inverse" : "bg-text-tone-primary hover:bg-white txt-tone-inverse"} `}
                  >
                    <div className="flex flex-col font-app font-medium justify-center leading-none relative shrink-0 txt-role-body-lg text-center whitespace-nowrap">
                      <p className="txt-leading-body">
                        {step === 3
                          ? editProjectId
                            ? "Update & submit"
                            : "Review & submit"
                          : "Next"}
                      </p>
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
        setShowCloseConfirm={setShowCloseConfirm}
        handleConfirmCancel={handleConfirmCancel}
        handleConfirmSave={handleConfirmSave}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
        showDeleteProjectConfirm={showDeleteProjectConfirm}
        setShowDeleteProjectConfirm={setShowDeleteProjectConfirm}
        handleConfirmDeleteProject={handleConfirmDeleteProject}
      />
    </div>
  );
}
