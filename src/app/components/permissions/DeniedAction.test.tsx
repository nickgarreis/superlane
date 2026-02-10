/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DeniedAction } from "./DeniedAction";

describe("DeniedAction", () => {
  test("renders tooltip for denied controls and blocks click handlers", () => {
    const onClick = vi.fn();

    render(
      <DeniedAction denied reason="Only owners can create workspaces">
        <button onClick={onClick}>Create Workspace</button>
      </DeniedAction>,
    );

    expect(screen.getByRole("tooltip")).toHaveTextContent("Only owners can create workspaces");
    fireEvent.click(screen.getByRole("button", { name: "Create Workspace" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("does not render tooltip or block handlers when action is allowed", () => {
    const onClick = vi.fn();

    render(
      <DeniedAction denied={false} reason="Only owners can create workspaces">
        <button onClick={onClick}>Create Workspace</button>
      </DeniedAction>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create Workspace" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
