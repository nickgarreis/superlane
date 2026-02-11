import { ConvexError } from "convex/values";

export const paginateWorkspaceTasksWithFilter = async (
  args: {
    paginationOpts: { numItems: number; cursor: string | null };
    makeQuery: () => any;
    includeTask: (task: any) => boolean;
  },
) => {
  const requestedCount = Math.max(0, Math.floor(args.paginationOpts.numItems));
  let cursor = args.paginationOpts.cursor;
  const collected: any[] = [];
  let lastPage: any = null;
  let iterationCount = 0;
  let lastCursor: string | null = null;

  while (collected.length < requestedCount) {
    if (iterationCount > 1000) {
      break;
    }
    if (iterationCount > 0 && cursor === lastCursor) {
      break;
    }

    const remaining = requestedCount - collected.length;
    const page = await args.makeQuery().paginate({
      ...args.paginationOpts,
      cursor,
      numItems: remaining,
    });

    lastPage = page;
    for (const task of page.page) {
      if (args.includeTask(task)) {
        collected.push(task);
      }
    }

    if (page.isDone) {
      break;
    }

    lastCursor = cursor;
    cursor = page.continueCursor;
    iterationCount += 1;
  }

  if (!lastPage) {
    lastPage = await args.makeQuery().paginate({
      ...args.paginationOpts,
      cursor: args.paginationOpts.cursor,
      numItems: requestedCount,
    });
  }

  return {
    ...lastPage,
    page: collected,
  };
};

const normalizeRequestedPosition = (position: number | undefined) => {
  if (position === undefined) {
    return null;
  }
  if (!Number.isInteger(position) || position < 0) {
    throw new ConvexError("position must be a non-negative integer");
  }
  return position;
};

export const reserveTaskPosition = async (
  ctx: any,
  args: {
    workspaceId: any;
    requestedPosition: number | undefined;
  },
) => {
  const normalizedRequestedPosition = normalizeRequestedPosition(args.requestedPosition);
  if (normalizedRequestedPosition !== null) {
    return normalizedRequestedPosition;
  }

  const workspace = await ctx.db.get(args.workspaceId);
  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  let nextTaskPosition = typeof workspace.nextTaskPosition === "number"
    ? workspace.nextTaskPosition
    : null;

  if (nextTaskPosition === null) {
    const lastTask = await ctx.db
      .query("tasks")
      .withIndex("by_workspace_position", (q: any) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .first();
    nextTaskPosition = typeof lastTask?.position === "number" ? lastTask.position + 1 : 0;
  }

  await ctx.db.patch(args.workspaceId, {
    nextTaskPosition: nextTaskPosition + 1,
  });

  return nextTaskPosition;
};
