import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DashboardChrome } from "./components/DashboardChrome";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardPopups } from "./components/DashboardPopups";
import { useDashboardOrchestration } from "./useDashboardOrchestration";

export default function DashboardShell() {
  const {
    hasSnapshot,
    popupsProps,
    chromeProps,
    contentProps,
  } = useDashboardOrchestration();

  if (!hasSnapshot) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-['Roboto',sans-serif]">
        Loading workspace...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-bg-base overflow-hidden font-['Roboto',sans-serif] antialiased text-[#E8E8E8]">
        <DashboardPopups {...popupsProps} />
        <DashboardChrome {...chromeProps} />
        <DashboardContent {...contentProps} />
      </div>
    </DndProvider>
  );
}
