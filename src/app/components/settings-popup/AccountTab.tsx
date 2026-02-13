import React, { useEffect, useState } from "react";
import {
  Apple,
  BadgeCheck,
  Blocks,
  Building2,
  CircleDashed,
  CircleUserRound,
  Cloud,
  Compass,
  Github,
  Gitlab,
  KeyRound,
  Library,
  Linkedin,
  MessageCircle,
  ShieldCheck,
  Slack,
  SquareM,
  User,
  Waypoints,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import googleSocialLogo from "../../../../google logo.svg";
import { reportUiError } from "../../lib/errors";
import { UNDERLINE_INPUT_CLASS } from "../ui/controlChrome";
import type { AccountSettingsData } from "./types";

const PASSWORD_PLACEHOLDER = "••••••••••";

const formatAuthMethodLabel = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
) => {
  if (!authenticationMethod) {
    return "External provider";
  }
  if (authenticationMethod === "SSO") {
    return "Single Sign-On";
  }
  if (authenticationMethod.endsWith("OAuth")) {
    return "OAuth";
  }
  if (authenticationMethod === "Passkey") {
    return "Passkey";
  }
  if (authenticationMethod === "MagicAuth") {
    return "Magic link";
  }
  return "External auth";
};

const formatAuthMethodCode = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
) => {
  if (!authenticationMethod) {
    return "ExternalAuth";
  }
  return authenticationMethod;
};

const AUTH_MODE_ROW_CLASS = "flex flex-wrap items-start gap-3";

