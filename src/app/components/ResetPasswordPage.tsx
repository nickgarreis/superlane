import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@workos-inc/authkit-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { storeAuthMode, storeReturnTo } from "../lib/authReturnTo";
import { ensureSafeReturnTo } from "./AuthPage";

const resolveResetToken = (searchParams: URLSearchParams): string | null => {
  const tokenKeys = ["token", "password_reset_token", "passwordResetToken"];
  for (const key of tokenKeys) {
    const value = searchParams.get(key);
    if (typeof value !== "string") {
      continue;
    }
    const normalized = value.trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }
  return null;
};

export function ResetPasswordPage() {
  const { signIn, isLoading, user } = useAuth();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const returnTo = ensureSafeReturnTo(searchParams.get("returnTo"), "/tasks");
  const resetToken = useMemo(() => resolveResetToken(searchParams), [searchParams]);

  const handleStartReset = useCallback(async () => {
    if (!resetToken || pending || isLoading) {
      return;
    }

    setErrorMessage(null);
    setPending(true);
    storeAuthMode("signin");
    storeReturnTo(returnTo);

    try {
      await signIn({
        passwordResetToken: resetToken,
        state: { returnTo, authAttemptAt: Date.now() },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Unable to continue password reset. Request a new reset link and try again.",
      );
    } finally {
      setPending(false);
    }
  }, [isLoading, pending, resetToken, returnTo, signIn]);

  useEffect(() => {
    if (user || isLoading || !resetToken || autoStartedRef.current) {
      return;
    }
    autoStartedRef.current = true;
    void handleStartReset();
  }, [handleStartReset, isLoading, resetToken, user]);

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  const isBusy = isLoading || pending;
  if (!resetToken) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex items-center justify-center p-4 font-app">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3">
            <h1 className="txt-role-screen-title txt-tone-primary txt-track-tight-sm">
              Invalid password reset link
            </h1>
            <p className="txt-role-body-md text-white/40">
              This reset link is invalid or expired. Request a new link from the sign-in page.
            </p>
            <Link
              to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="w-full h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 txt-role-body-md txt-tone-secondary cursor-pointer inline-flex items-center justify-center"
            >
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            Reset your password
          </h1>
          <p className="txt-role-body-md text-white/40 mt-1">
            Redirecting you to the secure WorkOS password reset form.
          </p>
        </div>

        <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              void handleStartReset();
            }}
            disabled={isBusy}
            className="w-full h-[42px] rounded-xl bg-[#58AFFF] txt-tone-inverse txt-role-body-md font-medium hover:bg-[#6bb7ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBusy ? "Redirecting..." : "Continue password reset"}
          </button>

          <Link
            to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="w-full h-[42px] rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 txt-role-body-md txt-tone-secondary cursor-pointer inline-flex items-center justify-center"
          >
            Back to sign in
          </Link>

          {errorMessage && (
            <p className="txt-role-body-sm txt-tone-muted" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
