/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AccountTab } from "./AccountTab";

describe("AccountTab", () => {
  test("saves edited account fields", async () => {
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
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
        onRemoveAvatar={vi.fn().mockResolvedValue(undefined)}
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

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        firstName: "Jordan",
        lastName: "Builder",
        email: "jordan@example.com",
      });
    });
  });

  test("uploads and removes avatar", async () => {
    const onUploadAvatar = vi.fn().mockResolvedValue(undefined);
    const onRemoveAvatar = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: "https://cdn.example/avatar.png",
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={onUploadAvatar}
        onRemoveAvatar={onRemoveAvatar}
      />,
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

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

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(onRemoveAvatar).toHaveBeenCalledTimes(1);
    });
  });
});
