import type { ComponentProps } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "../../components/Sidebar";

type DashboardSidebarDndBoundaryProps = ComponentProps<typeof Sidebar>;

export default function DashboardSidebarDndBoundary(
  props: DashboardSidebarDndBoundaryProps,
) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Sidebar {...props} />
    </DndProvider>
  );
}
