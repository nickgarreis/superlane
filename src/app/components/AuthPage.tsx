import React, {
  useCallback,
  useEffect,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
import { useAuth } from "@workos-inc/authkit-react";
import { useAction } from "convex/react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { reportUiError } from "../lib/errors";
import { storeAuthMode, storeReturnTo } from "../lib/authReturnTo";
type AuthMode = "signin" | "signup";
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/;
export const ensureSafeReturnTo = (
  value: string | null | undefined,
  fallback: string,
) => {
  if (!value) {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || CONTROL_CHARS_PATTERN.test(trimmed)) {
    return fallback;
  }
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return fallback;
  }
  return trimmed;
};
export function AuthPage({
  mode,
  defaultReturnTo = "/tasks",
}: {
  mode: AuthMode;
  defaultReturnTo?: string;
}) {
  const requestPasswordResetAction = useAction(api.auth.requestPasswordReset);
  const { signIn, signUp, isLoading, user } = useAuth();
  const location = useLocation();
  const [pendingAction, setPendingAction] = useState<AuthMode | null>(null);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const configuredRedirect = import.meta.env.VITE_WORKOS_REDIRECT_URI;
  const autoStartedRef = useRef(false);
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const returnTo = ensureSafeReturnTo(
    searchParams.get("returnTo"),
    defaultReturnTo,
  );
  const workosError = searchParams.get("error");
  const workosErrorDescription = searchParams.get("error_description");
  const callbackErrorMessage = workosError
    ? `WorkOS error: ${workosError}${workosErrorDescription ? ` (${workosErrorDescription})` : ""}`
    : null;
  const isSignIn = mode === "signin";
  const authenticatedDestination = useMemo(() => {
    const safeReturnTo = returnTo ?? defaultReturnTo;
    const destinationPathname = safeReturnTo.split(/[?#]/, 1)[0] ?? safeReturnTo;
    if (
      destinationPathname === "/login" ||
      destinationPathname === "/signup" ||
      destinationPathname === "/auth/callback" ||
      destinationPathname === "/reset-password"
    ) {
      return "/tasks";
    }
    return safeReturnTo;
  }, [defaultReturnTo, returnTo]);
  let redirectOriginMismatch = false;
  if (configuredRedirect) {
    try {
      redirectOriginMismatch =
        new URL(configuredRedirect).origin !== window.location.origin;
    } catch {
      redirectOriginMismatch = false;
    }
  }
  const handleAction = useCallback(
    async (action: AuthMode) => {
      if (pendingAction || isLoading) {
        return;
      }
      setErrorMessage(null);
      setPendingAction(action);
      storeAuthMode(action);
      storeReturnTo(returnTo);
      try {
        if (action === "signin") {
          await signIn({ state: { returnTo, authAttemptAt: Date.now() } });
        } else {
          await signUp({ state: { returnTo, authAttemptAt: Date.now() } });
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Unable to open WorkOS authentication. Check your WorkOS client and redirect URI settings.",
        );
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, isLoading, returnTo, signIn, signUp],
  );

  const handleForgotPasswordSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSendingResetLink || isLoading) {
        return;
      }
      const normalizedEmail = resetEmail.trim().toLowerCase();
      if (normalizedEmail.length === 0) {
        setResetStatus("error");
        return;
      }
      setResetStatus("idle");
      setIsSendingResetLink(true);
      try {
        await requestPasswordResetAction({
          source: "login",
          email: normalizedEmail,
        });
        setResetStatus("sent");
      } catch (error) {
        reportUiError("auth.passwordReset.request", error, { showToast: false });
        setResetStatus("error");
      } finally {
        setIsSendingResetLink(false);
      }
    },
    [isLoading, isSendingResetLink, requestPasswordResetAction, resetEmail],
  );

  useEffect(() => {
    if (
      isSignIn ||
      user ||
      isLoading ||
      callbackErrorMessage ||
      autoStartedRef.current
    ) {
      return;
    }
    autoStartedRef.current = true;
    void handleAction("signup");
  }, [isSignIn, user, isLoading, callbackErrorMessage, handleAction]);

  useEffect(() => {
    if (isSignIn) {
      return;
    }
    setIsForgotPasswordOpen(false);
    setResetStatus("idle");
    setResetEmail("");
  }, [isSignIn]);

  if (user) {
    return <Navigate to={authenticatedDestination} replace />;
  }

  const isBusy = isLoading || pendingAction !== null;
  return (
    <div className="min-h-screen w-full bg-bg-base flex items-center justify-center p-4 font-app">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-8">
          <h1 className="txt-role-screen-title txt-tone-primary txt-track-tight-sm">
            {isSignIn
              ? "Welcome back to Build Design"
              : "Create your Build Design account"}
          </h1>
          <p className="txt-role-body-md text-white/40 mt-1">
            Redirecting you to the secure WorkOS
            {isSignIn ? "sign-in" : "sign-up"} form.
          </p>
        </div>
        <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              void handleAction(isSignIn ? "signin" : "signup");
            }}
            disabled={isBusy}
            className="w-full h-[42px] rounded-xl bg-[#58AFFF] txt-tone-inverse txt-role-body-md font-medium hover:bg-[#6bb7ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pendingAction === mode
              ? "Redirecting..."
              : isSignIn
                ? "Continue to sign in"
                : "Continue to sign up"}
          </button>
          {isSignIn && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen((current) => !current);
                  setResetStatus("idle");
                }}
                className="self-start txt-role-body-sm txt-tone-subtle hover:txt-tone-primary transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
              {isForgotPasswordOpen && (
                <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-2">
                  <label
                    htmlFor="forgot-password-email"
                    className="txt-role-body-sm txt-tone-faint"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-password-email"
                    type="email"
                    value={resetEmail}
                    onChange={(event) => {
                      setResetEmail(event.target.value);
                      if (resetStatus !== "idle") {
                        setResetStatus("idle");
                      }
                    }}
                    disabled={isSendingResetLink}
                    className="w-full h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 txt-role-body-md txt-tone-primary placeholder:text-white/35 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-60"
                    placeholder="you@company.com"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSendingResetLink}
                    className="w-full h-[40px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 txt-role-body-md txt-tone-secondary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSendingResetLink
                      ? "Sending link..."
                      : "Send password reset link"}
                  </button>
                  {resetStatus === "sent" && (
                    <p className="txt-role-body-sm txt-tone-muted" role="status">
                      If an account exists for this email, a reset link has been sent.
                    </p>
                  )}
                  {resetStatus === "error" && (
                    <p className="txt-role-body-sm txt-tone-muted" role="alert">
                      Unable to send reset link right now. Please try again.
                    </p>
                  )}
                </form>
              )}
            </>
          )}
          <Link
            to={
              isSignIn
                ? `/signup?returnTo=${encodeURIComponent(returnTo)}`
                : `/login?returnTo=${encodeURIComponent(returnTo)}`
            }
            className="w-full h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 txt-role-body-md txt-tone-secondary cursor-pointer inline-flex items-center justify-center"
          >
            {isSignIn
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </Link>
          {errorMessage && (
            <p className="txt-role-body-sm txt-tone-muted" role="alert">
              {errorMessage}
            </p>
          )}
          {callbackErrorMessage && (
            <p className="txt-role-body-sm txt-tone-muted" role="alert">
              {callbackErrorMessage}
            </p>
          )}
          {redirectOriginMismatch && (
            <p className="txt-role-body-sm txt-tone-muted">
              Current origin is {window.location.origin}, but
              VITE_WORKOS_REDIRECT_URI is {configuredRedirect}.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
