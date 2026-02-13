import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { ProjectLogo } from "../ProjectLogo";
import { MenuIcon } from "./MenuIcon";
import type {
  MainContentNavigationActions,
  MainContentProjectActions,
} from "../../dashboard/types";
import type { ProjectData, ViewerIdentity } from "../../types";
import { formatProjectDeadlineShort } from "../../lib/dates";
import { StatusBadgeIcon } from "../status/StatusBadgeIcon";

const PROJECT_NAME_MAX_LENGTH = 36;
const PROJECT_DESCRIPTION_MAX_LENGTH = 400;

const normalizeInlineText = (value: string): string =>
  value.replace(/\u00A0/g, " ").replace(/[\r\n]+/g, " ");

const clampInlineText = (value: string, maxLength: number): string =>
  normalizeInlineText(value).slice(0, maxLength);

const getSelectionTextLength = (element: HTMLElement): number => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return 0;
  }

  const range = selection.getRangeAt(0);
  if (
    !element.contains(range.startContainer) ||
    !element.contains(range.endContainer)
  ) {
    return 0;
  }

  return range.toString().length;
};

const moveCaretToEnd = (element: HTMLElement): void => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

const insertTextAtSelection = (element: HTMLElement, text: string): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  if (
    !element.contains(range.startContainer) ||
    !element.contains(range.endContainer)
  ) {
    return;
  }

  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

type InlineEditableTextProps = {
  value: string;
  maxLength: number;
  editable: boolean;
  onCommit: (nextValue: string) => void;
  className: string;
  element: "h1" | "p";
  ariaLabel: string;
};

function InlineEditableText({
  value,
  maxLength,
  editable,
  onCommit,
  className,
  element,
  ariaLabel,
}: InlineEditableTextProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const pendingValueRef = useRef<string | null>(null);
  const lastCommittedValueRef = useRef(clampInlineText(value, maxLength));
  const initialValueRef = useRef(clampInlineText(value, maxLength));

  const syncRenderedText = useCallback((nextValue: string) => {
    if (!elementRef.current) {
      return;
    }
    if ((elementRef.current.textContent ?? "") !== nextValue) {
      elementRef.current.textContent = nextValue;
    }
  }, []);

  useLayoutEffect(() => {
    const nextValue = clampInlineText(value, maxLength);
    if (pendingValueRef.current !== null) {
      if (pendingValueRef.current === nextValue) {
        pendingValueRef.current = null;
      } else if (!isEditing) {
        return;
      }
    }

    if (isEditing) {
      return;
    }

    syncRenderedText(nextValue);

    if (pendingValueRef.current === null) {
      lastCommittedValueRef.current = nextValue;
      initialValueRef.current = nextValue;
    }
  }, [isEditing, maxLength, syncRenderedText, value]);

  const commitImmediate = useCallback(
    (nextValue: string) => {
      pendingValueRef.current = nextValue;
      if (nextValue === lastCommittedValueRef.current) {
        return;
      }
      lastCommittedValueRef.current = nextValue;
      onCommit(nextValue);
    },
    [onCommit],
  );

  const handleBeforeInput = useCallback(
    (event: React.FormEvent<HTMLElement>) => {
      if (!editable) {
        return;
      }

      const nativeEvent = event.nativeEvent as InputEvent;
      if (
        nativeEvent.inputType === "insertParagraph" ||
        nativeEvent.inputType === "insertLineBreak"
      ) {
        event.preventDefault();
        return;
      }

      if (!nativeEvent.inputType.startsWith("insert")) {
        return;
      }

      const insertedLength = nativeEvent.data?.length ?? 0;
      if (insertedLength === 0) {
        return;
      }

      const currentValue = clampInlineText(
        event.currentTarget.textContent ?? "",
        maxLength,
      );
      const selectedTextLength = getSelectionTextLength(event.currentTarget);
      const nextLength =
        currentValue.length - selectedTextLength + insertedLength;

      if (nextLength > maxLength) {
        event.preventDefault();
      }
    },
    [editable, maxLength],
  );

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLElement>) => {
      if (!editable) {
        return;
      }

      const nextValue = clampInlineText(
        event.currentTarget.textContent ?? "",
        maxLength,
      );
      if ((event.currentTarget.textContent ?? "") !== nextValue) {
        event.currentTarget.textContent = nextValue;
        moveCaretToEnd(event.currentTarget);
      }

      commitImmediate(nextValue);
    },
    [commitImmediate, editable, maxLength],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLElement>) => {
      if (!editable) {
        return;
      }

      event.preventDefault();
      const pastedText = normalizeInlineText(
        event.clipboardData.getData("text/plain"),
      );
      if (pastedText.length === 0) {
        return;
      }

      const currentValue = clampInlineText(
        event.currentTarget.textContent ?? "",
        maxLength,
      );
      const selectedTextLength = getSelectionTextLength(event.currentTarget);
      const availableLength =
        maxLength - (currentValue.length - selectedTextLength);
      if (availableLength <= 0) {
        return;
      }

      insertTextAtSelection(event.currentTarget, pastedText.slice(0, availableLength));
      const clampedValue = clampInlineText(
        event.currentTarget.textContent ?? "",
        maxLength,
      );
      if ((event.currentTarget.textContent ?? "") !== clampedValue) {
        event.currentTarget.textContent = clampedValue;
        moveCaretToEnd(event.currentTarget);
      }

      commitImmediate(clampedValue);
    },
    [commitImmediate, editable, maxLength],
  );

  const handleBlur = useCallback(() => {
    if (!editable) {
      return;
    }

    setIsEditing(false);
  }, [editable]);

  const setElementRef = useCallback(
    (node: HTMLElement | null) => {
      elementRef.current = node;
      if (node) {
        syncRenderedText(initialValueRef.current);
      }
    },
    [syncRenderedText],
  );

  const commonProps = {
    ref: setElementRef,
    className,
    contentEditable: editable,
    suppressContentEditableWarning: true,
    spellCheck: false,
    "aria-label": ariaLabel,
    role: editable ? "textbox" : undefined,
    "aria-multiline": element === "p" ? true : false,
    onFocus: editable ? () => setIsEditing(true) : undefined,
    onBlur: editable ? handleBlur : undefined,
    onBeforeInput: editable ? handleBeforeInput : undefined,
    onInput: editable ? handleInput : undefined,
    onPaste: editable ? handlePaste : undefined,
    onKeyDown: editable
      ? (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }
      : undefined,
  } as const;

  if (element === "h1") {
    return <h1 {...commonProps} />;
  }
  return <p {...commonProps} />;
}

