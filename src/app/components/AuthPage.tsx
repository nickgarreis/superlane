import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@workos-inc/authkit-react";
import { Link, useLocation } from "react-router-dom";
import { storeAuthMode, storeReturnTo } from "../lib/authReturnTo";

type AuthMode = "signin" | "signup";

const CONTROL_CHARS_PATTERN = /[\u0000-\u001F\u007F]/;

export const ensureSafeReturnTo = (value: string | null | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || CONTROL_CHARS_PATTERN.test(trimmed)) {
    return fallback;
  }
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }
  return trimmed;
};

export function AuthPage({ mode, defaultReturnTo = "/tasks" }: { mode: AuthMode; defaultReturnTo?: string }) {
  const { signIn, signUp, isLoading, user } = useAuth();
  const location = useLocation();
  const [pendingAction, setPendingAction] = useState<AuthMode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const configuredRedirect = import.meta.env.VITE_WORKOS_REDIRECT_URI;
  const autoStartedRef = useRef(false);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnTo = ensureSafeReturnTo(searchParams.get("returnTo"), defaultReturnTo);
  const workosError = searchParams.get("error");
  const workosErrorDescription = searchParams.get("error_description");
  const callbackErrorMessage = workosError
    ? `WorkOS error: ${workosError}${workosErrorDescription ? ` (${workosErrorDescription})` : ""}`
    : null;

  let redirectOriginMismatch = false;
  if (configuredRedirect) {
    try {
      redirectOriginMismatch = new URL(configuredRedirect).origin !== window.location.origin;
    } catch {
      redirectOriginMismatch = false;
    }
  }

  const handleAction = useCallback(async (action: AuthMode) => {
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
      setErrorMessage("Unable to open WorkOS authentication. Check your WorkOS client and redirect URI settings.");
    } finally {
      setPendingAction(null);
    }
  }, [pendingAction, isLoading, returnTo, signIn, signUp]);

  useEffect(() => {
    if (user || isLoading || callbackErrorMessage || autoStartedRef.current) {
      return;
    }
    autoStartedRef.current = true;
    void handleAction(mode);
  }, [user, isLoading, callbackErrorMessage, handleAction, mode]);

  const isBusy = isLoading || pendingAction !== null;
  const isSignIn = mode === "signin";

  return (
    <div className="min-h-screen w-full bg-[#141515] flex items-center justify-center p-4 font-['Roboto',sans-serif]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-medium text-[#E8E8E8] tracking-[-0.01em]">
            {isSignIn ? "Welcome back to Build Design" : "Create your Build Design account"}
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Redirecting you to the secure WorkOS {isSignIn ? "sign-in" : "sign-up"} form.
          </p>
        </div>

        <div className="bg-[#191A1A] border border-white/[0.06] rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              void handleAction(isSignIn ? "signin" : "signup");
            }}
            disabled={isBusy}
            className="w-full h-[42px] rounded-xl bg-[#58AFFF] text-[#0B223A] text-[13px] font-medium hover:bg-[#6bb7ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {pendingAction === mode ? "Redirecting..." : isSignIn ? "Continue to sign in" : "Continue to sign up"}
          </button>

          <Link
            to={isSignIn ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : `/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="w-full h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 text-[13px] text-[#E8E8E8]/90 cursor-pointer inline-flex items-center justify-center"
          >
            {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Link>

          {errorMessage && (
            <p className="text-[12px] text-[#ff8e8e]" role="alert">
              {errorMessage}
            </p>
          )}
          {callbackErrorMessage && (
            <p className="text-[12px] text-[#ff8e8e]" role="alert">
              {callbackErrorMessage}
            </p>
          )}
          {redirectOriginMismatch && (
            <p className="text-[12px] text-[#ffd38e]">
              Current origin is {window.location.origin}, but VITE_WORKOS_REDIRECT_URI is {configuredRedirect}.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
