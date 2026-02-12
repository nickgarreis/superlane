import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "lifecycle-owner-subject" },
  admin: { subject: "lifecycle-admin-subject" },
} as const;

type SeededWorkspace = {
  workspaceId: Id<"workspaces">;
  workspaceSlug: string;
  ownerUserId: Id<"users">;
  adminUserId: Id<"users">;
};

const now = () => Date.now();

describe("projects lifecycle invariants", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);
  const asAdmin = () => t.withIdentity(IDENTITIES.admin);

  const seedWorkspace = async (): Promise<SeededWorkspace> =>
    t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Lifecycle Owner",
        createdAt,
        updatedAt: createdAt,
      });
      const adminUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.admin.subject,
        name: "Lifecycle Admin",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceSlug = "workspace-project-lifecycle";
      const workspaceId = await ctx.db.insert("workspaces", {
        slug: workspaceSlug,
        name: "Workspace Project Lifecycle",
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

      return {
        workspaceId,
        workspaceSlug,
        ownerUserId,
        adminUserId,
      };
    });

  const seedProject = async (
    workspace: SeededWorkspace,
    args: {
      publicId: string;
      status: "Draft" | "Review" | "Active" | "Completed";
      archived: boolean;
      previousStatus?: "Draft" | "Review" | "Active" | "Completed" | null;
      completedAt?: number | null;
      archivedAt?: number | null;
      lastApprovedAt?: number | null;
      deletedAt?: number | null;
      unarchivedByUserId?: Id<"users">;
    },
  ) =>
    t.run(async (ctx) => {
      const createdAt = now();
      return await ctx.db.insert("projects", {
        publicId: args.publicId,
        workspaceId: workspace.workspaceId,
        creatorUserId: workspace.ownerUserId,
        name: `Project ${args.publicId}`,
        description: "Lifecycle test project",
        category: "General",
        status: args.status,
        previousStatus: args.previousStatus ?? null,
        lastApprovedAt: args.lastApprovedAt ?? null,
        archived: args.archived,
        archivedAt: args.archivedAt ?? null,
        completedAt: args.completedAt ?? null,
        deletedAt: args.deletedAt ?? null,
        unarchivedByUserId: args.unarchivedByUserId ?? null,
        createdAt,
        updatedAt: createdAt,
      });
    });

  test("unarchive restores archived project to Active and clears completedAt", async () => {
    const workspace = await seedWorkspace();
    const completedAt = now() - 5_000;
    const archivedAt = now() - 2_500;
    const projectPublicId = "project-bugged-unarchive";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Completed",
      previousStatus: "Review",
      archived: true,
      completedAt,
      archivedAt,
    });

    await asAdmin().mutation(api.projects.unarchive, { publicId: projectPublicId });

    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row).not.toBeNull();
      expect(row?.archived).toBe(false);
      expect(row?.archivedAt).toBeNull();
      expect(row?.status).toBe("Active");
      expect(row?.previousStatus).toBeNull();
      expect(row?.completedAt).toBeNull();
      expect(row?.lastApprovedAt).toBeNull();
      expect(row?.statusUpdatedByUserId).toBe(workspace.adminUserId);
      expect(row?.unarchivedByUserId).toBe(workspace.adminUserId);
    });
  });

  test("setStatus stamps lastApprovedAt on Review -> Active and clears on other status transitions", async () => {
    const workspace = await seedWorkspace();
    const projectPublicId = "project-set-status-approval";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Review",
      archived: false,
    });

    const beforeApproval = now();
    await asOwner().mutation(api.projects.setStatus, {
      publicId: projectPublicId,
      status: "Active",
    });

    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row?.status).toBe("Active");
      expect(typeof row?.lastApprovedAt).toBe("number");
      expect(Number(row?.lastApprovedAt ?? 0)).toBeGreaterThanOrEqual(beforeApproval);
    });

    await asOwner().mutation(api.projects.setStatus, {
      publicId: projectPublicId,
      status: "Completed",
    });

    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row?.status).toBe("Completed");
      expect(row?.lastApprovedAt).toBeNull();
    });
  });

  test("update status applies Review -> Active approval timestamp semantics", async () => {
    const workspace = await seedWorkspace();
    const projectPublicId = "project-update-approval";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Review",
      archived: false,
    });

    const beforeApproval = now();
    await asOwner().mutation(api.projects.update, {
      publicId: projectPublicId,
      status: "Active",
    });

    let approvedAt = 0;
    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row?.status).toBe("Active");
      expect(typeof row?.lastApprovedAt).toBe("number");
      expect(Number(row?.lastApprovedAt ?? 0)).toBeGreaterThanOrEqual(beforeApproval);
      approvedAt = Number(row?.lastApprovedAt ?? 0);
    });

    await asOwner().mutation(api.projects.update, {
      publicId: projectPublicId,
      status: "Active",
    });
    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row?.status).toBe("Active");
      expect(row?.lastApprovedAt).toBe(approvedAt);
    });

    await asOwner().mutation(api.projects.update, {
      publicId: projectPublicId,
      status: "Review",
    });
    await t.run(async (ctx) => {
      const row = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", projectPublicId))
        .unique();
      expect(row?.status).toBe("Review");
      expect(row?.lastApprovedAt).toBeNull();
    });
  });

  test("approval seen markers are stored per-user and idempotent", async () => {
    const workspace = await seedWorkspace();
    const approvedAt = now() - 1_000;
    const projectPublicId = "project-approval-read";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Active",
      archived: false,
      lastApprovedAt: approvedAt,
    });

    const firstMark = await asOwner().mutation(api.projects.markApprovalSeen, {
      publicId: projectPublicId,
    });
    expect(firstMark.markedSeen).toBe(true);
    expect(firstMark.lastSeenApprovedAt).toBe(approvedAt);

    const secondMark = await asOwner().mutation(api.projects.markApprovalSeen, {
      publicId: projectPublicId,
    });
    expect(secondMark.markedSeen).toBe(false);
    expect(secondMark.lastSeenApprovedAt).toBe(approvedAt);

    const ownerReads = await asOwner().query(
      api.projects.listApprovalReadsForWorkspace,
      {
        workspaceSlug: workspace.workspaceSlug,
      },
    );
    expect(ownerReads).toEqual([
      {
        projectPublicId,
        lastSeenApprovedAt: approvedAt,
      },
    ]);

    const adminReadsBefore = await asAdmin().query(
      api.projects.listApprovalReadsForWorkspace,
      {
        workspaceSlug: workspace.workspaceSlug,
      },
    );
    expect(adminReadsBefore).toEqual([]);

    const adminMark = await asAdmin().mutation(api.projects.markApprovalSeen, {
      publicId: projectPublicId,
    });
    expect(adminMark.markedSeen).toBe(true);
    expect(adminMark.lastSeenApprovedAt).toBe(approvedAt);

    const adminReadsAfter = await asAdmin().query(
      api.projects.listApprovalReadsForWorkspace,
      {
        workspaceSlug: workspace.workspaceSlug,
      },
    );
    expect(adminReadsAfter).toEqual([
      {
        projectPublicId,
        lastSeenApprovedAt: approvedAt,
      },
    ]);
  });

  test("markApprovalSeen returns null timestamp when project has no approval yet", async () => {
    const workspace = await seedWorkspace();
    const projectPublicId = "project-unapproved-read";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Review",
      archived: false,
      lastApprovedAt: null,
    });

    const result = await asOwner().mutation(api.projects.markApprovalSeen, {
      publicId: projectPublicId,
    });

    expect(result.markedSeen).toBe(false);
    expect(result.lastSeenApprovedAt).toBeNull();
  });

  test("archive only accepts Active projects and rejects already archived rows", async () => {
    const workspace = await seedWorkspace();
    const completedAt = now() - 10_000;

    await seedProject(workspace, {
      publicId: "project-draft",
      status: "Draft",
      archived: false,
    });
    await seedProject(workspace, {
      publicId: "project-review",
      status: "Review",
      archived: false,
    });
    await seedProject(workspace, {
      publicId: "project-completed",
      status: "Completed",
      archived: false,
      completedAt,
    });
    await seedProject(workspace, {
      publicId: "project-active",
      status: "Active",
      archived: false,
    });
    await seedProject(workspace, {
      publicId: "project-already-archived",
      status: "Active",
      archived: true,
      archivedAt: now() - 1_000,
    });

    await expect(
      asAdmin().mutation(api.projects.archive, { publicId: "project-draft" }),
    ).rejects.toThrow("Only active projects can be archived");
    await expect(
      asAdmin().mutation(api.projects.archive, { publicId: "project-review" }),
    ).rejects.toThrow("Only active projects can be archived");
    await expect(
      asAdmin().mutation(api.projects.archive, { publicId: "project-completed" }),
    ).rejects.toThrow("Only active projects can be archived");
    await expect(
      asAdmin().mutation(api.projects.archive, {
        publicId: "project-already-archived",
      }),
    ).rejects.toThrow("Project is already archived");

    await asAdmin().mutation(api.projects.archive, { publicId: "project-active" });

    await t.run(async (ctx) => {
      const activeRow = await (ctx.db as any)
        .query("projects")
        .withIndex("by_publicId", (q: any) => q.eq("publicId", "project-active"))
        .unique();
      expect(activeRow?.archived).toBe(true);
      expect(activeRow?.previousStatus).toBe("Active");
      expect(activeRow?.archivedByUserId).toBe(workspace.adminUserId);
    });
  });

  test("unarchive rejects non-archived projects", async () => {
    const workspace = await seedWorkspace();
    const projectPublicId = "project-not-archived";
    await seedProject(workspace, {
      publicId: projectPublicId,
      status: "Active",
      archived: false,
    });

    await expect(
      asAdmin().mutation(api.projects.unarchive, { publicId: projectPublicId }),
    ).rejects.toThrow("Project is not archived");
  });

  test("cleanup mutation reports and normalizes only eligible rows", async () => {
    const workspace = await seedWorkspace();
    const deletedAt = now() - 2_000;

    await seedProject(workspace, {
      publicId: "candidate-draft",
      status: "Draft",
      archived: false,
      unarchivedByUserId: workspace.ownerUserId,
    });
    await seedProject(workspace, {
      publicId: "candidate-review",
      status: "Review",
      archived: false,
      unarchivedByUserId: workspace.ownerUserId,
    });
    await seedProject(workspace, {
      publicId: "control-active",
      status: "Active",
      archived: false,
      unarchivedByUserId: workspace.ownerUserId,
    });
    await seedProject(workspace, {
      publicId: "control-archived",
      status: "Review",
      archived: true,
      archivedAt: now() - 1_000,
      unarchivedByUserId: workspace.ownerUserId,
    });
    await seedProject(workspace, {
      publicId: "control-deleted",
      status: "Draft",
      archived: false,
      deletedAt,
      unarchivedByUserId: workspace.ownerUserId,
    });

    await expect(
      asAdmin().mutation(api.projects.normalizeUnarchivedDraftReviewToActive, {
        workspaceSlug: workspace.workspaceSlug,
        dryRun: true,
      }),
    ).rejects.toThrow("Forbidden");

    const preview = await asOwner().mutation(
      api.projects.normalizeUnarchivedDraftReviewToActive,
      {
        workspaceSlug: workspace.workspaceSlug,
        dryRun: true,
      },
    );
    expect(preview.scanned).toBe(5);
    expect(preview.eligible).toBe(2);
    expect(preview.updated).toBe(0);
    expect(new Set(preview.projectPublicIds)).toEqual(
      new Set(["candidate-draft", "candidate-review"]),
    );

    const applied = await asOwner().mutation(
      api.projects.normalizeUnarchivedDraftReviewToActive,
      {
        workspaceSlug: workspace.workspaceSlug,
      },
    );
    expect(applied.scanned).toBe(5);
    expect(applied.eligible).toBe(2);
    expect(applied.updated).toBe(2);
    expect(new Set(applied.projectPublicIds)).toEqual(
      new Set(["candidate-draft", "candidate-review"]),
    );

    await t.run(async (ctx) => {
      const projects: any[] = await (ctx.db as any)
        .query("projects")
        .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", workspace.workspaceId))
        .collect();
      const byPublicId = new Map<string, any>(
        projects.map((project: any) => [project.publicId, project]),
      );

      expect(byPublicId.get("candidate-draft")?.status).toBe("Active");
      expect(byPublicId.get("candidate-review")?.status).toBe("Active");
      expect(byPublicId.get("candidate-draft")?.completedAt).toBeNull();
      expect(byPublicId.get("candidate-review")?.completedAt).toBeNull();

      expect(byPublicId.get("control-active")?.status).toBe("Active");
      expect(byPublicId.get("control-archived")?.status).toBe("Review");
      expect(byPublicId.get("control-deleted")?.status).toBe("Draft");
    });
  });
});
