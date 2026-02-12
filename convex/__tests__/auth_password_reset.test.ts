import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { authKit } from "../auth";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  member: { subject: "member-password-reset-subject" },
} as const;

describe("auth.requestPasswordReset", () => {
  let t: ReturnType<typeof convexTest>;
  const previousAppOrigin = process.env.APP_ORIGIN;
  let sendPasswordResetEmailMock: MockInstance<
    typeof authKit.workos.userManagement.sendPasswordResetEmail
  >;

  beforeEach(() => {
    process.env.APP_ORIGIN = "https://app.example.com";
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
    sendPasswordResetEmailMock = vi
      .spyOn(authKit.workos.userManagement, "sendPasswordResetEmail")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (previousAppOrigin === undefined) {
      delete process.env.APP_ORIGIN;
      return;
    }
    process.env.APP_ORIGIN = previousAppOrigin;
  });

  const asMember = () => t.withIdentity(IDENTITIES.member);

  test("dispatches reset email for login source with normalized email", async () => {
    const result = await asMember().action(api.auth.requestPasswordReset, {
      source: "login",
      email: " USER@Example.com ",
    });

    expect(result).toEqual({ accepted: true });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({
      email: "user@example.com",
      passwordResetUrl:
        "https://app.example.com/reset-password?returnTo=%2Ftasks",
    });
  });

  test("dispatches reset email for settings source using current account email", async () => {
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member",
        email: "member@example.com",
        createdAt: now,
        updatedAt: now,
      });
    });

    const result = await asMember().action(api.auth.requestPasswordReset, {
      source: "settings",
    });

    expect(result).toEqual({ accepted: true });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({
      email: "member@example.com",
      passwordResetUrl:
        "https://app.example.com/reset-password?returnTo=%2Fsettings%3Ftab%3DAccount",
    });
  });

  test("returns accepted even when WorkOS dispatch fails", async () => {
    sendPasswordResetEmailMock.mockRejectedValueOnce(new Error("dispatch failed"));

    const result = await asMember().action(api.auth.requestPasswordReset, {
      source: "login",
      email: "member@example.com",
    });

    expect(result).toEqual({ accepted: true });
  });
});
