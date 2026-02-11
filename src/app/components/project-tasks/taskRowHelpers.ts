import type { Task, WorkspaceMember } from "../../types";

export const getAssigneeInitials = (name: string) => {
  const normalizedName = String(name ?? "").trim();
  const parts = normalizedName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    const firstTwoChars = parts[0].slice(0, 2).toUpperCase();
    return firstTwoChars || "?";
  }

  const initials = parts
    .slice(0, 2)
    .map((entry) => entry.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "?";
};

export const resolveSelectedAssigneeUserId = (
  task: Task,
  assignableMembers: WorkspaceMember[],
) => task.assignee.userId
  ?? assignableMembers.find(
    (member) =>
      member.name === task.assignee.name
      && (member.avatarUrl || "") === (task.assignee.avatar || ""),
  )?.userId;
