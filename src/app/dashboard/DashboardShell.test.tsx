/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import DashboardShell from "./DashboardShell";

const useDashboardOrchestrationMock = vi.fn();

vi.mock("./useDashboardOrchestration", () => ({
  useDashboardOrchestration: () => useDashboardOrchestrationMock(),
}));

vi.mock("./components/DashboardPopups", () => ({
  DashboardPopups: (props: Record<string, unknown>) => <div data-testid="dashboard-popups">{JSON.stringify(props)}</div>,
}));

vi.mock("./components/DashboardChrome", () => ({
  DashboardChrome: (props: Record<string, unknown>) => <div data-testid="dashboard-chrome">{JSON.stringify(props)}</div>,
}));

vi.mock("./components/DashboardContent", () => ({
  DashboardContent: (props: Record<string, unknown>) => <div data-testid="dashboard-content">{JSON.stringify(props)}</div>,
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    useDashboardOrchestrationMock.mockReset();
  });

  test("renders loading state while snapshot is unresolved", () => {
    useDashboardOrchestrationMock.mockReturnValue({
      hasSnapshot: false,
      popupsProps: {},
      chromeProps: {},
      contentProps: {},
    });

    render(<DashboardShell />);

    expect(screen.getByText("Loading workspace...")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-popups")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-chrome")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-content")).not.toBeInTheDocument();
  });

  test("renders dashboard chrome/popups/content when snapshot is ready", () => {
    useDashboardOrchestrationMock.mockReturnValue({
      hasSnapshot: true,
      popupsProps: { isSearchOpen: true },
      chromeProps: { isSidebarOpen: true },
      contentProps: { contentModel: { kind: "tasks" } },
    });

    render(<DashboardShell />);

    expect(screen.getByTestId("dashboard-popups")).toHaveTextContent('{"isSearchOpen":true}');
    expect(screen.getByTestId("dashboard-chrome")).toHaveTextContent('{"isSidebarOpen":true}');
    expect(screen.getByTestId("dashboard-content")).toHaveTextContent('{"contentModel":{"kind":"tasks"}}');
  });
});
