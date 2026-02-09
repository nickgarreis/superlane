import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearStoredAuthMode, readStoredAuthMode, readStoredReturnTo } from "../lib/authReturnTo";
import { MarketingPage } from "./MarketingPage";

export function RootPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hasCode = searchParams.has("code");
  const workosError = searchParams.get("error");
  const workosErrorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (hasCode || !workosError) {
      return;
    }

    const returnTo = readStoredReturnTo() ?? "/tasks";
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

  return <MarketingPage isAuthenticated={isAuthenticated} />;
}
