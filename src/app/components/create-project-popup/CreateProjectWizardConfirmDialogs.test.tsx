/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CreateProjectWizardConfirmDialogs } from "./CreateProjectWizardConfirmDialogs";

type DialogProps = React.ComponentProps<typeof CreateProjectWizardConfirmDialogs>;

const buildProps = (overrides: Partial<DialogProps> = {}): DialogProps => ({
  showCloseConfirm: false,
  editProjectId: null,
  setShowCloseConfirm: vi.fn(),
  handleConfirmCancel: vi.fn(),
  handleConfirmSave: vi.fn(),
  showDeleteConfirm: false,
  setShowDeleteConfirm: vi.fn(),
  handleConfirmDelete: vi.fn(),
  showDeleteProjectConfirm: false,
  setShowDeleteProjectConfirm: vi.fn(),
  handleConfirmDeleteProject: vi.fn(),
  ...overrides,
});

describe("CreateProjectWizardConfirmDialogs", () => {
  test("traps keyboard focus and closes on escape in close-confirm dialog", () => {
    const setShowCloseConfirm = vi.fn();

    render(
      <CreateProjectWizardConfirmDialogs
        {...buildProps({
          showCloseConfirm: true,
          setShowCloseConfirm,
        })}
      />,
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(setShowCloseConfirm).toHaveBeenCalledWith(false);
  });

  test("runs delete-draft confirmation action", () => {
    const handleConfirmDelete = vi.fn();

    render(
      <CreateProjectWizardConfirmDialogs
        {...buildProps({
          showDeleteConfirm: true,
          handleConfirmDelete,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete draft" }));
    expect(handleConfirmDelete).toHaveBeenCalledTimes(1);
  });

  test("runs delete-project confirmation action", () => {
    const handleConfirmDeleteProject = vi.fn();

    render(
      <CreateProjectWizardConfirmDialogs
        {...buildProps({
          showDeleteProjectConfirm: true,
          handleConfirmDeleteProject,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete project" }));
    expect(handleConfirmDeleteProject).toHaveBeenCalledTimes(1);
  });
});
