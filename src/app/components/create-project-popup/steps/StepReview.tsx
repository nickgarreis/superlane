import type { Dispatch, RefObject, SetStateAction } from "react";
import { motion } from "motion/react";
import Loading03 from "../../../../imports/Loading03";
import {
  formatProjectDeadlineMedium,
  toUtcNoonEpochMsFromDateOnly,
} from "../../../lib/dates";
import type { ReviewComment } from "../../../types";
import { getReviewCommentAuthorDeniedReason } from "../../../lib/permissionRules";
import { ProjectLogo } from "../../ProjectLogo";
import { DeniedAction } from "../../permissions/DeniedAction";
import { WizardCloseButton } from "../WizardCloseButton";
type ReviewUser = { userId?: string; name: string; avatar: string };
type StepReviewProps = {
  editProjectId?: string | null;
  user?: ReviewUser;
  selectedService: string | null;
  selectedJob: string | null;
  step2JobLabel?: string;
  deadline: Date | undefined;
  commentInput: string;
  setCommentInput: Dispatch<SetStateAction<string>>;
  reviewComments: ReviewComment[];
  commentsEndRef: RefObject<HTMLDivElement>;
  canDeleteReviewProject: boolean;
  reviewDeleteDeniedReason: string | null;
  canRenderReviewApprovalAction: boolean;
  canApproveReviewProject: boolean;
  reviewApprovalDeniedReason: string | null;
  isApprovingReview: boolean;
  onAddComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onApproveReview: () => void;
  onClose: () => void;
  onRequestDeleteProject: () => void;
  showCloseButton?: boolean;
};
const NEXT_STEPS: ReadonlyArray<{ num: string; title: string; desc: string }> =
  [
    {
      num: "1",
      title: "Brief review",
      desc: "Your PM will review your project request within 48 hours, confirm the details, and follow up with any questions so we’re fully aligned.",
    },
    {
      num: "2",
      title: "Kickoff call",
      desc: "Our team may reach out if a kickoff call is needed to ensure the project’s success.",
    },
    {
      num: "3",
      title: "Scoping and estimates",
      desc: "We’ll prepare cost estimates for your approval before any work begins, ensuring everything’s clear and agreed upfront.",
    },
    {
      num: "4",
      title: "Project timeline",
      desc: "Your PM will share a proposed timeline based on your requested delivery date, so you’ll know exactly what’s happening and when.",
    },
  ];
