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
  owner: { subject: "owner-read-state-subject" },
  member: { subject: "member-read-state-subject" },
  memberTwo: { subject: "member-two-read-state-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  memberUserId: Id<"users">;
  memberTwoUserId: Id<"users">;
};

const now = () => Date.now();

describe("activities read state", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asMember = () => t.withIdentity(IDENTITIES.member);
  const asMemberTwo = () => t.withIdentity(IDENTITIES.memberTwo);

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });
      const memberUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.member.subject,
        name: "Member User",
        createdAt,
        updatedAt: createdAt,
      });
      const memberTwoUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.memberTwo.subject,
        name: "Member Two User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-read-state";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Read State",
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
        userId: memberUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: memberTwoUserId,
        role: "member",
        status: "active",
        joinedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        memberUserId,
        memberTwoUserId,
      };
    });

  test("legacy workspace counters can be initialized once and reused by getUnreadSummary", async () => {
    const seeded = await seedWorkspace();
    const createdAt = now();

    await t.run(async (ctx) => {
      await ctx.db.insert("workspaceActivityEvents", {
        workspaceId: seeded.workspaceId,
        kind: "workspace",
        action: "legacy_event_seed",
        actorType: "system",
        actorName: "System",
        createdAt,
      });
    });

    const summaryBeforeInitialize = await asOwner().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(summaryBeforeInitialize.unreadCount).toBe(0);

    const initialized = await asOwner().mutation(api.activities.initializeWorkspaceActivityCount, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(initialized.activityEventCount).toBe(1);

    const summaryAfterInitialize = await asOwner().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(summaryAfterInitialize.unreadCount).toBe(1);

    const workspaceAfterInitialize = await t.run(async (ctx) => ctx.db.get(seeded.workspaceId));
    expect(workspaceAfterInitialize?.activityEventCount).toBe(1);
  });

  test("internal backfill initializes legacy activity count for large workspaces", async () => {
    const seeded = await seedWorkspace();
    const createdAt = now();
    const legacyEventCount = 300;

    await t.run(async (ctx) => {
      for (let index = 0; index < legacyEventCount; index += 1) {
        await ctx.db.insert("workspaceActivityEvents", {
          workspaceId: seeded.workspaceId,
          kind: "workspace",
          action: "legacy_backfill_seed",
          actorType: "system",
          actorName: "System",
          createdAt: createdAt + index,
        });
      }
    });

    const backfill = await asOwner().mutation(
      internal.activities.internalBackfillWorkspaceActivityCounts,
      { maxWorkspaces: 25 },
    );
    expect(backfill.updatedWorkspaceCount).toBe(1);

    const workspaceAfterBackfill = await t.run(async (ctx) => ctx.db.get(seeded.workspaceId));
    expect(workspaceAfterBackfill?.activityEventCount).toBe(legacyEventCount);
  });

  test("historical activities are unread by default and markActivityRead is idempotent", async () => {
    const seeded = await seedWorkspace();

    const createdProject = await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId: "project-read-state-1",
      name: "Read State Project",
      description: "",
      category: "General",
      status: "Active",
    });

    await asOwner().mutation(api.tasks.create, {
      workspaceSlug: seeded.workspaceSlug,
      id: "task-read-state-1",
      title: "Seed a task activity",
      assignee: {
        userId: String(seeded.memberUserId),
        name: "Member User",
        avatar: "",
      },
      completed: false,
      projectPublicId: "project-read-state-1",
    });

    expect(createdProject.publicId).toBe("project-read-state-1");

    const initialSummary = await asMember().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(initialSummary.unreadCount).toBeGreaterThanOrEqual(2);

    const initialFeed = await asMember().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(initialFeed.page.length).toBeGreaterThanOrEqual(2);
    expect(initialFeed.page.every((entry) => entry.isRead === false)).toBe(true);

    const activityToRead = initialFeed.page[0];
    const firstRead = await asMember().mutation(api.activities.markActivityRead, {
      workspaceSlug: seeded.workspaceSlug,
      activityEventId: activityToRead.id as Id<"workspaceActivityEvents">,
    });
    const secondRead = await asMember().mutation(api.activities.markActivityRead, {
      workspaceSlug: seeded.workspaceSlug,
      activityEventId: activityToRead.id as Id<"workspaceActivityEvents">,
    });

    expect(firstRead.alreadyRead).toBe(false);
    expect(secondRead.alreadyRead).toBe(true);

    const nextSummary = await asMember().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(nextSummary.unreadCount).toBe(initialSummary.unreadCount - 1);

    const nextFeed = await asMember().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    const nextActivity = nextFeed.page.find((entry) => entry.id === activityToRead.id);
    expect(nextActivity?.isRead).toBe(true);
  });

  test("markAllRead zeroes unread count and new activities become unread again", async () => {
    const seeded = await seedWorkspace();

    await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId: "project-read-state-2",
      name: "Mark All Project",
      description: "",
      category: "General",
      status: "Active",
    });

    const beforeSummary = await asOwner().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(beforeSummary.unreadCount).toBeGreaterThan(0);

    const markAllResult = await asOwner().mutation(api.activities.markAllRead, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(markAllResult.unreadCount).toBe(0);

    const afterMarkAllSummary = await asOwner().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(afterMarkAllSummary.unreadCount).toBe(0);

    await asOwner().mutation(api.tasks.create, {
      workspaceSlug: seeded.workspaceSlug,
      id: "task-read-state-2",
      title: "Unread after mark all",
      assignee: {
        userId: String(seeded.memberUserId),
        name: "Member User",
        avatar: "",
      },
      completed: false,
      projectPublicId: "project-read-state-2",
    });

    const afterNewEventSummary = await asOwner().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(afterNewEventSummary.unreadCount).toBe(1);

    const feedAfterNewEvent = await asOwner().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(feedAfterNewEvent.page[0]?.isRead).toBe(false);
  });

  test("read state is isolated per user", async () => {
    const seeded = await seedWorkspace();

    await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId: "project-read-state-3",
      name: "Isolation Project",
      description: "",
      category: "General",
      status: "Active",
    });

    const memberSummaryBefore = await asMember().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    const memberTwoSummaryBefore = await asMemberTwo().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    expect(memberSummaryBefore.unreadCount).toBe(memberTwoSummaryBefore.unreadCount);
    expect(memberSummaryBefore.unreadCount).toBeGreaterThan(0);

    const memberFeedBefore = await asMember().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    const targetActivityId = memberFeedBefore.page[0]?.id;
    expect(targetActivityId).toBeTruthy();

    await asMember().mutation(api.activities.markActivityRead, {
      workspaceSlug: seeded.workspaceSlug,
      activityEventId: targetActivityId as Id<"workspaceActivityEvents">,
    });

    const memberSummaryAfter = await asMember().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });
    const memberTwoSummaryAfter = await asMemberTwo().query(api.activities.getUnreadSummary, {
      workspaceSlug: seeded.workspaceSlug,
    });

    expect(memberSummaryAfter.unreadCount).toBe(memberSummaryBefore.unreadCount - 1);
    expect(memberTwoSummaryAfter.unreadCount).toBe(memberTwoSummaryBefore.unreadCount);

    const memberFeedAfter = await asMember().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    const memberTwoFeedAfter = await asMemberTwo().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });

    const memberEntry = memberFeedAfter.page.find((entry) => entry.id === targetActivityId);
    const memberTwoEntry = memberTwoFeedAfter.page.find((entry) => entry.id === targetActivityId);

    expect(memberEntry?.isRead).toBe(true);
    expect(memberTwoEntry?.isRead).toBe(false);
  });
});
