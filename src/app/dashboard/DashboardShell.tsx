import React from "react";
import { DashboardChrome } from "./components/DashboardChrome";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardPopups } from "./components/DashboardPopups";
import { useDashboardOrchestration } from "./useDashboardOrchestration";
import { useIsMobile } from "../components/ui/use-mobile";
export default function DashboardShell() {
  const isMobile = useIsMobile();
  const { hasSnapshot, popupsProps, chromeProps, contentProps } =
    useDashboardOrchestration();
  if (!hasSnapshot) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-app">
        Loading workspace...
      </div>
    );
  }
  return (
    <div className="flex app-shell-dvh w-full bg-bg-base overflow-hidden font-app antialiased txt-tone-primary">
      <DashboardPopups {...popupsProps} isMobile={isMobile} />
      <DashboardChrome {...chromeProps} isMobile={isMobile} />
      <DashboardContent {...contentProps} isMobile={isMobile} />
    </div>
  );
}