export function StepReview({
  editProjectId,
  user,
  selectedService,
  selectedJob,
  step2JobLabel,
  deadline,
  commentInput,
  setCommentInput,
  reviewComments,
  commentsEndRef,
  canDeleteReviewProject,
  reviewDeleteDeniedReason,
  canRenderReviewApprovalAction,
  canApproveReviewProject,
  reviewApprovalDeniedReason,
  isApprovingReview,
  onAddComment,
  onDeleteComment,
  onApproveReview,
  onClose,
  onRequestDeleteProject,
  showCloseButton = true,
}: StepReviewProps) {
  return (
    <div className="flex flex-col w-full flex-1 overflow-hidden">
      <div
        className={`px-[33px] ${showCloseButton ? "pt-[29px]" : "pt-[8px]"} pb-[20px] shrink-0 relative`}
      >
        {showCloseButton && (
          <div className="absolute right-[25px] top-[25px] z-30">
            <WizardCloseButton onClick={onClose} />
          </div>
        )}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="size-[36px] rounded-full bg-review-loading-soft flex items-center justify-center shrink-0"
          >
            <Loading03 className="size-[18px] animate-spin [animation-duration:4s] [--stroke-0:var(--review-loading)]" />
          </motion.div>
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <h2 className="txt-role-panel-title txt-tone-primary txt-leading-title">
              {editProjectId ? "Project updated" : "Your Project is in Review"}
            </h2>
          </motion.div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-[33px]">
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="w-full rounded-[16px] bg-popup-surface-softer border border-popup-border-subtle p-[20px] mb-[28px]"
        >
          <div className="grid grid-cols-2 gap-y-[16px] gap-x-[24px]">
            <div className="flex flex-col gap-[4px]">
              <span className="txt-role-body-sm txt-tone-faint tracking-wide uppercase">
                Service
              </span>
              <div className="flex items-center gap-[6px]">
                {selectedService && (
                  <ProjectLogo size={14} category={selectedService} />
                )}
                <span className="txt-role-body-lg txt-tone-primary font-medium">
                  {selectedService || "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="txt-role-body-sm txt-tone-faint tracking-wide uppercase">
                {step2JobLabel || "Scope"}
              </span>
              <span className="txt-role-body-lg txt-tone-primary font-medium">
                {selectedJob || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="txt-role-body-sm txt-tone-faint tracking-wide uppercase">
                Created by
              </span>
              <div className="flex items-center gap-[6px]">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-[16px] rounded-full object-cover"
                  />
                )}
                <span className="txt-role-body-lg txt-tone-primary font-medium">
                  {user?.name || "Unknown"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-[4px]">
              <span className="txt-role-body-sm txt-tone-faint tracking-wide uppercase">
                Deadline
              </span>
              <span className="txt-role-body-lg txt-tone-primary font-medium">
                {formatProjectDeadlineMedium(
                  deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
                )}
              </span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="w-full mb-[28px]"
        >
          <p className="txt-role-body-lg txt-tone-subtle font-medium mb-[12px]">
            Add additional comments
          </p>
          <div className="flex items-start gap-[10px] mb-[16px]">
            <div className="shrink-0 pt-[3px]">
              <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-bg-avatar-fallback ring-1 ring-white/[0.06]">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user?.name || "You"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex-1 flex items-center gap-[8px]">
              <input
                type="text"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && commentInput.trim()) {
                    event.preventDefault();
                    onAddComment();
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-[14px] py-[7px] txt-role-body-md txt-tone-primary placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
              />
              <button
                onClick={onAddComment}
                disabled={!commentInput.trim()}
                className="shrink-0 size-[32px] rounded-full bg-text-tone-primary hover:bg-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-bg-surface)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
          {reviewComments.length > 0 && (
            <div className="flex flex-col">
              {reviewComments.map((comment) => (
                <div
                  key={comment.id}
                  className="group/comment flex items-start gap-[10px] py-[10px] px-[2px] rounded-xl"
                >
                  <div className="shrink-0 pt-[1px]">
                    <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-bg-avatar-fallback ring-1 ring-white/[0.06]">
                      {comment.author.avatar && (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[8px] mb-[2px]">
                      <span className="txt-role-body-md txt-tone-primary">
                        {comment.author.name}
                      </span>
                      <span className="txt-role-meta text-white/25 select-none">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="txt-role-body-md txt-tone-muted txt-leading-reading whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                  <DeniedAction
                    denied={
                      !(user?.userId && comment.author.userId === user.userId)
                    }
                    reason={getReviewCommentAuthorDeniedReason(
                      Boolean(
                        user?.userId && comment.author.userId === user.userId,
                      ),
                    )}
                    tooltipAlign="right"
                  >
                    <button
                      onClick={() => {
                        if (
                          !user?.userId ||
                          comment.author.userId !== user.userId
                        ) {
                          return;
                        }
                        onDeleteComment(comment.id);
                      }}
                      className={`shrink-0 mt-[2px] opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150 p-[5px] rounded-md ${user?.userId && comment.author.userId === user.userId ? "hover:bg-white/[0.06] cursor-pointer" : "cursor-not-allowed"}`}
                      title="Delete comment"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          user?.userId && comment.author.userId === user.userId
                            ? "var(--popup-icon-stroke-active)"
                            : "var(--popup-icon-stroke-muted)"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </DeniedAction>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="w-full mb-[8px]"
        >
          <p className="txt-role-body-lg txt-tone-subtle font-medium mb-[20px]">
            Here&#39;s what happens next:
          </p>
          <div className="flex flex-col relative">
            <div className="absolute left-[11px] top-[24px] bottom-[24px] w-px bg-popup-border-subtle" />
            {NEXT_STEPS.map((item, idx) => (
              <motion.div
                key={item.num}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                className={`flex gap-[12px] ${idx < NEXT_STEPS.length - 1 ? "pb-[20px]" : ""}`}
              >
                <div className="size-[22px] rounded-full bg-popup-border-subtle flex items-center justify-center shrink-0 z-10">
                  <span className="txt-role-meta txt-tone-subtle font-medium">
                    {item.num}
                  </span>
                </div>
                <div className="flex flex-col gap-[2px] pt-[1px]">
                  <span className="txt-role-body-md txt-tone-primary font-medium txt-leading-body">
                    {item.title}
                  </span>
                  <span className="txt-role-body-md txt-tone-faint txt-leading-caption">
                    {item.desc}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div ref={commentsEndRef} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.3 }}
        className="shrink-0 px-[33px] py-[20px] border-t border-popup-border-subtle flex justify-between items-center"
      >
        <DeniedAction
          denied={!canDeleteReviewProject}
          reason={reviewDeleteDeniedReason}
          tooltipAlign="left"
        >
          <button
            onClick={onRequestDeleteProject}
            className={`content-stretch flex h-[36px] items-center justify-center px-[17px] py-[7px] relative rounded-full shrink-0 bg-popup-danger-soft transition-all ${canDeleteReviewProject ? "opacity-80 hover:opacity-100 cursor-pointer" : "opacity-45 cursor-not-allowed"}`}
          >
            <div className="flex flex-col font-app font-medium justify-center leading-none relative shrink-0 txt-tone-danger txt-role-body-lg text-center whitespace-nowrap">
              <p className="txt-leading-body">Delete project</p>
            </div>
          </button>
        </DeniedAction>
        <div className="flex items-center gap-[10px]">
          {canRenderReviewApprovalAction && (
            <DeniedAction
              denied={!canApproveReviewProject}
              reason={reviewApprovalDeniedReason}
              tooltipAlign="right"
            >
              <button
                onClick={onApproveReview}
                disabled={isApprovingReview}
                className={`h-[36px] px-[20px] txt-tone-inverse rounded-full txt-role-body-lg font-medium transition-all ${canApproveReviewProject ? "bg-text-tone-primary hover:bg-white disabled:bg-popup-primary-disabled disabled:txt-tone-inverse disabled:cursor-not-allowed cursor-pointer" : "bg-popup-primary-disabled-45 txt-tone-inverse cursor-not-allowed"}`}
              >
                {isApprovingReview ? "Approving..." : "Approve"}
              </button>
            </DeniedAction>
          )}
          <button
            onClick={onClose}
            className={`h-[36px] px-[20px] rounded-full txt-role-body-lg font-medium transition-all cursor-pointer ${canRenderReviewApprovalAction ? "border border-popup-border-stronger txt-tone-primary hover:bg-white/5" : "bg-text-tone-primary hover:bg-white txt-tone-inverse"}`}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
