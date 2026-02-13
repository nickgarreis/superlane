/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AccountTab } from "./AccountTab";

describe("AccountTab", () => {
  test("auto-saves edited profile name fields using canonical account email", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
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

    await waitFor(
      () => {
        expect(onSave).toHaveBeenCalledWith({
          firstName: "Jordan",
          lastName: "Builder",
          email: "alex@example.com",
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
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
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

  test("renders password session as summary row and hides inline credentials controls", () => {
    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Signed in with Email")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit email & password" }),
    ).toBeInTheDocument();

    expect(screen.queryByLabelText("Email Address")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset password" }),
    ).not.toBeInTheDocument();
  });

  test("opens credentials popup, only saves email on Save click, and closes on success", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
        }}
        onSave={onSave}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit email & password" }));

    expect(screen.getByRole("heading", { name: "Edit email & password" })).toBeInTheDocument();
    const emailInput = screen.getByLabelText("Email Address");
    expect(emailInput).toHaveValue("alex@example.com");

    fireEvent.change(emailInput, {
      target: { value: "jordan@example.com" },
    });

    await waitFor(
      () => {
        expect(onSave).not.toHaveBeenCalled();
      },
      { timeout: 250 },
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        firstName: "Alex",
        lastName: "Owner",
        email: "jordan@example.com",
      });
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Edit email & password" }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("jordan@example.com")).toBeInTheDocument();
  });

  test("sends password reset link from credentials popup", async () => {
    const onRequestPasswordReset = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={onRequestPasswordReset}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit email & password" }));

    expect(screen.getByLabelText("Password")).toHaveValue("••••••••••");
    expect(screen.getByLabelText("Password")).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(onRequestPasswordReset).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByText("Reset link sent to your account email."),
    ).toBeInTheDocument();
  });

  test("prompts before closing popup with dirty email and can discard changes", () => {
    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit email & password" }));

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "draft@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("heading", { name: "Discard email changes?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(
      screen.queryByRole("heading", { name: "Discard email changes?" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edit email & password" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(
      screen.queryByRole("heading", { name: "Edit email & password" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit email & password" }));
    expect(screen.getByLabelText("Email Address")).toHaveValue("alex@example.com");
  });

  test("shows both email and linked social rows for password sessions", () => {
    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["email_password", "google"],
          authenticationMethod: "Password",
          isPasswordAuthSession: true,
          socialLoginLabel: null,
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Signed in with Email")).toBeInTheDocument();
    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit email & password" })).toBeInTheDocument();
    expect(screen.getByText("OAuth")).toBeInTheDocument();
  });

  test("shows linked email row for social sessions when email credentials are linked", () => {
    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["google", "email_password"],
          authenticationMethod: "GoogleOAuth",
          isPasswordAuthSession: false,
          socialLoginLabel: "Google",
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={vi.fn().mockResolvedValue(undefined)}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
    expect(screen.getByText("Signed in with Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit email & password" })).toBeInTheDocument();
  });

  test("shows social auth method row and keeps credentials editor hidden", () => {
    const onRequestPasswordReset = vi.fn().mockResolvedValue(undefined);

    render(
      <AccountTab
        data={{
          firstName: "Alex",
          lastName: "Owner",
          email: "alex@example.com",
          avatarUrl: null,
          linkedIdentityProviders: ["google"],
          authenticationMethod: "GoogleOAuth",
          isPasswordAuthSession: false,
          socialLoginLabel: "Google",
        }}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onRequestPasswordReset={onRequestPasswordReset}
        onUploadAvatar={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
    expect(screen.getByText("OAuth")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.queryByText("GoogleOAuth")).not.toBeInTheDocument();
    expect(screen.queryByText("Signed in with Email")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit email & password" }),
    ).not.toBeInTheDocument();
    expect(onRequestPasswordReset).not.toHaveBeenCalled();
  });
});
