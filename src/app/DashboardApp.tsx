import React, { Suspense } from "react";
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
      <LazyDashboardShell />
    </Suspense>
  );
}
