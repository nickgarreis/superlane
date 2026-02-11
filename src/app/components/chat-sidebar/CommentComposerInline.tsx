import React from "react";
import { MentionTextarea } from "../MentionTextarea";
import type { MentionItem as MentionItemType } from "../mentions/types";
import {
  PRIMARY_ACTION_BUTTON_CLASS,
  SECONDARY_ACTION_BUTTON_CLASS,
  SOFT_INPUT_CLASS,
} from "../ui/controlChrome";
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
        className={`w-full rounded-lg p-2.5 txt-role-body-md leading-relaxed ${SOFT_INPUT_CLASS}`}
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
          className={`px-2.5 py-1 txt-role-meta rounded-md cursor-pointer ${PRIMARY_ACTION_BUTTON_CLASS}`}
        >
          Save
        </button>
        <button
          onClick={() => {
            onSetEditingComment(null);
            onSetEditValue("");
          }}
          className={`px-2.5 py-1 txt-role-meta cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
        >
          Cancel
        </button>
        <span className="txt-role-kbd text-text-muted-weak ml-auto">
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
        <div className="w-5 h-5 rounded-full overflow-hidden bg-bg-avatar-fallback ring-1 ring-border-soft">
          {currentUserAvatar ? (
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-active-soft flex items-center justify-center txt-role-micro font-medium txt-tone-primary">
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
          className={`w-full rounded-lg px-3 py-2 txt-role-body-md leading-relaxed ${SOFT_INPUT_CLASS}`}
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
            className={`px-2.5 py-1 txt-role-meta rounded-md cursor-pointer ${PRIMARY_ACTION_BUTTON_CLASS}`}
          >
            Reply
          </button>
          <button
            type="button"
            onClick={() => {
              onSetReplyingTo(null);
              onSetReplyValue("");
            }}
            className={`px-2.5 py-1 txt-role-meta rounded-md cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
          >
            Cancel
          </button>
          <span className="txt-role-kbd text-text-muted-weak ml-auto">⌘Enter</span>
        </div>
      </div>
    </form>
  );
}
