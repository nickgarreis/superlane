import { useEffect, useMemo, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  clearStoredAuthMode,
  readStoredAuthMode,
  readStoredReturnTo,
} from "../lib/authReturnTo";

export function RootPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const hasCode = searchParams.has("code");
  const workosError = searchParams.get("error");
  const workosErrorDescription = searchParams.get("error_description");
  const attemptedModeRef = useRef(readStoredAuthMode());

  useEffect(() => {
    if (hasCode || !workosError) {
      return;
    }
    clearStoredAuthMode();
  }, [hasCode, workosError]);

  if (hasCode) {
    return <Navigate to={`/auth/callback${location.search}`} replace />;
  }

  if (workosError) {
    const returnTo = readStoredReturnTo() ?? "/tasks";
    const destination =
      attemptedModeRef.current === "signup" ? "/signup" : "/login";
    const destinationSearch = new URLSearchParams({
      returnTo,
      error: workosError,
    });
    if (workosErrorDescription) {
      destinationSearch.set("error_description", workosErrorDescription);
    }
    return <Navigate to={`${destination}?${destinationSearch.toString()}`} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/tasks" replace />;
  }

  return <Navigate to="/login?returnTo=%2Ftasks" replace />;
}
