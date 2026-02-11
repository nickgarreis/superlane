import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import { applySeedRows } from "./devSeedApply";
import { deleteSeedRows } from "./devSeedReset";
import {
  assertDevSeedEnabled,
  buildSeedNamespace,
  getWorkspaceBySlug,
  resolveProfile,
  seedProfileValidator,
  type SeedOperationArgs,
  type SeedProfile,
} from "./devSeedShared";

const getSeedContext = async (
  ctx: MutationCtx,
  args: { workspaceSlug: string; profile?: SeedProfile },
): Promise<SeedOperationArgs> => {
  assertDevSeedEnabled();
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  const profile = resolveProfile(args.profile);
  const namespace = buildSeedNamespace(workspace.slug, profile);
  return { workspace, profile, namespace };
};

export const apply = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return applySeedRows(ctx, context);
  },
});

export const reset = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return deleteSeedRows(ctx, context);
  },
});

export const reseed = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return applySeedRows(ctx, context);
  },
});
