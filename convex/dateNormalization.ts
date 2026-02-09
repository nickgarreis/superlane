import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action, internalMutation, internalQuery } from "./_generated/server";
import {
  parseDisplayDateEpochMs,
  parseProjectDeadlineEpochMs,
  parseTaskDueDateEpochMs,
} from "./lib/dateNormalization";
import { requireAuthUser } from "./lib/auth";

const assertDateNormalizationAuthRef = makeFunctionReference<"query">(
  "dateNormalization:internalAssertDateNormalizationAuth",
);
const previewDateNormalizationRef = makeFunctionReference<"query">(
  "dateNormalization:internalPreviewDateNormalization",
);
const applyDateNormalizationRef = makeFunctionReference<"mutation">(
  "dateNormalization:internalApplyDateNormalization",
);

type NormalizationFailure = {
  table: "projects" | "tasks" | "projectFiles" | "workspaceBrandAssets";
  rowId: string;
  field: string;
  rawValue: string;
  reason: string;
};

type NormalizationPlan = {
  patches: Array<{ table: "projects" | "tasks" | "projectFiles" | "workspaceBrandAssets"; rowId: any; patch: any }>;
  failures: NormalizationFailure[];
  scanned: Record<"projects" | "tasks" | "projectFiles" | "workspaceBrandAssets", number>;
};

const MAX_SAMPLE_FAILURES = 25;
const MAX_BATCH_SIZE = 2_000;

const normalizeBatchSize = (value: number | undefined) =>
  Math.max(1, Math.min(value ?? 500, MAX_BATCH_SIZE));

const isFiniteEpochMs = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const hasOwn = (value: unknown, key: string): boolean =>
  !!value && Object.prototype.hasOwnProperty.call(value, key);

const normalizeProjectDraftData = (
  draftData: any,
  projectId: string,
  failures: NormalizationFailure[],
) => {
  if (!draftData || typeof draftData !== "object") {
    return draftData;
  }

  const currentEpoch = draftData.deadlineEpochMs;
  if (isFiniteEpochMs(currentEpoch) || currentEpoch === null) {
    if ("deadline" in draftData) {
      const { deadline, ...rest } = draftData;
      return { ...rest, deadlineEpochMs: currentEpoch ?? null };
    }
    return draftData;
  }

  const rawDeadline = asNonEmptyString(draftData.deadline);
  const parsedDeadline = parseProjectDeadlineEpochMs(rawDeadline);
  if (rawDeadline && parsedDeadline === null && failures.length < MAX_SAMPLE_FAILURES) {
    failures.push({
      table: "projects",
      rowId: projectId,
      field: "draftData.deadline",
      rawValue: rawDeadline,
      reason: "Could not parse draft deadline",
    });
  }

  const { deadline, ...rest } = draftData;
  return {
    ...rest,
    deadlineEpochMs: parsedDeadline ?? null,
  };
};

const normalizeProjectAttachments = (
  attachments: any,
  projectId: string,
  failures: NormalizationFailure[],
) => {
  if (!Array.isArray(attachments)) {
    return attachments;
  }

  return attachments.map((entry: any, index: number) => {
    const currentEpoch = entry?.dateEpochMs;
    if (isFiniteEpochMs(currentEpoch) || currentEpoch === null) {
      const { date, ...rest } = entry ?? {};
      return {
        ...rest,
        dateEpochMs: currentEpoch ?? null,
      };
    }

    const rawDate = asNonEmptyString(entry?.date);
    const parsedDate = parseDisplayDateEpochMs(rawDate, Date.now());
    if (rawDate && parsedDate === null && failures.length < MAX_SAMPLE_FAILURES) {
      failures.push({
        table: "projects",
        rowId: projectId,
        field: `attachments[${index}].date`,
        rawValue: rawDate,
        reason: "Could not parse attachment display date",
      });
    }

    const { date, ...rest } = entry ?? {};
    return {
      ...rest,
      dateEpochMs: parsedDate ?? null,
    };
  });
};

