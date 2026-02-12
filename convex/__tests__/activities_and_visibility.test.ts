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
  owner: { subject: "owner-activities-subject" },
  admin: { subject: "admin-activities-subject" },
  member: { subject: "member-activities-subject" },
  memberTwo: { subject: "member-two-activities-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
  memberUserId: Id<"users">;
  memberTwoUserId: Id<"users">;
};

const now = () => Date.now();

describe("activities access and project lifecycle events", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asAdmin = () => t.withIdentity(IDENTITIES.admin);
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
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Admin User",
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

      const workspaceSlug = "workspace-activities";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Activities",
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
        adminUserId,
        memberUserId,
        memberTwoUserId,
      };
    });

  test("all workspace members can see workspace projects/tasks/files/activities", async () => {
    const seeded = await seedWorkspace();
    const publicId = "workspace-visible-project";
    const createdProject = await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId,
      name: "Workspace Visible Project",
      description: "",
      category: "General",
      status: "Active",
    });

    await asOwner().mutation(api.tasks.create, {
      workspaceSlug: seeded.workspaceSlug,
      id: "workspace-task-1",
      title: "Workspace task",
      assignee: { userId: String(seeded.memberUserId), name: "Member User", avatar: "" },
      completed: false,
      projectPublicId: publicId,
    });

    await t.run(async (ctx) => {
      const createdAt = now();
      await ctx.db.insert("projectFiles", {
        workspaceId: seeded.workspaceId,
        projectId: createdProject.projectId as Id<"projects">,
        projectPublicId: publicId,
        projectDeletedAt: null,
        tab: "Assets",
        name: "workspace-asset.pdf",
        type: "PDF",
        displayDateEpochMs: createdAt,
        source: "upload",
        deletedAt: null,
        purgeAfterAt: null,
        createdAt,
        updatedAt: createdAt,
      });
    });

    const memberTwoProjects = await asMemberTwo().query(api.projects.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      includeArchived: false,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(memberTwoProjects.page.map((entry) => entry.publicId)).toContain(publicId);

    const memberProjects = await asMember().query(api.projects.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      includeArchived: false,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(memberProjects.page.map((entry) => entry.publicId)).toContain(publicId);

    const adminProjects = await asAdmin().query(api.projects.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      includeArchived: false,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(adminProjects.page.map((entry) => entry.publicId)).toContain(publicId);

    const memberTwoTasks = await asMemberTwo().query(api.tasks.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(memberTwoTasks.page.map((entry) => entry.taskId)).toContain("workspace-task-1");

    const memberTasks = await asMember().query(api.tasks.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(memberTasks.page.map((entry) => entry.taskId)).toContain("workspace-task-1");

    const memberTwoFiles = await asMemberTwo().query(api.files.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(memberTwoFiles.page.map((entry) => entry.name)).toContain("workspace-asset.pdf");

    const adminFiles = await asAdmin().query(api.files.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(adminFiles.page.map((entry) => entry.name)).toContain("workspace-asset.pdf");

    const memberTwoActivities = await asMemberTwo().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(memberTwoActivities.page.length).toBeGreaterThan(0);

    const memberActivities = await asMember().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(memberActivities.page.length).toBeGreaterThan(0);
  });

  test("project activity stream includes create/rename and excludes owner or visibility change actions", async () => {
    const seeded = await seedWorkspace();
    const publicId = "project-lifecycle";
    await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId,
      name: "Lifecycle Project",
      description: "",
      category: "General",
      status: "Active",
    });

    await asOwner().mutation(api.tasks.create, {
      workspaceSlug: seeded.workspaceSlug,
      id: "task-propagation-1",
      title: "Initial task",
      assignee: { userId: String(seeded.ownerUserId), name: "Owner User", avatar: "" },
      completed: false,
      projectPublicId: publicId,
    });

    await t.run(async (ctx) => {
      const project = (await ctx.db.query("projects").collect()).find(
        (row) => row.publicId === publicId,
      );
      if (!project) {
        throw new Error("Expected project row");
      }

      const createdAt = now();
      await ctx.db.insert("projectFiles", {
        workspaceId: seeded.workspaceId,
        projectId: project._id,
        projectPublicId: publicId,
        projectDeletedAt: null,
        tab: "Assets",
        name: "lifecycle-file.pdf",
        type: "PDF",
        displayDateEpochMs: createdAt,
        source: "upload",
        deletedAt: null,
        purgeAfterAt: null,
        createdAt,
        updatedAt: createdAt,
      });
    });

    await asOwner().mutation(api.projects.update, {
      publicId,
      name: "Lifecycle Project Renamed",
    });

    const activityFeed = await asOwner().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
      kinds: ["project"],
    });
    const projectActions = activityFeed.page
      .filter((entry) => entry.projectPublicId === publicId)
      .map((entry) => entry.action);
    expect(projectActions).toContain("created");
    expect(projectActions).toContain("renamed");
    expect(projectActions).not.toContain("owner_changed");
    expect(projectActions).not.toContain("visibility_changed");
  });

  test("internal upload failure logging inserts file.upload_failed activity", async () => {
    const seeded = await seedWorkspace();
    const publicId = "project-upload-failure";
    await asOwner().mutation(api.projects.create, {
      workspaceSlug: seeded.workspaceSlug,
      publicId,
      name: "Upload Failure Project",
      description: "",
      category: "General",
      status: "Active",
    });

    await t.mutation(internal.files.internalLogUploadFailure, {
      projectPublicId: publicId,
      fileName: "failure.pdf",
      fileTab: "Assets",
      errorCode: "signature_check_failed",
    });

    const activityFeed = await asOwner().query(api.activities.listForWorkspace, {
      workspaceSlug: seeded.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 100 },
      kinds: ["file"],
    });
    const uploadFailureEvent = activityFeed.page.find(
      (entry) =>
        entry.action === "upload_failed" &&
        entry.projectPublicId === publicId &&
        entry.fileName === "failure.pdf",
    );
    expect(uploadFailureEvent).toBeDefined();
    expect(uploadFailureEvent?.actorType).toBe("system");
    expect(uploadFailureEvent?.errorCode).toBe("signature_check_failed");
  });
});
