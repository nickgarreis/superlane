import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearStoredAuthMode, readStoredAuthMode, readStoredReturnTo } from "../lib/authReturnTo";

export function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hasCode = searchParams.has("code");
  const workosError = searchParams.get("error");
  const workosErrorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (hasCode) {
      return;
    }

    const returnTo = readStoredReturnTo() ?? "/tasks";

    if (!workosError) {
      clearStoredAuthMode();
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
      return;
    }

    const attemptedMode = readStoredAuthMode();
    clearStoredAuthMode();
    const destination = attemptedMode === "signup" ? "/signup" : "/login";
    const destinationSearch = new URLSearchParams({
      returnTo,
      error: workosError,
    });

    if (workosErrorDescription) {
      destinationSearch.set("error_description", workosErrorDescription);
    }

    navigate(`${destination}?${destinationSearch.toString()}`, { replace: true });
  }, [hasCode, navigate, workosError, workosErrorDescription]);

  return (
    <div className="min-h-screen w-full bg-[#141515] flex items-center justify-center p-4 text-white/70 font-['Roboto',sans-serif]">
      Completing secure sign-in...
    </div>
  );
}
