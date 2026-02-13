/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./dashboard/DashboardShell", () => ({
  default: () => <div>dashboard-shell</div>,
}));

describe("DashboardApp", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("renders dashboard shell", async () => {
    const { default: DashboardApp } = await import("./DashboardApp");

    render(<DashboardApp />);
    expect(await screen.findByText("dashboard-shell")).toBeInTheDocument();
  });
});
