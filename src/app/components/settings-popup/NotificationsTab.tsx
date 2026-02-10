import { useEffect, useId, useState } from "react";
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
    <div className="flex items-start justify-between py-5 border-b border-white/5 last:border-0 group">
      <div className="flex flex-col gap-1 pr-8">
        <span id={labelId} className="text-[14px] font-medium text-[#E8E8E8]/90 group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="text-[13px] text-[#E8E8E8]/50">{description}</span>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        className={cn(
          "w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 cursor-pointer",
          checked ? "bg-[#10b981]" : "bg-white/10",
        )}
      >
        <motion.div
          className={cn(
            "absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm transition-all",
            checked ? "bg-white left-[22px]" : "bg-[#E8E8E8] left-[2px]",
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setState(data);
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(state);
      toast.success("Notification preferences updated");
    } catch (error) {
      reportUiError("settings.notifications.save", error, { showToast: false });
      toast.error("Failed to update notification preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col rounded-xl">
        <ToggleRow
          label="Event Notifications"
          description="Receive project submitted, review approved, and completed notifications."
          checked={state.events.eventNotifications}
          onToggle={() => setState((current) => ({
            ...current,
            events: {
              ...current.events,
              eventNotifications: !current.events.eventNotifications,
            },
          }))}
        />
        <ToggleRow
          label="Team Activities"
          description="Receive notifications for new comments and replies."
          checked={state.events.teamActivities}
          onToggle={() => setState((current) => ({
            ...current,
            events: {
              ...current.events,
              teamActivities: !current.events.teamActivities,
            },
          }))}
        />
        <ToggleRow
          label="Product Updates"
          description="Receive announcements and product change notifications."
          checked={state.events.productUpdates}
          onToggle={() => setState((current) => ({
            ...current,
            events: { ...current.events, productUpdates: !current.events.productUpdates },
          }))}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer px-6 py-2.5 bg-[#E8E8E8] hover:bg-white text-bg-base rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-white/5 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
