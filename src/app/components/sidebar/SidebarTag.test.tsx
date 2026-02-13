/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SidebarTag } from "./SidebarTag";

describe("SidebarTag", () => {
  test("renders approved tag text", () => {
    render(<SidebarTag tone="approved">Approved</SidebarTag>);

    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  test("applies base and approved tone classes", () => {
    render(<SidebarTag tone="approved">Approved</SidebarTag>);

    const tag = screen.getByText("Approved");
    expect(tag).toHaveAttribute("data-sidebar-tag-tone", "approved");
    expect(tag).toHaveClass("inline-flex");
    expect(tag).toHaveClass("h-[19px]");
    expect(tag).toHaveClass("rounded-full");
    expect(tag).toHaveClass("txt-tone-warning");
    expect(tag.className).toContain(
      "[background-color:var(--activity-collaboration-bg)]",
    );
    expect(tag.className).toContain(
      "[border-color:var(--activity-collaboration-border)]",
    );
  });

  test("applies inbox unread blue token classes", () => {
    render(<SidebarTag tone="inboxUnread">7</SidebarTag>);

    const tag = screen.getByText("7");
    expect(tag).toHaveAttribute("data-sidebar-tag-tone", "inboxUnread");
    expect(tag).toHaveClass("txt-tone-accent");
    expect(tag).toHaveClass("bg-accent-soft-bg");
    expect(tag).toHaveClass("border-accent-soft-border");
    expect(tag).toHaveClass("min-w-[20px]");
    expect(tag).toHaveClass("h-[20px]");
    expect(tag).not.toHaveClass("txt-tone-warning");
  });

  test("applies important red token classes", () => {
    render(<SidebarTag tone="important">Important</SidebarTag>);

    const tag = screen.getByText("Important");
    expect(tag).toHaveAttribute("data-sidebar-tag-tone", "important");
    expect(tag).toHaveClass("txt-tone-danger");
    expect(tag).toHaveClass("bg-popup-danger-soft");
    expect(tag).toHaveClass("border-popup-danger-soft-strong");
    expect(tag).not.toHaveClass("txt-tone-accent");
    expect(tag).not.toHaveClass("txt-tone-warning");
  });

  test("applies pending orange review token classes", () => {
    render(<SidebarTag tone="pending">Pending</SidebarTag>);

    const tag = screen.getByText("Pending");
    expect(tag).toHaveAttribute("data-sidebar-tag-tone", "pending");
    expect(tag.className).toContain("[color:var(--status-review)]");
    expect(tag.className).toContain(
      "[background-color:var(--status-review-soft)]",
    );
    expect(tag.className).toContain(
      "[border-color:var(--status-review-border)]",
    );
    expect(tag).not.toHaveClass("txt-tone-accent");
    expect(tag).not.toHaveClass("txt-tone-danger");
    expect(tag).not.toHaveClass("txt-tone-warning");
  });
});
