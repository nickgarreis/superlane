import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { reportUiError } from "../../lib/errors";
import type { AccountSettingsData } from "./types";
type AccountTabProps = {
  data: AccountSettingsData;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
};
export function AccountTab({
  data,
  onSave,
  onUploadAvatar,
  onRemoveAvatar,
}: AccountTabProps) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [email, setEmail] = useState(data.email);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);
  }, [data.firstName, data.lastName, data.email]);
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ firstName, lastName, email });
      toast.success("Account updated");
    } catch (error) {
      reportUiError("settings.account.save", error, { showToast: false });
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };
  const handleAvatarFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarBusy(true);
    try {
      await onUploadAvatar(file);
      toast.success("Profile picture updated");
    } catch (error) {
      reportUiError("settings.account.uploadAvatar", error, {
        showToast: false,
      });
      toast.error("Failed to update profile picture");
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleRemoveAvatar = async () => {
    setAvatarBusy(true);
    try {
      await onRemoveAvatar();
      toast.success("Profile picture removed");
    } catch (error) {
      reportUiError("settings.account.removeAvatar", error, {
        showToast: false,
      });
      toast.error("Failed to remove profile picture");
    } finally {
      setAvatarBusy(false);
    }
  };
  const handleAvatarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-6 pb-8 border-b border-white/5">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleAvatarFile}
        />
        <div
          className="w-[100px] h-[100px] rounded-full overflow-hidden border border-white/10 shrink-0 group relative cursor-pointer bg-bg-muted-surface"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={handleAvatarKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Change avatar"
        >
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center txt-tone-faint">
              <User size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="txt-role-body-sm font-medium text-white">
              Change
            </span>
          </div>
        </div>
        <div className="flex flex-col pt-2 gap-3">
          <h3 className="txt-role-body-xl font-medium txt-tone-primary">
            Profile Picture
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              className="cursor-pointer px-4 py-2 bg-text-tone-primary text-bg-base rounded-full txt-role-body-md font-medium hover:bg-white transition-colors disabled:opacity-60"
            >
              Upload new
            </button>
            <button
              onClick={handleRemoveAvatar}
              disabled={!data.avatarUrl || avatarBusy}
              className="cursor-pointer px-4 py-2 bg-white/5 txt-tone-primary border border-white/10 rounded-full txt-role-body-md font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
          <p className="txt-role-body-md txt-tone-faint max-w-[320px]">
            JPG, PNG or GIF. Max file size 2MB.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="firstName-input"
              className="txt-role-body-md font-medium txt-tone-secondary"
            >
              First Name
            </label>
            <input
              id="firstName-input"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 txt-role-body-lg txt-tone-primary focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="lastName-input"
              className="txt-role-body-md font-medium txt-tone-secondary"
            >
              Last Name
            </label>
            <input
              id="lastName-input"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 txt-role-body-lg txt-tone-primary focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email-input"
            className="txt-role-body-md font-medium txt-tone-secondary"
          >
            Email Address
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 txt-role-body-lg txt-tone-primary focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
          />
        </div>
      </div>
      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer px-6 py-2.5 bg-text-tone-primary hover:bg-white text-bg-base rounded-full txt-role-body-lg font-medium transition-colors shadow-lg shadow-white/5 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
