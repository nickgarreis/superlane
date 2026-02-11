import React, { Suspense, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthCallbackPage } from "./components/AuthCallbackPage";
import { AuthPage } from "./components/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootPage } from "./components/RootPage";
import { getPageTitle } from "./lib/seo";

const DashboardApp = React.lazy(() => import("./DashboardApp"));

function DashboardFallback() {
  return (
    <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-app">
      Loading dashboard...
    </div>
  );
}

function useRouteTitle() {
  const location = useLocation();

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);
}

export default function App() {
  const { isAuthenticated } = useConvexAuth();
  useRouteTitle();

  return (
    <Routes>
      <Route path="/" element={<RootPage isAuthenticated={isAuthenticated} />} />
      <Route path="/login" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/dashboard" element={<Navigate to="/tasks" replace />} />
      <Route path="/inbox" element={<Navigate to="/tasks" replace />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Suspense fallback={<DashboardFallback />}>
              <DashboardApp />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
