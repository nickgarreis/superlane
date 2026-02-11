import React from "react";
import { MentionTextarea } from "../MentionTextarea";
import type { MentionItem as MentionItemType } from "../mentions/types";
type EditComposerProps = {
  commentId: string;
  editValue: string;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  onSetEditValue: (value: string) => void;
  onSetEditingComment: (id: string | null) => void;
  onEditComment: (commentId: string) => void;
};
export function EditCommentComposer({
  commentId,
  editValue,
  mentionItems,
  onMentionClick,
  onSetEditValue,
  onSetEditingComment,
  onEditComment,
}: EditComposerProps) {
  return (
    <div className="mt-1">
      <MentionTextarea
        autoFocus
        value={editValue}
        onChange={onSetEditValue}
        items={mentionItems}
        onMentionClick={onMentionClick}
        className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 txt-role-body-md txt-tone-primary focus:outline-none focus:border-white/20 leading-relaxed transition-colors"
        style={{ minHeight: 36, maxHeight: 160 }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onEditComment(commentId);
          }
          if (event.key === "Escape") {
            onSetEditingComment(null);
            onSetEditValue("");
          }
        }}
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          onClick={() => onEditComment(commentId)}
          disabled={!editValue.trim()}
          className="px-2.5 py-1 txt-role-meta bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={() => {
            onSetEditingComment(null);
            onSetEditValue("");
          }}
          className="px-2.5 py-1 txt-role-meta text-white/40 hover:text-white/60 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <span className="txt-role-kbd text-white/15 ml-auto">
          ⌘Enter to save · @ to mention
        </span>
      </div>
    </div>
  );
}
type ReplyComposerProps = {
  commentId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  replyValue: string;
  onSetReplyingTo: (id: string | null) => void;
  onSetReplyValue: (value: string) => void;
  onReply: (parentId: string, e?: React.FormEvent) => void;
};
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
export function ReplyCommentComposer({
  commentId,
  currentUserName,
  currentUserAvatar,
  mentionItems,
  onMentionClick,
  replyValue,
  onSetReplyingTo,
  onSetReplyValue,
  onReply,
}: ReplyComposerProps) {
  return (
    <form
      onSubmit={(event) => onReply(commentId, event)}
      className="mt-3 flex items-start gap-2"
    >
      <div className="shrink-0 pt-0.5">
        <div className="w-5 h-5 rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
          {currentUserAvatar ? (
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center txt-role-micro font-medium text-white/80">
              {getInitials(currentUserName)}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <MentionTextarea
          autoFocus
          value={replyValue}
          onChange={onSetReplyValue}
          items={mentionItems}
          placeholder=""
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 txt-role-body-md txt-tone-primary placeholder:text-white/20 focus:outline-none focus:border-white/15 leading-relaxed transition-colors"
          style={{ minHeight: 32, maxHeight: 140 }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              onReply(commentId);
            }
            if (event.key === "Escape") {
              onSetReplyingTo(null);
              onSetReplyValue("");
            }
          }}
          onMentionClick={onMentionClick}
        />
        <div className="flex items-center gap-2 mt-1.5">
          <button
            type="submit"
            disabled={!replyValue.trim()}
            className="px-2.5 py-1 txt-role-meta bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Reply
          </button>
          <button
            type="button"
            onClick={() => {
              onSetReplyingTo(null);
              onSetReplyValue("");
            }}
            className="txt-role-meta text-white/30 hover:text-white/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <span className="txt-role-kbd text-white/15 ml-auto">⌘Enter</span>
        </div>
      </div>
    </form>
  );
}
