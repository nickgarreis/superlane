/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./dashboard/DashboardShell", () => ({
  default: () => <div>dashboard-shell</div>,
}));

vi.mock("./dashboard/DashboardLegacyShell", () => ({
  default: () => <div>dashboard-legacy-shell</div>,
}));

describe("DashboardApp", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("renders legacy shell when rewrite flag is false", async () => {
    vi.stubEnv("VITE_DASHBOARD_REWRITE", "false");
    const { default: DashboardApp } = await import("./DashboardApp");

    render(<DashboardApp />);
    expect(await screen.findByText("dashboard-legacy-shell")).toBeInTheDocument();
  });

  test("renders rewrite shell when rewrite flag is not false", async () => {
    vi.stubEnv("VITE_DASHBOARD_REWRITE", "true");
    const { default: DashboardApp } = await import("./DashboardApp");

    render(<DashboardApp />);
    expect(await screen.findByText("dashboard-shell")).toBeInTheDocument();
  });
});
