import type { ComponentProps } from "react";
import { DashboardChrome } from "./components/DashboardChrome";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardPopups } from "./components/DashboardPopups";
import { useDashboardActionLayer } from "./hooks/useDashboardActionLayer";
import { useDashboardDataLayer } from "./hooks/useDashboardDataLayer";
import { useDashboardViewBindings } from "./hooks/useDashboardViewBindings";
type DashboardOrchestrationResult = {
  hasSnapshot: boolean;
  popupsProps: Omit<ComponentProps<typeof DashboardPopups>, "isMobile">;
  chromeProps: Omit<ComponentProps<typeof DashboardChrome>, "isMobile">;
  contentProps: Omit<ComponentProps<typeof DashboardContent>, "isMobile">;
};
export function useDashboardOrchestration(): DashboardOrchestrationResult {
  const dataLayer = useDashboardDataLayer();
  const actionLayer = useDashboardActionLayer(dataLayer);
  return useDashboardViewBindings(dataLayer, actionLayer);
}
