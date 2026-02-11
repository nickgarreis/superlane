import { useEffect, useState } from "react";
export function useChatSidebarState(activeProjectId: string) {
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(
    new Set(),
  );
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showResolvedThreads, setShowResolvedThreads] = useState(false);
  const [activeReactionPicker, setActiveReactionPicker] = useState<
    string | null
  >(null);
  const [activeMoreMenu, setActiveMoreMenu] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  useEffect(() => {
    setInputValue("");
    setReplyingTo(null);
    setReplyValue("");
    setIsDropdownOpen(false);
    setEditingComment(null);
    setEditValue("");
    setShowResolvedThreads(false);
    setCollapsedThreads(new Set());
    setActiveReactionPicker(null);
    setActiveMoreMenu(null);
  }, [activeProjectId]);
  return {
    inputValue,
    setInputValue,
    replyingTo,
    setReplyingTo,
    replyValue,
    setReplyValue,
    isDropdownOpen,
    setIsDropdownOpen,
    collapsedThreads,
    setCollapsedThreads,
    editingComment,
    setEditingComment,
    editValue,
    setEditValue,
    showResolvedThreads,
    setShowResolvedThreads,
    activeReactionPicker,
    setActiveReactionPicker,
    activeMoreMenu,
    setActiveMoreMenu,
    inputFocused,
    setInputFocused,
  };
}
