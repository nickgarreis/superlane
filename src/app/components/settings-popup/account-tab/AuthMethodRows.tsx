import { Pencil } from "lucide-react";
import type { AccountSettingsData } from "../types";
import {
  buildProviderKeysToDisplay,
  formatAuthMethodCode,
  formatAuthMethodLabel,
  resolveProviderKeyFromAuthMethod,
  resolveProviderRowMeta,
} from "./authProviders";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "../../ui/controlChrome";

const AUTH_MODE_ROW_CLASS = "flex flex-wrap items-start gap-3";

type AuthMethodRowsProps = {
  data: Pick<
    AccountSettingsData,
    | "authenticationMethod"
    | "isPasswordAuthSession"
    | "socialLoginLabel"
    | "linkedIdentityProviders"
  >;
  authProviderEmail: string;
  onOpenCredentialsModal: () => void;
};

export function AuthMethodRows({
  data,
  authProviderEmail,
  onOpenCredentialsModal,
}: AuthMethodRowsProps) {
  const sessionProviderKey = resolveProviderKeyFromAuthMethod(
    data.authenticationMethod,
  );
  const providerKeysToDisplay = buildProviderKeysToDisplay({
    linkedIdentityProviders: data.linkedIdentityProviders,
    sessionProviderKey,
    isPasswordAuthSession: data.isPasswordAuthSession,
  });

  return (
    <div className="pt-3">
      <div className="flex flex-col gap-4">
        {providerKeysToDisplay.map((providerKey, index) => {
          const providerMeta = resolveProviderRowMeta(providerKey);
          const isEmailProvider = providerKey === "email_password";
          const isSessionProvider =
            providerKey === sessionProviderKey ||
            (sessionProviderKey === null &&
              !data.isPasswordAuthSession &&
              providerKey === "external_auth" &&
              index === 0);

          const providerName =
            isSessionProvider && !isEmailProvider
              ? data.socialLoginLabel ??
                (data.authenticationMethod
                  ? formatAuthMethodCode(data.authenticationMethod)
                  : providerMeta.providerName)
              : providerMeta.providerName;
          const methodLabel = isEmailProvider
            ? null
            : isSessionProvider
              ? formatAuthMethodLabel(data.authenticationMethod)
              : providerMeta.methodLabel ?? "External auth";
          const shouldShowMethodLabel =
            methodLabel !== null && methodLabel !== "OAuth";
          const ProviderIcon = providerMeta.Icon;

          return (
            <div
              key={`${providerKey}-${index}`}
              className={AUTH_MODE_ROW_CLASS}
            >
              <div className="shrink-0 self-center txt-tone-primary leading-none">
                <ProviderIcon size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="txt-role-body-md font-medium txt-tone-primary">
                  Signed in with {providerName}
                </p>
                {authProviderEmail.length > 0 && (
                  <p className="txt-role-body-sm txt-tone-faint">
                    {authProviderEmail}
                  </p>
                )}
              </div>
              {isEmailProvider ? (
                <button
                  type="button"
                  aria-label="Edit email & password"
                  title="Edit email & password"
                  onClick={onOpenCredentialsModal}
                  className={`${TABLE_ACTION_ICON_BUTTON_CLASS} hover:bg-surface-hover-subtle hover:txt-tone-faint`}
                >
                  <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : shouldShowMethodLabel ? (
                <span className="inline-flex h-7 items-center txt-role-body-sm txt-tone-secondary">
                  {methodLabel}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
