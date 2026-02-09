import { convexTest } from "convex-test";
import workosAuthKitTest from "@convex-dev/workos-authkit/test";
import { beforeEach, describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import {
  parseDisplayDateEpochMs,
  parseProjectDeadlineEpochMs,
  parseTaskDueDateEpochMs,
} from "../lib/dateNormalization";

const modules = Object.fromEntries(
  Object.entries(import.meta.glob("../**/*.{ts,tsx}")).filter(
    ([path]) => !path.includes("/__tests__/"),
  ),
) as Record<string, () => Promise<unknown>>;

const IDENTITIES = {
  owner: { subject: "owner-date-normalization-subject" },
} as const;

const now = () => Date.now();

describe("P2.1 date normalization", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
    workosAuthKitTest.register(t, "workOSAuthKit");
  });

  const asOwner = () => t.withIdentity(IDENTITIES.owner);

  test("parsers cover expected legacy formats and invalid inputs", () => {
    const isoEpoch = parseProjectDeadlineEpochMs("2026-02-09T00:00:00.000Z");
    const shortDotEpoch = parseProjectDeadlineEpochMs("09.02.26");
    const longDotEpoch = parseProjectDeadlineEpochMs("09.02.2026");
    const createdAt = Date.UTC(2026, 1, 1, 12, 0, 0, 0);
    const lateYearCreatedAt = Date.UTC(2026, 11, 30, 12, 0, 0, 0);
    const taskEpoch = parseTaskDueDateEpochMs("Feb 9", createdAt);
    const nextYearTaskEpoch = parseTaskDueDateEpochMs("Jan 15", lateYearCreatedAt);
    const fallbackDisplayEpoch = Date.UTC(2026, 1, 1, 12, 0, 0, 0);

    expect(isoEpoch).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
    expect(shortDotEpoch).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
    expect(longDotEpoch).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
    expect(taskEpoch).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
    expect(nextYearTaskEpoch).toBe(Date.UTC(2027, 0, 15, 12, 0, 0, 0));
    expect(parseTaskDueDateEpochMs("No date", createdAt)).toBeNull();
    expect(parseProjectDeadlineEpochMs("invalid")).toBeNull();
    expect(parseDisplayDateEpochMs("invalid", createdAt)).toBeNull();
    expect(parseDisplayDateEpochMs(Number.NaN, fallbackDisplayEpoch)).toBe(fallbackDisplayEpoch);
    expect(parseDisplayDateEpochMs(Number.POSITIVE_INFINITY, Number.NaN)).toBeNull();
  });

  test("preview/apply migration is idempotent for missing canonical fields", async () => {
    await t.run(async (ctx) => {
      const createdAt = now();
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "workspace-date-normalization",
        name: "Workspace Date Normalization",
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

      const projectId = await ctx.db.insert("projects", {
        publicId: "project-date-normalization",
        workspaceId,
        creatorUserId: ownerUserId,
        name: "Date Normalization Project",
        description: "Coverage for normalization action",
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
        workspaceId,
        projectId,
        projectPublicId: "project-date-normalization",
        taskId: "task-1",
        title: "Task 1",
        assignee: {
          name: "Owner User",
          avatar: "",
        },
        completed: false,
        position: 0,
        createdAt,
        updatedAt: createdAt,
      });
    });

    const previewBefore = await asOwner().action(api.dateNormalization.previewDateNormalization, {
      batchSize: 100,
    });
    expect(previewBefore.patchCount).toBeGreaterThan(0);

    const applied = await asOwner().action(api.dateNormalization.applyDateNormalization, {
      batchSize: 100,
    });
    expect(applied.patchedCount).toBe(previewBefore.patchCount);

    const previewAfter = await asOwner().action(api.dateNormalization.previewDateNormalization, {
      batchSize: 100,
    });
    expect(previewAfter.patchCount).toBe(0);
  });

  test("normalization actions require authentication", async () => {
    await expect(
      t.action(api.dateNormalization.previewDateNormalization, {}),
    ).rejects.toThrow("Unauthorized");
  });

  test("apply removes legacy date keys while preserving canonical values", async () => {
    let projectId: any = null;
    let taskId: any = null;
    let fileId: any = null;
    let legacyCreatedAt = 0;

    await t.run(async (ctx) => {
      const createdAt = now();
      legacyCreatedAt = createdAt;
      const ownerUserId = await ctx.db.insert("users", {
        workosUserId: IDENTITIES.owner.subject,
        name: "Owner User",
        createdAt,
        updatedAt: createdAt,
      });

      const workspaceId = await ctx.db.insert("workspaces", {
        slug: "workspace-date-normalization-legacy",
        name: "Workspace Date Normalization Legacy",
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

      projectId = await ctx.db.insert("projects", {
        publicId: "project-date-normalization-legacy",
        workspaceId,
        creatorUserId: ownerUserId,
        name: "Legacy Date Project",
        description: "Legacy date fields should be removed",
        category: "General",
        status: "Review",
        previousStatus: null,
        archived: false,
        archivedAt: null,
        completedAt: null,
        deletedAt: null,
        deadline: "23.02.26",
        draftData: {
          selectedService: "Brand",
          projectName: "Legacy",
          selectedJob: "Audit",
          description: "",
          isAIEnabled: false,
          deadline: "23.02.26",
          lastStep: 2,
        },
        attachments: [{
          id: "legacy-attachment",
          name: "Legacy File",
          type: "png",
          date: "2026-02-09T12:00:00.000Z",
          img: "/legacy.png",
        }],
        createdAt,
        updatedAt: createdAt,
      });

      taskId = await ctx.db.insert("tasks", {
        workspaceId,
        projectId,
        projectPublicId: "project-date-normalization-legacy",
        taskId: "legacy-task",
        title: "Legacy Task",
        assignee: {
          name: "Owner User",
          avatar: "",
        },
        dueDate: "Feb 9",
        completed: false,
        position: 0,
        createdAt,
        updatedAt: createdAt,
      });

      fileId = await ctx.db.insert("projectFiles", {
        workspaceId,
        projectId,
        projectPublicId: "project-date-normalization-legacy",
        tab: "Assets",
        name: "legacy.fig",
        type: "fig",
        displayDateEpochMs: createdAt,
        displayDate: "2026-02-09T12:00:00.000Z",
        deletedAt: null,
        purgeAfterAt: null,
        createdAt,
        updatedAt: createdAt,
      });
    });

    await asOwner().action(api.dateNormalization.applyDateNormalization, {
      batchSize: 100,
    });

    await t.run(async (ctx) => {
      const project = await ctx.db.get(projectId);
      const task = await ctx.db.get(taskId);
      const file = await ctx.db.get(fileId);

      expect(project).not.toBeNull();
      expect(task).not.toBeNull();
      expect(file).not.toBeNull();

      expect(project?.deadlineEpochMs).toBe(Date.UTC(2026, 1, 23, 12, 0, 0, 0));
      expect("deadline" in (project as Record<string, unknown>)).toBe(false);
      expect(project?.draftData?.deadlineEpochMs).toBe(Date.UTC(2026, 1, 23, 12, 0, 0, 0));
      expect("deadline" in (project?.draftData as Record<string, unknown>)).toBe(false);
      expect(project?.attachments?.[0]?.dateEpochMs).toBe(Date.parse("2026-02-09T12:00:00.000Z"));
      expect("date" in (project?.attachments?.[0] as Record<string, unknown>)).toBe(false);

      expect(task?.dueDateEpochMs).toBe(Date.UTC(2026, 1, 9, 12, 0, 0, 0));
      expect("dueDate" in (task as Record<string, unknown>)).toBe(false);

      expect(file?.displayDateEpochMs).toBe(legacyCreatedAt);
      expect("displayDate" in (file as Record<string, unknown>)).toBe(false);
    });
  });
});
