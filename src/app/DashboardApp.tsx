import DashboardLegacyShell from "./dashboard/DashboardLegacyShell";
import DashboardShell from "./dashboard/DashboardShell";

const isDashboardRewriteEnabled = import.meta.env.VITE_DASHBOARD_REWRITE !== "false";

export default function DashboardApp() {
  const Component = isDashboardRewriteEnabled ? DashboardShell : DashboardLegacyShell;
  return <Component />;
}
