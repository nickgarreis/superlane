import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-notifications-subject" },
  admin: { subject: "admin-notifications-subject" },
  member: { subject: "member-notifications-subject" },
  memberTwo: { subject: "member-two-notifications-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
  memberUserId: Id<"users">;
  memberTwoUserId: Id<"users">;
  projectPublicId: string;
};

const now = () => Date.now();

describe("notifications email", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asAdmin = () => t.withIdentity(IDENTITIES.admin);
  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asMemberTwo = () => t.withIdentity(IDENTITIES.memberTwo);

  const countScheduledFunctions = async () =>
    t.run(async (ctx) => {
      const scheduled = await ctx.db.system.query("_scheduled_functions").collect();
      return scheduled.length;
    });

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        email: "owner@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Admin User",
        email: "admin@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const memberUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member User",
        email: "member@example.com",
        createdAt,
        updatedAt: createdAt,
      });
      const memberTwoUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.memberTwo.subject,
        name: "Member Two User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-notifications";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Notifications",
        plan: "Pro",
        ownerUserId,
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: ownerUserId,
        role: "owner",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "admin",
        status: "active",
        joinedAt: createdAt + 1,
        createdAt: createdAt + 1,
        updatedAt: createdAt + 1,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt + 2,
        createdAt: createdAt + 2,
        updatedAt: createdAt + 2,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberTwoUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt + 3,
        createdAt: createdAt + 3,
        updatedAt: createdAt + 3,
      });

      const projectPublicId = "notifications-project";
      await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId,
        creatorUserId: ownerUserId,
        name: "Notifications Project",
        description: "Project for notifications tests",
        category: "General",
        status: "Active",
        previousStatus: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        deletedAt: null,
        createdAt,
        updatedAt: createdAt,
      });

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        adminUserId,
        memberUserId,
        memberTwoUserId,
        projectPublicId,
      };
    });

  test("team and event dispatch respect user-scoped toggles and skip disabled transport", async () => {
    const workspace = await seedWorkspace();
    const createdAt = now();

    await t.run(async (ctx) => {
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.adminUserId,
        events: {
          eventNotifications: true,
          teamActivities: false,
          productUpdates: true,
        },
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.memberUserId,
        events: {
          eventNotifications: true,
          teamActivities: true,
          productUpdates: false,
        },
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.memberTwoUserId,
        events: {
          eventNotifications: true,
          teamActivities: true,
          productUpdates: true,
        },
        createdAt,
        updatedAt: createdAt,
      });
    });

    const teamResult = await asOwner().mutation(
      internal.notificationsEmail.sendTeamActivityForComment,
      {
        workspaceId: workspace.workspaceId,
        actorUserId: workspace.ownerUserId,
        actorName: "Owner User",
        projectPublicId: workspace.projectPublicId,
        projectName: "Notifications Project",
        commentContent: "Hello team",
        isReply: false,
      },
    );
    expect(teamResult.consideredRecipients).toBe(3);
    expect(teamResult.skippedDisabled).toBe(1);
    expect(teamResult.skippedNoEmail).toBe(1);
    expect(teamResult.skippedEmailTransport).toBe(1);
    expect(teamResult.queuedRecipients).toBe(0);
    expect(teamResult.failedRecipients).toBe(0);

    const eventResult = await asOwner().mutation(
      internal.notificationsEmail.sendProjectLifecycleEvent,
      {
        workspaceId: workspace.workspaceId,
        actorUserId: workspace.ownerUserId,
        actorName: "Owner User",
        projectPublicId: workspace.projectPublicId,
        projectName: "Notifications Project",
        eventType: "completed",
        previousStatus: "Active",
        nextStatus: "Completed",
      },
    );
    expect(eventResult.consideredRecipients).toBe(3);
    expect(eventResult.skippedDisabled).toBe(0);
    expect(eventResult.skippedNoEmail).toBe(1);
    expect(eventResult.skippedEmailTransport).toBe(2);
    expect(eventResult.queuedRecipients).toBe(0);
    expect(eventResult.failedRecipients).toBe(0);
  });

  test("notification dispatch no longer depends on NOTIFICATIONS_FROM_EMAIL", async () => {
    const workspace = await seedWorkspace();
    const previousFromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;
    delete process.env.NOTIFICATIONS_FROM_EMAIL;

    const result = await asOwner().mutation(
      internal.notificationsEmail.sendTeamActivityForComment,
      {
        workspaceId: workspace.workspaceId,
        actorUserId: workspace.ownerUserId,
        actorName: "Owner User",
        projectPublicId: workspace.projectPublicId,
        projectName: "Notifications Project",
        commentContent: "Hello team",
        isReply: false,
      },
    );

    if (previousFromEmail === undefined) {
      delete process.env.NOTIFICATIONS_FROM_EMAIL;
    } else {
      process.env.NOTIFICATIONS_FROM_EMAIL = previousFromEmail;
    }

    expect(result.queuedRecipients).toBe(0);
    expect(result.failedRecipients).toBe(0);
    expect(result.skippedEmailTransport).toBe(result.eligibleRecipients);
    expect(result.eligibleRecipients).toBeGreaterThan(0);
  });

  test("product update broadcast is admin-only and respects productUpdates toggle", async () => {
    const workspace = await seedWorkspace();
    const createdAt = now();

    await t.run(async (ctx) => {
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.ownerUserId,
        events: {
          eventNotifications: true,
          teamActivities: true,
          productUpdates: true,
        },
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("notificationPreferences", {
        userId: workspace.memberUserId,
        events: {
          eventNotifications: true,
          teamActivities: true,
          productUpdates: false,
        },
        createdAt,
        updatedAt: createdAt,
      });
    });

    await expect(
      asMember().mutation(api.notificationsEmail.sendProductUpdateBroadcast, {
        workspaceSlug: workspace.workspaceSlug,
        subject: "Release note",
        message: "This is an update",
      }),
    ).rejects.toThrow("Forbidden");

    const summary = await asAdmin().mutation(api.notificationsEmail.sendProductUpdateBroadcast, {
      workspaceSlug: workspace.workspaceSlug,
      subject: "Release note",
      message: "This is an update",
    });

    expect(summary.consideredRecipients).toBe(3);
    expect(summary.skippedDisabled).toBe(1);
    expect(summary.skippedNoEmail).toBe(1);
    expect(summary.skippedEmailTransport).toBe(1);
    expect(summary.queuedRecipients).toBe(0);
    expect(summary.failedRecipients).toBe(0);
  });

  test("comments and status transitions schedule async notification dispatches", async () => {
    const workspace = await seedWorkspace();

    const scheduledBeforeComment = await countScheduledFunctions();
    await asMember().mutation(api.comments.create, {
      projectPublicId: workspace.projectPublicId,
      content: "Trigger team activity",
    });
    const scheduledAfterComment = await countScheduledFunctions();
    expect(scheduledAfterComment).toBeGreaterThan(scheduledBeforeComment);

    const scheduledBeforeStatus = await countScheduledFunctions();
    await asAdmin().mutation(api.projects.setStatus, {
      publicId: workspace.projectPublicId,
      status: "Completed",
    });
    const scheduledAfterStatus = await countScheduledFunctions();
    expect(scheduledAfterStatus).toBeGreaterThan(scheduledBeforeStatus);
  });
});
