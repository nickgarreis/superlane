import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { hasRequiredWorkspaceRole } from "../lib/rbac";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-subject" },
  admin: { subject: "admin-subject" },
  member: { subject: "member-subject" },
  memberTwo: { subject: "member-two-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
  memberUserId: Id<"users">;
  memberTwoUserId: Id<"users">;
};

type SeededProject = {
  projectId: Id<"projects">;
  projectPublicId: string;
  fileId: Id<"projectFiles">;
  commentId: Id<"projectComments">;
};

const now = () => Date.now();

describe("P0.1 RBAC and soft-delete", () => {
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

      const workspaceSlug = "workspace-rbac";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace RBAC",
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

  const seedProject = async (workspace: SeededWorkspace): Promise<SeededProject> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const projectPublicId = "project-rbac";
      const projectId = await ctx.db.insert("projects", {
        publicId: projectPublicId,
        workspaceId: workspace.workspaceId,
        creatorUserId: workspace.ownerUserId,
        name: "RBAC Project",
        description: "Project used for RBAC testing",
        category: "General",
        status: "Review",
        previousStatus: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        deletedAt: null,
        createdAt,
        updatedAt: createdAt,
      });

      await ctx.db.insert("tasks", {
        workspaceId: workspace.workspaceId,
        projectId,
        projectPublicId,
        taskId: "task-1",
        title: "Task 1",
        assignee: {
          name: "Member User",
          avatar: "",
        },
        dueDateEpochMs: createdAt,
        completed: false,
        position: 0,
        createdAt,
        updatedAt: createdAt,
      });

      const fileId = await ctx.db.insert("projectFiles", {
        workspaceId: workspace.workspaceId,
        projectId,
        projectPublicId,
        tab: "Assets",
        name: "file.txt",
        type: "TXT",
        displayDateEpochMs: createdAt,
        source: "upload",
        createdAt,
        updatedAt: createdAt,
      });

      const commentId = await ctx.db.insert("projectComments", {
        workspaceId: workspace.workspaceId,
        projectId,
        projectPublicId,
        authorUserId: workspace.memberUserId,
        content: "Initial comment",
        resolved: false,
        edited: false,
        createdAt,
        updatedAt: createdAt,
      });

      return { projectId, projectPublicId, fileId, commentId };
    });

  test("role hierarchy helper enforces owner > admin > member", () => {
    expect(hasRequiredWorkspaceRole("owner", "owner")).toBe(true);
    expect(hasRequiredWorkspaceRole("owner", "admin")).toBe(true);
    expect(hasRequiredWorkspaceRole("owner", "member")).toBe(true);
    expect(hasRequiredWorkspaceRole("admin", "member")).toBe(true);
    expect(hasRequiredWorkspaceRole("admin", "owner")).toBe(false);
    expect(hasRequiredWorkspaceRole("member", "admin")).toBe(false);
  });

  test("workspace.update enforces admin minimum and owner-only organization mapping", async () => {
    const workspace = await seedWorkspace();

    await expect(
      asMember().mutation(api.workspaces.update, {
        slug: workspace.workspaceSlug,
        name: "Member cannot update",
      }),
    ).rejects.toThrow("Forbidden");

    await asAdmin().mutation(api.workspaces.update, {
      slug: workspace.workspaceSlug,
      name: "Updated by admin",
    });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(workspace.workspaceId);
      expect(row?.name).toBe("Updated by admin");
      expect(row?.updatedByUserId).toBe(workspace.adminUserId);
    });

    await expect(
      asAdmin().mutation(api.workspaces.update, {
        slug: workspace.workspaceSlug,
        workosOrganizationId: "org_admin_denied",
      }),
    ).rejects.toThrow("Forbidden");

    await asOwner().mutation(api.workspaces.update, {
      slug: workspace.workspaceSlug,
      workosOrganizationId: "org_owner_allowed",
    });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(workspace.workspaceId);
      expect(row?.workosOrganizationId).toBe("org_owner_allowed");
      expect(row?.updatedByUserId).toBe(workspace.ownerUserId);
    });
  });

  test("project lifecycle mutations require admin/owner and track actor fields", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    await expect(
      asMember().mutation(api.projects.setStatus, {
        publicId: project.projectPublicId,
        status: "Active",
      }),
    ).rejects.toThrow("Forbidden");

    await expect(
      asAdmin().mutation(api.projects.setStatus, {
        publicId: project.projectPublicId,
        status: "Active",
      }),
    ).rejects.toThrow("Forbidden");

    await asOwner().mutation(api.projects.setStatus, {
      publicId: project.projectPublicId,
      status: "Active",
    });

    await asAdmin().mutation(api.projects.archive, { publicId: project.projectPublicId });

    await asOwner().mutation(api.projects.unarchive, { publicId: project.projectPublicId });

    await asAdmin().mutation(api.projects.setStatus, {
      publicId: project.projectPublicId,
      status: "Completed",
    });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(project.projectId);
      expect(row?.status).toBe("Completed");
      expect(row?.statusUpdatedByUserId).toBe(workspace.adminUserId);
      expect(row?.archivedByUserId).toBe(workspace.adminUserId);
      expect(row?.unarchivedByUserId).toBe(workspace.ownerUserId);
    });

    await expect(
      asMember().mutation(api.projects.remove, { publicId: project.projectPublicId }),
    ).rejects.toThrow("Forbidden");

    await asOwner().mutation(api.projects.remove, { publicId: project.projectPublicId });

    await t.run(async (ctx) => {
      const projectRow = await ctx.db.get(project.projectId);
      expect(projectRow).not.toBeNull();
      expect(projectRow?.deletedAt).not.toBeNull();
      expect(projectRow?.deletedByUserId).toBe(workspace.ownerUserId);

      const taskRows = await ctx.db
        .query("tasks")
        .collect();
      const fileRows = await ctx.db
        .query("projectFiles")
        .collect();
      const commentRows = await ctx.db
        .query("projectComments")
        .collect();
      expect(taskRows.filter((row) => row.projectId === project.projectId).length).toBeGreaterThan(0);
      expect(fileRows.filter((row) => row.projectId === project.projectId).length).toBeGreaterThan(0);
      expect(commentRows.filter((row) => row.projectId === project.projectId).length).toBeGreaterThan(0);
    });

    const snapshot = await asOwner().query(api.dashboard.getSnapshot, {
      activeWorkspaceSlug: workspace.workspaceSlug,
    });
    expect(snapshot.projects).toHaveLength(0);
    expect(snapshot.tasks).toHaveLength(0);

    const files = await asOwner().query(api.files.listForWorkspace, {
      workspaceSlug: workspace.workspaceSlug,
      paginationOpts: { cursor: null, numItems: 200 },
    });
    expect(files.page).toHaveLength(0);

    await expect(
      asOwner().mutation(api.tasks.replaceForProject, {
        projectPublicId: project.projectPublicId,
        tasks: [],
      }),
    ).rejects.toThrow("Project not found");
    await expect(
      asOwner().query(api.comments.listForProject, {
        projectPublicId: project.projectPublicId,
      }),
    ).rejects.toThrow("Project not found");
    await expect(
      asOwner().mutation(api.files.remove, {
        fileId: project.fileId,
      }),
    ).rejects.toThrow("Project not found");
  });

  test("project collaboration updates allow members but protect status transitions", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    await asMember().mutation(api.projects.update, {
      publicId: project.projectPublicId,
      name: "Member updated name",
    });

    await asMember().mutation(api.projects.updateReviewComments, {
      publicId: project.projectPublicId,
      comments: [
        {
          id: "review-1",
          author: {
            name: "Member User",
            avatar: "",
          },
          content: "Looks good",
          timestamp: "now",
        },
      ],
    });

    await expect(
      asMember().mutation(api.projects.update, {
        publicId: project.projectPublicId,
        status: "Completed",
      }),
    ).rejects.toThrow("Forbidden");

    await asAdmin().mutation(api.projects.update, {
      publicId: project.projectPublicId,
      status: "Completed",
    });

    await expect(
      asMember().mutation(api.tasks.replaceForProject, {
        projectPublicId: project.projectPublicId,
        tasks: [
          {
            id: "task-1",
            title: "Member cannot mutate completed tasks",
            assignee: {
              name: "Member User",
              avatar: "",
            },
            dueDateEpochMs: null,
            completed: false,
          },
        ],
      }),
    ).rejects.toThrow("Tasks can only be modified for active projects");

    await t.run(async (ctx) => {
      const row = await ctx.db.get(project.projectId);
      expect(row?.name).toBe("Member updated name");
      expect(row?.updatedByUserId).toBe(workspace.adminUserId);
      expect(row?.status).toBe("Completed");
      expect(row?.statusUpdatedByUserId).toBe(workspace.adminUserId);
    });
  });

  test("review comments only allow author updates/removals", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);
    const memberComment = {
      id: "review-1",
      author: {
        userId: String(workspace.memberUserId),
        name: "Member User",
        avatar: "",
      },
      content: "Looks good",
      timestamp: "now",
    };

    await asMember().mutation(api.projects.updateReviewComments, {
      publicId: project.projectPublicId,
      comments: [memberComment],
    });

    await expect(
      asMemberTwo().mutation(api.projects.updateReviewComments, {
        publicId: project.projectPublicId,
        comments: [],
      }),
    ).rejects.toThrow("Forbidden");

    await expect(
      asAdmin().mutation(api.projects.updateReviewComments, {
        publicId: project.projectPublicId,
        comments: [{ ...memberComment, content: "Admin cannot edit others" }],
      }),
    ).rejects.toThrow("Forbidden");

    await expect(
      asAdmin().mutation(api.projects.update, {
        publicId: project.projectPublicId,
        reviewComments: [{ ...memberComment, content: "Admin cannot edit through projects.update" }],
      }),
    ).rejects.toThrow("Forbidden");

    await asMemberTwo().mutation(api.projects.updateReviewComments, {
      publicId: project.projectPublicId,
      comments: [
        memberComment,
        {
          id: "review-2",
          author: {
            name: "Member Two User",
            avatar: "",
          },
          content: "Member two comment",
          timestamp: "now",
        },
      ],
    });

    await asMemberTwo().mutation(api.projects.updateReviewComments, {
      publicId: project.projectPublicId,
      comments: [memberComment],
    });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(project.projectId);
      expect(row?.reviewComments).toEqual([memberComment]);
    });
  });

  test("comments only allow author edits/removals/resolution", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    const { commentId } = await asMember().mutation(api.comments.create, {
      projectPublicId: project.projectPublicId,
      content: "Fresh comment",
    });

    await expect(asMemberTwo().mutation(api.comments.toggleResolved, { commentId })).rejects.toThrow(
      "Forbidden",
    );

    await expect(asAdmin().mutation(api.comments.toggleResolved, { commentId })).rejects.toThrow(
      "Forbidden",
    );

    await asMember().mutation(api.comments.toggleResolved, { commentId });

    await asMember().mutation(api.comments.update, {
      commentId,
      content: "Author edit",
    });

    await expect(
      asMemberTwo().mutation(api.comments.update, {
        commentId,
        content: "Member two cannot edit",
      }),
    ).rejects.toThrow("Forbidden");

    await expect(
      asAdmin().mutation(api.comments.update, {
        commentId,
        content: "Admin override edit",
      }),
    ).rejects.toThrow("Forbidden");

    await expect(asMemberTwo().mutation(api.comments.remove, { commentId })).rejects.toThrow("Forbidden");
    await expect(asAdmin().mutation(api.comments.remove, { commentId })).rejects.toThrow("Forbidden");

    await asMember().mutation(api.comments.remove, { commentId });

    await t.run(async (ctx) => {
      const row = await ctx.db.get(commentId as Id<"projectComments">);
      expect(row).toBeNull();
    });
  });

  test("forbidden responses remain ConvexError Forbidden for role denials", async () => {
    const workspace = await seedWorkspace();
    const project = await seedProject(workspace);

    const denied = await asMember()
      .mutation(api.projects.archive, { publicId: project.projectPublicId })
      .then(
        () => null,
        (error) => error,
      );

    expect(String((denied as Error)?.message ?? denied)).toContain("Forbidden");
  });
});
