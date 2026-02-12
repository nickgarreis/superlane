/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AccountTab } from "./AccountTab";

describe("AccountTab", () => {
  test("auto-saves edited account fields", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
        }}
        onSave={onSave}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jordan" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Builder" },
    });
    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "jordan@example.com" },
    });

    expect(
      screen.queryByRole("button", { name: "Save Changes" }),
    ).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledWith({
          firstName: "Jordan",
          lastName: "Builder",
          email: "jordan@example.com",
        });
      },
      { timeout: 2500 },
    );
  });

  test("uploads avatar from file input and hides manual avatar action buttons", async () => {
    const onUploadAvatar = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: "https://cdn.example/avatar.png",
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={onUploadAvatar}
      />,
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Upload new" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Profile Picture" }),
    ).not.toBeInTheDocument();

    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    });

    await waitFor(() => {
      expect(onUploadAvatar).toHaveBeenCalledWith(
        expect.objectContaining({ name: "avatar.png" }),
      );
    });
  });

  test("sends password reset link from security section", async () => {
    const onRequestPasswordReset = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={onRequestPasswordReset}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Send password reset link" }),
    );

    await waitFor(() => {
      expect(onRequestPasswordReset).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByText("Reset link sent to your account email."),
    ).toBeInTheDocument();
  });
});
