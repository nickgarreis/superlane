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
  member: { subject: "member-linked-provider-sync-subject" },
  missing: { subject: "missing-linked-provider-sync-subject" },
} as const;

describe("auth.syncCurrentUserLinkedIdentityProviders", () => {
  let t: ReturnType<typeof convexTest>;
  let getUserIdentitiesMock: MockInstance<
    typeof authKit.workos.userManagement.getUserIdentities
  >;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
    getUserIdentitiesMock = vi
      .spyOn(authKit.workos.userManagement, "getUserIdentities")
      .mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asMissingUser = () => t.withIdentity(IDENTITIES.missing);

  test("persists session auth provider when WorkOS identity sync fails", async () => {
    const memberUserId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member",
        email: "member@example.com",
        createdAt: now,
        updatedAt: now,
      });
    });
    getUserIdentitiesMock.mockRejectedValueOnce(new Error("workos unavailable"));

    const result = await asMember().action(
      api.auth.syncCurrentUserLinkedIdentityProviders,
      {
        sessionAuthenticationMethod: "GoogleOAuth",
      },
    );

    expect(result).toEqual({
      synced: false,
      reason: "sync_failed",
      linkedIdentityProviders: ["google"],
    });

    const storedUser = await t.run(async (ctx) => ctx.db.get(memberUserId));
    expect(storedUser?.linkedIdentityProviders).toEqual(["google"]);
  });

  test("merges persisted providers, session method, and WorkOS identities", async () => {
    await t.run(async (ctx) => {
      const now = Date.now();
      await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member",
        email: "member@example.com",
        linkedIdentityProviders: ["email_password"],
        createdAt: now,
        updatedAt: now,
      });
    });
    getUserIdentitiesMock.mockResolvedValueOnce([
      {
        idpId: "idp_google",
        type: "OAuth",
        provider: "GoogleOAuth",
      },
    ]);

    const result = await asMember().action(
      api.auth.syncCurrentUserLinkedIdentityProviders,
      {
        sessionAuthenticationMethod: "Password",
      },
    );

    expect(result).toEqual({
      synced: true,
      updated: true,
      linkedIdentityProviders: ["email_password", "google"],
    });
  });

  test("returns not_provisioned without calling WorkOS identities for missing users", async () => {
    const result = await asMissingUser().action(
      api.auth.syncCurrentUserLinkedIdentityProviders,
      {
        sessionAuthenticationMethod: "GoogleOAuth",
      },
    );

    expect(result).toEqual({
      synced: false,
      reason: "not_provisioned",
      linkedIdentityProviders: [],
    });
    expect(getUserIdentitiesMock).not.toHaveBeenCalled();
  });
});