const buildNormalizationPlan = async (ctx: any, batchSize: number): Promise<NormalizationPlan> => {
  const failures: NormalizationFailure[] = [];
  const patches: NormalizationPlan["patches"] = [];

  const projectRows = await ctx.db.query("projects").take(batchSize);
  for (const row of projectRows) {
    const patch: Record<string, unknown> = {};
    let shouldPatch = false;
    const rowId = String(row._id);
    const hasLegacyDeadline = hasOwn(row, "deadline");

    if (!isFiniteEpochMs(row.deadlineEpochMs) && row.deadlineEpochMs !== null) {
      const rawDeadline = asNonEmptyString((row as any).deadline);
      const parsedDeadline = parseProjectDeadlineEpochMs(rawDeadline);
      patch.deadlineEpochMs = parsedDeadline ?? null;
      shouldPatch = true;

      if (rawDeadline && parsedDeadline === null && failures.length < MAX_SAMPLE_FAILURES) {
        failures.push({
          table: "projects",
          rowId,
          field: "deadline",
          rawValue: rawDeadline,
          reason: "Could not parse project deadline",
        });
      }
    }

    if (hasLegacyDeadline) {
      patch.deadline = undefined;
      shouldPatch = true;
    }

    if (row.draftData && typeof row.draftData === "object") {
      const normalizedDraftData = normalizeProjectDraftData(row.draftData, rowId, failures);
      if (JSON.stringify(normalizedDraftData) !== JSON.stringify(row.draftData)) {
        patch.draftData = normalizedDraftData;
        shouldPatch = true;
      }
    }

    if (Array.isArray(row.attachments)) {
      const normalizedAttachments = normalizeProjectAttachments(row.attachments, rowId, failures);
      if (JSON.stringify(normalizedAttachments) !== JSON.stringify(row.attachments)) {
        patch.attachments = normalizedAttachments;
        shouldPatch = true;
      }
    }

    if (shouldPatch) {
      patches.push({ table: "projects", rowId: row._id, patch });
    }
  }

  const taskRows = await ctx.db.query("tasks").take(batchSize);
  for (const row of taskRows) {
    const hasLegacyDueDate = hasOwn(row, "dueDate");

    if (isFiniteEpochMs(row.dueDateEpochMs) || row.dueDateEpochMs === null) {
      if (hasLegacyDueDate) {
        patches.push({
          table: "tasks",
          rowId: row._id,
          patch: { dueDate: undefined },
        });
      }
      continue;
    }

    const rawDueDate = asNonEmptyString((row as any).dueDate);
    const parsedDueDate = parseTaskDueDateEpochMs(rawDueDate, row.createdAt);
    const patch: Record<string, unknown> = {
      dueDateEpochMs: parsedDueDate ?? null,
    };
    if (hasLegacyDueDate) {
      patch.dueDate = undefined;
    }
    patches.push({
      table: "tasks",
      rowId: row._id,
      patch,
    });

    if (
      rawDueDate
      && rawDueDate.toLowerCase() !== "no date"
      && parsedDueDate === null
      && failures.length < MAX_SAMPLE_FAILURES
    ) {
      failures.push({
        table: "tasks",
        rowId: String(row._id),
        field: "dueDate",
        rawValue: rawDueDate,
        reason: "Could not parse task due date",
      });
    }
  }

  const fileRows = await ctx.db.query("projectFiles").take(batchSize);
  for (const row of fileRows) {
    const hasLegacyDisplayDate = hasOwn(row, "displayDate");

    if (isFiniteEpochMs(row.displayDateEpochMs)) {
      if (hasLegacyDisplayDate) {
        patches.push({
          table: "projectFiles",
          rowId: row._id,
          patch: { displayDate: undefined },
        });
      }
      continue;
    }

    const rawDisplayDate = asNonEmptyString((row as any).displayDate);
    const parsedDisplayDate = parseDisplayDateEpochMs(rawDisplayDate, row.createdAt);
    const patch: Record<string, unknown> = {
      displayDateEpochMs: parsedDisplayDate ?? Date.now(),
    };
    if (hasLegacyDisplayDate) {
      patch.displayDate = undefined;
    }
    patches.push({
      table: "projectFiles",
      rowId: row._id,
      patch,
    });

    if (rawDisplayDate && parsedDisplayDate === null && failures.length < MAX_SAMPLE_FAILURES) {
      failures.push({
        table: "projectFiles",
        rowId: String(row._id),
        field: "displayDate",
        rawValue: rawDisplayDate,
        reason: "Could not parse project file display date",
      });
    }
  }

  const brandAssetRows = await ctx.db.query("workspaceBrandAssets").take(batchSize);
  for (const row of brandAssetRows) {
    const hasLegacyDisplayDate = hasOwn(row, "displayDate");

    if (isFiniteEpochMs(row.displayDateEpochMs)) {
      if (hasLegacyDisplayDate) {
        patches.push({
          table: "workspaceBrandAssets",
          rowId: row._id,
          patch: { displayDate: undefined },
        });
      }
      continue;
    }

    const rawDisplayDate = asNonEmptyString((row as any).displayDate);
    const parsedDisplayDate = parseDisplayDateEpochMs(rawDisplayDate, row.createdAt);
    const patch: Record<string, unknown> = {
      displayDateEpochMs: parsedDisplayDate ?? Date.now(),
    };
    if (hasLegacyDisplayDate) {
      patch.displayDate = undefined;
    }
    patches.push({
      table: "workspaceBrandAssets",
      rowId: row._id,
      patch,
    });

    if (rawDisplayDate && parsedDisplayDate === null && failures.length < MAX_SAMPLE_FAILURES) {
      failures.push({
        table: "workspaceBrandAssets",
        rowId: String(row._id),
        field: "displayDate",
        rawValue: rawDisplayDate,
        reason: "Could not parse brand asset display date",
      });
    }
  }

  return {
    patches,
    failures,
    scanned: {
      projects: projectRows.length,
      tasks: taskRows.length,
      projectFiles: fileRows.length,
      workspaceBrandAssets: brandAssetRows.length,
    },
  };
};

