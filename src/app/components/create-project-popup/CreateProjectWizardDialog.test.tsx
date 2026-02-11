/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CreateProjectPopup } from "./CreateProjectWizardDialog";
import type { ProjectData, ProjectDraftData } from "../../types";

vi.mock("../../../imports/Loading03", () => ({
  default: ({ className }: { className?: string }) => (
    <div className={className} data-testid="loading03" />
  ),
}));

const STEP_THREE_DRAFT: ProjectDraftData = {
  selectedService: "Web Design",
  projectName: "Website Redesign",
  selectedJob: "Landing page(s)",
  description: "Refresh the landing page visual system",
  isAIEnabled: true,
  deadlineEpochMs: null,
  lastStep: 3,
};

const REVIEW_PROJECT: ProjectData = {
  id: "project-review-1",
  name: "Review Website Scope",
  description: "Project under review",
  creator: {
    name: "Owner User",
    avatar: "",
  },
  status: {
    label: "Review",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.16)",
    dotColor: "#f97316",
  },
  category: "Web Design",
  archived: false,
  tasks: [],
  comments: [],
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

    expect(
      screen.getByText("Let's explore some possibilities"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your Project is in Review" }),
    ).not.toBeInTheDocument();
  });

  test("uses returned project publicId when persisting review comments", async () => {
    const onCreate = vi
      .fn()
      .mockResolvedValue({ publicId: "project-123", mode: "create" });
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
    fireEvent.change(commentInput, {
      target: { value: "Please prioritize homepage animation." },
    });
    fireEvent.keyDown(commentInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(onUpdateComments).toHaveBeenCalled();
    });

    const [projectId] = onUpdateComments.mock.calls[0] as [string];
    expect(projectId).toBe("project-123");
  });

  test("persists review comments when scrollIntoView is unavailable", async () => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    try {
      const onCreate = vi
        .fn()
        .mockResolvedValue({ publicId: "project-456", mode: "create" });
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
      fireEvent.change(commentInput, {
        target: { value: "No crash when scrolling is unavailable." },
      });
      fireEvent.keyDown(commentInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(onUpdateComments).toHaveBeenCalledTimes(1);
      });
    } finally {
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        value: originalScrollIntoView,
        writable: true,
        configurable: true,
      });
    }
  });

  test("shows locked review approval action for non-owner users", async () => {
    const onApproveReviewProject = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProjectPopup
        isOpen
        onClose={() => {}}
        reviewProject={REVIEW_PROJECT}
        onApproveReviewProject={onApproveReviewProject}
        user={{ userId: "admin-1", name: "Admin", avatar: "", role: "admin" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Your Project is in Review" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(onApproveReviewProject).toHaveBeenCalledTimes(0);
    });
  });

  test("allows owners to approve review projects", async () => {
    const onApproveReviewProject = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProjectPopup
        isOpen
        onClose={() => {}}
        reviewProject={REVIEW_PROJECT}
        onApproveReviewProject={onApproveReviewProject}
        user={{ userId: "owner-1", name: "Owner", avatar: "", role: "owner" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(onApproveReviewProject).toHaveBeenCalledWith(REVIEW_PROJECT.id);
    });
  });

  test("closes without draft confirmation when clicking backdrop on step 4", async () => {
    const onCreate = vi
      .fn()
      .mockResolvedValue({ publicId: "project-789", mode: "create" });
    const onClose = vi.fn();

    const { container } = render(
      <CreateProjectPopup
        isOpen
        onClose={onClose}
        onCreate={onCreate}
        initialDraftData={STEP_THREE_DRAFT}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review & submit" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Your Project is in Review" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(container.firstElementChild as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Save as draft?")).not.toBeInTheDocument();
  });
});
