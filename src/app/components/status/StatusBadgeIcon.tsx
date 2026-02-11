import { type LucideIcon, Archive, CheckCircle2, CircleDashed, Eye, PlayCircle } from "lucide-react";
import type { ProjectStatus } from "../../types";

const STATUS_ICON_BY_LABEL: Record<ProjectStatus, LucideIcon> = {
  Draft: CircleDashed,
  Review: Eye,
  Active: PlayCircle,
  Completed: CheckCircle2,
};

type StatusBadgeIconProps = {
  statusLabel: string;
  archived?: boolean;
  className?: string;
  color?: string;
  strokeWidth?: number;
};

export function StatusBadgeIcon({
  statusLabel,
  archived = false,
  className,
  color,
  strokeWidth = 2,
}: StatusBadgeIconProps) {
  const Icon = archived
    ? Archive
    : STATUS_ICON_BY_LABEL[statusLabel as ProjectStatus] ?? CircleDashed;

  return <Icon className={className} color={color} strokeWidth={strokeWidth} aria-hidden="true" />;
}
