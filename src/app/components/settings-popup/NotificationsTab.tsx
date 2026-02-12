import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { reportUiError } from "../../lib/errors";
import type { NotificationSettingsData } from "./types";
type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
};
function ToggleRow({ label, description, checked, onToggle }: ToggleRowProps) {
  const labelId = useId();
  return (
    <div className="flex items-start justify-between py-5 border-b border-border-subtle-soft last:border-0 group">
      <div className="flex flex-col gap-1 pr-8">
        <span
          id={labelId}
          className="txt-role-body-lg font-medium txt-tone-secondary group-hover:txt-tone-primary transition-colors"
        >
          {label}
        </span>
        <span className="txt-role-body-md txt-tone-subtle">{description}</span>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className={cn(
          "w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 cursor-pointer",
          checked ? "bg-toggle-on" : "bg-surface-active-soft",
        )}
      >
        <motion.div
          className={cn(
            "absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm transition-all",
            checked ? "bg-white left-[22px]" : "bg-text-tone-primary left-[2px]",
          )}
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </button>
    </div>
  );
}
type NotificationsTabProps = {
  data: NotificationSettingsData;
  onSave: (payload: NotificationSettingsData) => Promise<void>;
};
export function NotificationsTab({ data, onSave }: NotificationsTabProps) {
  const [state, setState] = useState<NotificationSettingsData>(data);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "pending" | "saving" | "saved"
  >("idle");
  const hasEditedRef = useRef(false);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRunIdRef = useRef(0);
  useEffect(
    () => () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (statusResetRef.current) {
        clearTimeout(statusResetRef.current);
      }
    },
    [],
  );
  const isSyncedWithSource =
    state.events.eventNotifications === data.events.eventNotifications &&
    state.events.teamActivities === data.events.teamActivities &&
    state.events.productUpdates === data.events.productUpdates;
  useEffect(() => {
    if (hasEditedRef.current) {
      return;
    }
    saveRunIdRef.current += 1;
    setAutoSaveStatus("idle");
    setState({
      events: {
        eventNotifications: data.events.eventNotifications,
        teamActivities: data.events.teamActivities,
        productUpdates: data.events.productUpdates,
      },
    });
  }, [
    data.events.eventNotifications,
    data.events.productUpdates,
    data.events.teamActivities,
  ]);
  useEffect(() => {
    if (!hasEditedRef.current) {
      return;
    }
    if (isSyncedWithSource) {
      hasEditedRef.current = false;
      setAutoSaveStatus("idle");
      return;
    }
    setAutoSaveStatus("pending");
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }
    const runId = saveRunIdRef.current + 1;
    saveRunIdRef.current = runId;
    saveDebounceRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      void (async () => {
        try {
          await onSave(state);
          if (runId !== saveRunIdRef.current) {
            return;
          }
          hasEditedRef.current = false;
          setAutoSaveStatus("saved");
          if (statusResetRef.current) {
            clearTimeout(statusResetRef.current);
          }
          statusResetRef.current = setTimeout(() => {
            if (runId === saveRunIdRef.current) {
              setAutoSaveStatus("idle");
            }
          }, 1500);
        } catch (error) {
          if (runId !== saveRunIdRef.current) {
            return;
          }
          reportUiError("settings.notifications.save", error, {
            showToast: false,
          });
          toast.error("Failed to update notification preferences");
          setAutoSaveStatus("pending");
        }
      })();
    }, 700);
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
    };
  }, [isSyncedWithSource, onSave, state]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col rounded-xl">
        <ToggleRow
          label="Event Notifications"
          description="Receive project submitted, review approved, and completed notifications."
          checked={state.events.eventNotifications}
          onToggle={() => {
            hasEditedRef.current = true;
            setState((current) => ({
              ...current,
              events: {
                ...current.events,
                eventNotifications: !current.events.eventNotifications,
              },
            }));
          }}
        />
        <ToggleRow
          label="Team Activities"
          description="Receive notifications for new comments and replies."
          checked={state.events.teamActivities}
          onToggle={() => {
            hasEditedRef.current = true;
            setState((current) => ({
              ...current,
              events: {
                ...current.events,
                teamActivities: !current.events.teamActivities,
              },
            }));
          }}
        />
        <ToggleRow
          label="Product Updates"
          description="Receive announcements and product change notifications."
          checked={state.events.productUpdates}
          onToggle={() => {
            hasEditedRef.current = true;
            setState((current) => ({
              ...current,
              events: {
                ...current.events,
                productUpdates: !current.events.productUpdates,
              },
            }));
          }}
        />
      </div>
      <div className="pt-2 flex justify-end min-h-6">
        {autoSaveStatus !== "idle" && (
          <span className="txt-role-body-sm txt-tone-faint">
            {autoSaveStatus === "pending" && "Changes pending..."}
            {autoSaveStatus === "saving" && "Auto-saving..."}
            {autoSaveStatus === "saved" && "Saved"}
          </span>
        )}
      </div>
    </div>
  );
}
