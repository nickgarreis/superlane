import React, { Suspense } from "react";
const isDashboardRewriteEnabled =
  import.meta.env.VITE_DASHBOARD_REWRITE !== "false";
const LazyDashboardLegacyShell = React.lazy(
  () => import("./dashboard/DashboardLegacyShell"),
);
const LazyDashboardShell = React.lazy(
  () => import("./dashboard/DashboardShell"),
);
function DashboardShellFallback() {
  return (
    <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-app">
      Loading workspace...
    </div>
  );
}
export default function DashboardApp() {
  return (
    <Suspense fallback={<DashboardShellFallback />}>
      {isDashboardRewriteEnabled ? (
        <LazyDashboardShell />
      ) : (
        <LazyDashboardLegacyShell />
      )}
    </Suspense>
  );
}