type ProjectOverviewProps = {
  isMobile?: boolean;
  project: ProjectData;
  viewerIdentity: ViewerIdentity;
  projectActions: MainContentProjectActions;
  navigationActions?: MainContentNavigationActions;
};
export function ProjectOverview({
  isMobile = false,
  project,
  viewerIdentity,
  projectActions,
  navigationActions,
}: ProjectOverviewProps) {
  const canInlineEditText =
    !project.archived && project.status.label === "Active";
  const backToLabel = navigationActions?.backLabel
    ? navigationActions.backLabel
    : navigationActions?.backTo
      ? `${navigationActions.backTo.charAt(0).toUpperCase()}${navigationActions.backTo.slice(1)}`
      : "Archive";
  const statusColor = project.archived
    ? "var(--file-type-default)"
    : (project.status.color ?? "var(--status-draft)");
  return (
    <>
      {navigationActions?.back && (
        <button
          onClick={navigationActions.back}
          className="flex items-center gap-2 txt-role-body-md text-white/50 hover:text-white/80 transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to {backToLabel}</span>
        </button>
      )}
      <div className="flex w-full min-w-0 gap-4 md:gap-6 mb-8 md:mb-10 items-start md:items-center">
        <ProjectLogo size={isMobile ? 92 : 140} category={project.category} />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex min-w-0 items-start md:items-center gap-4 md:gap-5 w-full">
            <InlineEditableText
              value={project.name}
              maxLength={PROJECT_NAME_MAX_LENGTH}
              editable={canInlineEditText}
              onCommit={(nextName) =>
                projectActions.updateProject?.({ name: nextName })
              }
              className="w-full min-w-0 break-words txt-role-screen-title txt-tone-primary txt-leading-hero focus:outline-none [overflow-wrap:anywhere]"
              element="h1"
              ariaLabel="Project name"
            />
            <MenuIcon
              isArchived={project.archived}
              isCompleted={project.status.label === "Completed"}
              viewerRole={viewerIdentity.role}
              onArchive={() => projectActions.archive?.(project.id)}
              onUnarchive={() => projectActions.unarchive?.(project.id)}
              onDelete={() => projectActions.remove?.(project.id)}
              onComplete={() =>
                projectActions.updateStatus?.(project.id, "Completed")
              }
              onUncomplete={() =>
                projectActions.updateStatus?.(project.id, "Active")
              }
            />
          </div>
          <div className="w-full min-w-0 max-w-[672px]">
            <InlineEditableText
              value={project.description}
              maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
              editable={canInlineEditText}
              onCommit={(nextDescription) =>
                projectActions.updateProject?.({ description: nextDescription })
              }
              className="w-full min-w-0 break-words txt-role-body-lg txt-tone-subtle font-normal txt-leading-title focus:outline-none [overflow-wrap:anywhere]"
              element="p"
              ariaLabel="Project description"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-5 pt-[24px] pb-[32px] md:pb-[55px] w-full border-t border-[rgba(232,232,232,0.05)] pr-[0px] pl-[0px]">
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Created by
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
              {project.creator.avatar ? (
                <img
                  src={project.creator.avatar}
                  alt={project.creator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center txt-role-micro font-medium text-white/80">
                  {project.creator.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <span className="txt-role-body-lg font-medium txt-tone-primary">
              {project.creator.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 relative z-20">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Status
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-[6px] relative shrink-0 px-0 py-[4px] rounded-full self-start select-none",
            )}
          >
            <StatusBadgeIcon
              statusLabel={project.status.label}
              archived={project.archived}
              className="size-4 shrink-0"
              color={statusColor}
            />
            <span
              className="txt-role-body-md txt-leading-body font-medium"
              style={{ color: statusColor }}
            >
              {project.archived ? "Archived" : project.status.label}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Service
          </div>
          <div className="txt-role-body-lg font-medium txt-tone-primary">
            {project.category}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Scope
          </div>
          <div className="txt-role-body-lg font-medium txt-tone-primary">
            {project.scope || project.category}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
            Deadline
          </div>
          <div className="txt-role-body-lg font-medium txt-tone-primary">
            {formatProjectDeadlineShort(project.deadlineEpochMs) || "Not set"}
          </div>
        </div>
        {project.completedAt && (
          <div className="flex flex-col gap-1.5">
            <div className="txt-role-body-sm font-medium text-white/40 uppercase tracking-wide">
              Completed on
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 txt-tone-success" />
              <span className="txt-role-body-lg font-medium txt-tone-success">
                {new Date(project.completedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
