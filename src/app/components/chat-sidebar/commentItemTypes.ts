import type { CSSProperties, FormEvent } from "react";
import type { CollaborationComment } from "../../types";
import type { MentionItem as MentionItemType } from "../mentions/types";

export interface CommentItemViewProps {
  comment: CollaborationComment;
  currentUserId: string | null;
  currentUserName: string;
  currentUserAvatar?: string;
  isTopLevel?: boolean;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  performanceStyle?: CSSProperties;
}

export interface CommentItemInteractionStateProps {
  replyingTo: string | null;
  editingComment: string | null;
  editValue: string;
  activeReactionPicker: string | null;
  activeMoreMenu: string | null;
  collapsedThreads: Set<string>;
  replyValue: string;
}

export interface CommentItemInteractionHandlerProps {
  onSetReplyingTo: (id: string | null) => void;
  onSetReplyValue: (val: string) => void;
  onSetEditingComment: (id: string | null) => void;
  onSetEditValue: (val: string) => void;
  onSetActiveReactionPicker: (id: string | null) => void;
  onSetActiveMoreMenu: (id: string | null) => void;
  onReply: (parentId: string, e?: FormEvent) => void;
  onEditComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
  onToggleThread: (id: string) => void;
}

export type CommentItemProps =
  CommentItemViewProps
  & CommentItemInteractionStateProps
  & CommentItemInteractionHandlerProps;