export const internalAssertDateNormalizationAuth = internalQuery({
  args: {},
  handler: async (ctx) => {
    const { appUser } = await requireAuthUser(ctx);
    return { userId: String(appUser._id), email: appUser.email ?? null };
  },
});

export const internalPreviewDateNormalization = internalQuery({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = normalizeBatchSize(args.batchSize);
    const plan = await buildNormalizationPlan(ctx, batchSize);

    return {
      batchSize,
      scanned: plan.scanned,
      patchCount: plan.patches.length,
      failuresCount: plan.failures.length,
      failureSamples: plan.failures,
      patchCountsByTable: plan.patches.reduce(
        (acc, entry) => {
          acc[entry.table] += 1;
          return acc;
        },
        {
          projects: 0,
          tasks: 0,
          projectFiles: 0,
          workspaceBrandAssets: 0,
        } as Record<NormalizationFailure["table"], number>,
      ),
    };
  },
});

export const internalApplyDateNormalization = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = normalizeBatchSize(args.batchSize);
    const plan = await buildNormalizationPlan(ctx, batchSize);

    for (const item of plan.patches) {
      await ctx.db.patch(item.rowId, item.patch);
    }

    return {
      batchSize,
      scanned: plan.scanned,
      patchedCount: plan.patches.length,
      failuresCount: plan.failures.length,
      failureSamples: plan.failures,
      patchedByTable: plan.patches.reduce(
        (acc, entry) => {
          acc[entry.table] += 1;
          return acc;
        },
        {
          projects: 0,
          tasks: 0,
          projectFiles: 0,
          workspaceBrandAssets: 0,
        } as Record<NormalizationFailure["table"], number>,
      ),
    };
  },
});

export const previewDateNormalization = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(assertDateNormalizationAuthRef as any, {});
    return ctx.runQuery(previewDateNormalizationRef as any, {
      batchSize: args.batchSize,
    });
  },
});

export const applyDateNormalization = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.runQuery(assertDateNormalizationAuthRef as any, {});
    return ctx.runMutation(applyDateNormalizationRef as any, {
      batchSize: args.batchSize,
    });
  },
});
