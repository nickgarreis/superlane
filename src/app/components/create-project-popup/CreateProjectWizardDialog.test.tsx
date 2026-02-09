/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CreateProjectPopup } from "./CreateProjectWizardDialog";
import type { ProjectDraftData } from "../../types";

const STEP_THREE_DRAFT: ProjectDraftData = {
  selectedService: "Web Design",
  projectName: "Website Redesign",
  selectedJob: "Landing page(s)",
  description: "Refresh the landing page visual system",
  isAIEnabled: true,
  deadlineEpochMs: null,
  lastStep: 3,
};

describe("CreateProjectPopup", () => {
  test("keeps wizard on step 3 when async create fails", async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error("create failed"));

    render(
      <CreateProjectPopup
        isOpen
        onClose={() => {}}
        onCreate={onCreate}
        initialDraftData={STEP_THREE_DRAFT}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review & submit" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Lets explore some possibilities")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your Project is in Review" }),
    ).not.toBeInTheDocument();
  });

  test("uses returned project publicId when persisting review comments", async () => {
    const onCreate = vi.fn().mockResolvedValue({ publicId: "project-123", mode: "create" });
    const onUpdateComments = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProjectPopup
        isOpen
        onClose={() => {}}
        onCreate={onCreate}
        onUpdateComments={onUpdateComments}
        user={{ userId: "viewer-1", name: "Nick", avatar: "", role: "owner" }}
        initialDraftData={STEP_THREE_DRAFT}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review & submit" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Your Project is in Review" }),
      ).toBeInTheDocument();
    });

    const commentInput = screen.getByPlaceholderText("Add a comment...");
    fireEvent.change(commentInput, { target: { value: "Please prioritize homepage animation." } });
    fireEvent.keyDown(commentInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(onUpdateComments).toHaveBeenCalled();
    });

    const [projectId] = onUpdateComments.mock.calls[0] as [string];
    expect(projectId).toBe("project-123");
  });
});