const GoogleAuthIcon = ({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <img
    src={googleSocialLogo}
    alt="Google"
    width={size}
    height={size}
    className={className}
  />
);

const resolveAuthMethodIcon = (
  authenticationMethod: AccountSettingsData["authenticationMethod"],
) => {
  if (authenticationMethod === "GoogleOAuth") {
    return GoogleAuthIcon;
  }
  if (authenticationMethod === "AppleOAuth") {
    return Apple;
  }
  if (authenticationMethod === "GitHubOAuth") {
    return Github;
  }
  if (authenticationMethod === "GitLabOAuth") {
    return Gitlab;
  }
  if (authenticationMethod === "SlackOAuth") {
    return Slack;
  }
  if (authenticationMethod === "LinkedInOAuth") {
    return Linkedin;
  }
  if (authenticationMethod === "MicrosoftOAuth") {
    return SquareM;
  }
  if (authenticationMethod === "DiscordOAuth") {
    return MessageCircle;
  }
  if (authenticationMethod === "BitbucketOAuth") {
    return Waypoints;
  }
  if (authenticationMethod === "SalesforceOAuth") {
    return Cloud;
  }
  if (authenticationMethod === "VercelOAuth") {
    return Compass;
  }
  if (authenticationMethod === "VercelMarketplaceOAuth") {
    return Blocks;
  }
  if (authenticationMethod === "XeroOAuth") {
    return Library;
  }
  if (authenticationMethod === "SSO") {
    return Building2;
  }
  if (authenticationMethod === "Passkey") {
    return KeyRound;
  }
  if (authenticationMethod === "MagicAuth") {
    return BadgeCheck;
  }
  if (authenticationMethod === "CrossAppAuth") {
    return Workflow;
  }
  if (authenticationMethod === "Impersonation") {
    return CircleUserRound;
  }
  if (authenticationMethod === "MigratedSession") {
    return CircleDashed;
  }
  return ShieldCheck;
};
type AccountTabProps = {
  data: AccountSettingsData;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  onRequestPasswordReset: () => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
};
export function AccountTab({
  data,
  onSave,
  onRequestPasswordReset,
  onUploadAvatar,
}: AccountTabProps) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [email, setEmail] = useState(data.email);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "pending" | "saving" | "saved"
  >("idle");
  const [passwordResetStatus, setPasswordResetStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const hasEditedRef = React.useRef(false);
  const saveDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const statusResetRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const saveRunIdRef = React.useRef(0);
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
  useEffect(() => {
    saveRunIdRef.current += 1;
    hasEditedRef.current = false;
    setAutoSaveStatus("idle");
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);
    setPasswordResetStatus("idle");
  }, [data.firstName, data.lastName, data.email, data.authenticationMethod]);
  useEffect(() => {
    if (!hasEditedRef.current) {
      return;
    }
    const isSyncedWithSource =
      firstName === data.firstName &&
      lastName === data.lastName &&
      email === data.email;
    if (isSyncedWithSource) {
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
          await onSave({ firstName, lastName, email });
          if (runId !== saveRunIdRef.current) {
            return;
          }
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
          reportUiError("settings.account.save", error, { showToast: false });
          toast.error("Failed to update account");
          setAutoSaveStatus("idle");
        }
      })();
    }, 700);
    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
    };
  }, [
    data.email,
    data.firstName,
    data.lastName,
    email,
    firstName,
    lastName,
    onSave,
  ]);
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
  const handleAvatarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!avatarBusy) {
        fileInputRef.current?.click();
      }
    }
  };
  const handleSendPasswordReset = async () => {
    if (passwordResetStatus === "sending") {
      return;
    }
    setPasswordResetStatus("sending");
    try {
      await onRequestPasswordReset();
      setPasswordResetStatus("sent");
    } catch (error) {
      reportUiError("settings.account.passwordReset", error, {
        showToast: false,
      });
      setPasswordResetStatus("error");
    }
  };
  const authMethodLabel = formatAuthMethodLabel(data.authenticationMethod);
  const AuthMethodIcon = resolveAuthMethodIcon(data.authenticationMethod);
  const authProviderName =
    data.socialLoginLabel ??
    (data.authenticationMethod ? formatAuthMethodCode(data.authenticationMethod) : "External provider");
  const authProviderEmail = data.email.trim();
  return (
    <div className="flex flex-col gap-5">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleAvatarFile}
      />
      <div className="flex items-start gap-5">
        <div
          className="size-[88px] rounded-full overflow-hidden border border-border-soft shrink-0 group relative bg-bg-muted-surface"
          onClick={() => {
            if (!avatarBusy) {
              fileInputRef.current?.click();
            }
          }}
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
                  hasEditedRef.current = true;
                  setFirstName(event.target.value);
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
                  hasEditedRef.current = true;
                  setLastName(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-3">
        {data.isPasswordAuthSession ? (
          <div className={AUTH_MODE_ROW_CLASS}>
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
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
                    onChange={(event) => {
                      hasEditedRef.current = true;
                      setEmail(event.target.value);
                    }}
                    className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password-input"
                    className="txt-role-body-md font-medium txt-tone-secondary"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type="text"
                      value={PASSWORD_PLACEHOLDER}
                      readOnly
                      aria-readonly="true"
                      className={`${UNDERLINE_INPUT_CLASS} w-full py-2 pr-28 txt-role-body-lg cursor-default`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void handleSendPasswordReset();
                      }}
                      disabled={passwordResetStatus === "sending"}
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-7 rounded-md border border-border-soft bg-surface-hover-soft px-2 txt-role-body-xs txt-tone-primary hover:bg-surface-active-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {passwordResetStatus === "sending"
                        ? "Sending..."
                        : "Reset password"}
                    </button>
                  </div>
                  {passwordResetStatus === "sent" && (
                    <span className="txt-role-body-sm txt-tone-faint">
                      Reset link sent to your account email.
                    </span>
                  )}
                  {passwordResetStatus === "error" && (
                    <span className="txt-role-body-sm txt-tone-danger">
                      Could not send reset link. Please try again.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={AUTH_MODE_ROW_CLASS}>
            <div className="shrink-0 self-center txt-tone-primary leading-none">
              <AuthMethodIcon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="txt-role-body-md font-medium txt-tone-primary">
                Signed in with {authProviderName}
              </p>
              {authProviderEmail.length > 0 && (
                <p className="txt-role-body-sm txt-tone-faint">
                  {authProviderEmail}
                </p>
              )}
            </div>
            <span className="inline-flex h-7 items-center txt-role-body-sm txt-tone-secondary">
              {authMethodLabel}
            </span>
          </div>
        )}
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
