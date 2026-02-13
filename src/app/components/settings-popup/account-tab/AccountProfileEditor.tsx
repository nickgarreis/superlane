import React from "react";
import { User } from "lucide-react";
import { UNDERLINE_INPUT_CLASS } from "../../ui/controlChrome";

type AccountProfileEditorProps = {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  avatarBusy: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAvatarFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
};

export function AccountProfileEditor({
  firstName,
  lastName,
  avatarUrl,
  avatarBusy,
  fileInputRef,
  onAvatarFile,
  onAvatarKeyDown,
  onFirstNameChange,
  onLastNameChange,
}: AccountProfileEditorProps) {
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        onChange={onAvatarFile}
      />
      <div className="flex items-start gap-5">
        <div
          className="size-[88px] rounded-full overflow-hidden border border-border-soft shrink-0 group relative bg-bg-muted-surface"
          onClick={() => {
            if (!avatarBusy) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={onAvatarKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Change avatar"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
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
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
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
                onChange={(event) => {
                  onFirstNameChange(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
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
                onChange={(event) => {
                  onLastNameChange(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
