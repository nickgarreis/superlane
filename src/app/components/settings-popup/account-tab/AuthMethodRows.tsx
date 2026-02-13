import type { AccountSettingsData } from "../types";
import {
  buildProviderKeysToDisplay,
  formatAuthMethodCode,
  formatAuthMethodLabel,
  resolveProviderKeyFromAuthMethod,
  resolveProviderRowMeta,
} from "./authProviders";
import { SECONDARY_ACTION_BUTTON_CLASS } from "../../ui/controlChrome";

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
      <div className="flex flex-col gap-3">
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
                  onClick={onOpenCredentialsModal}
                  className={`inline-flex h-7 items-center rounded-full px-3 txt-role-body-sm cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
                >
                  Edit email & password
                </button>
              ) : (
                <span className="inline-flex h-7 items-center txt-role-body-sm txt-tone-secondary">
                  {methodLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
