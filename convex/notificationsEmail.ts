import { Resend, vOnEmailEventArgs } from "@convex-dev/resend";
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { requireWorkspaceRole } from "./lib/auth";
import { normalizeNotificationEvents } from "./lib/notificationPreferences";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const lifecycleEventTypeValidator = v.union(
  v.literal("submitted"),
  v.literal("reviewApproved"),
  v.literal("completed"),
);

const toggleValidator = v.union(
  v.literal("eventNotifications"),
  v.literal("teamActivities"),
  v.literal("productUpdates"),
);

type ToggleName = "eventNotifications" | "teamActivities" | "productUpdates";

type Recipient = {
  userId: string;
  name: string;
  email: string;
};

const getNotificationsFromAddress = () => {
  const value = process.env.NOTIFICATIONS_FROM_EMAIL;
  if (!value || value.trim().length === 0) {
    throw new ConvexError("Missing required environment variable: NOTIFICATIONS_FROM_EMAIL");
  }
  return value.trim();
};

const toDisplayName = (name?: string | null, email?: string | null) => {
  const trimmedName = name?.trim();
  if (trimmedName && trimmedName.length > 0) {
    return trimmedName;
  }
  const trimmedEmail = email?.trim();
  if (trimmedEmail && trimmedEmail.length > 0) {
    return trimmedEmail;
  }
  return "Unknown user";
};

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveRecipientsForToggle = async (
  ctx: any,
  args: {
    workspaceId: any;
    actorUserId: any;
    toggle: ToggleName;
  },
) => {
  const memberships = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspaceId", (q: any) => q.eq("workspaceId", args.workspaceId))
    .collect();

  const activeMemberships = memberships.filter((membership: any) => membership.status === "active");
  const relevantMemberships = activeMemberships.filter(
    (membership: any) => String(membership.userId) !== String(args.actorUserId),
  );

  let skippedNoUser = 0;
  let skippedNoEmail = 0;
  let skippedDisabled = 0;
  const recipients: Recipient[] = [];

  for (const membership of relevantMemberships) {
    const user = await ctx.db.get(membership.userId);
    if (!user) {
      skippedNoUser += 1;
      continue;
    }

    const email = typeof user.email === "string" ? user.email.trim() : "";
    if (email.length === 0) {
      skippedNoEmail += 1;
      continue;
    }

    const preferenceRow = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .unique();

    const events = normalizeNotificationEvents(preferenceRow as any);
    if (!events[args.toggle]) {
      skippedDisabled += 1;
      continue;
    }

    recipients.push({
      userId: String(user._id),
      name: toDisplayName(user.name, user.email),
      email,
    });
  }

  return {
    recipients,
    consideredRecipients: relevantMemberships.length,
    skippedNoUser,
    skippedNoEmail,
    skippedDisabled,
  };
};

const sendForToggle = async (
  ctx: any,
  args: {
    workspaceId: any;
    actorUserId: any;
    toggle: ToggleName;
    subject: string;
    text: string;
    html: string;
  },
) => {
  const recipientResolution = await resolveRecipientsForToggle(ctx, {
    workspaceId: args.workspaceId,
    actorUserId: args.actorUserId,
    toggle: args.toggle,
  });

  const from = getNotificationsFromAddress();
  let queuedRecipients = 0;
  let failedRecipients = 0;

  for (const recipient of recipientResolution.recipients) {
    try {
      await resend.sendEmail(ctx, {
        from,
        to: recipient.email,
        subject: args.subject,
        text: args.text,
        html: args.html,
      });
      queuedRecipients += 1;
    } catch (error) {
      failedRecipients += 1;
      console.error("[notifications email] failed to enqueue", {
        recipientUserId: recipient.userId,
        toggle: args.toggle,
        error,
      });
    }
  }

  return {
    toggle: args.toggle,
    consideredRecipients: recipientResolution.consideredRecipients,
    eligibleRecipients: recipientResolution.recipients.length,
    skippedNoUser: recipientResolution.skippedNoUser,
    skippedNoEmail: recipientResolution.skippedNoEmail,
    skippedDisabled: recipientResolution.skippedDisabled,
    queuedRecipients,
    failedRecipients,
  };
};

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  handler: async (_ctx, args) => {
    console.info("[notifications email] resend webhook event received", {
      emailId: args.id,
      type: args.event.type,
    });
  },
});

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.notificationsEmail.handleEmailEvent,
});

export const sendTeamActivityForComment = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorUserId: v.id("users"),
    actorName: v.string(),
    projectPublicId: v.string(),
    projectName: v.string(),
    commentContent: v.string(),
    isReply: v.boolean(),
  },
  handler: async (ctx, args) => {
    const activityLabel = args.isReply ? "reply" : "comment";
    const contentPreview = truncate(args.commentContent.trim(), 280);
    const subject = `Team activities: New ${activityLabel} in ${args.projectName}`;
    const text = [
      `${args.actorName} added a ${activityLabel} in "${args.projectName}".`,
      `Project: ${args.projectPublicId}`,
      "",
      contentPreview,
    ].join("\n");
    const html = [
      `<p><strong>${escapeHtml(args.actorName)}</strong> added a ${escapeHtml(activityLabel)} in <strong>${escapeHtml(args.projectName)}</strong>.</p>`,
      `<p>Project: <code>${escapeHtml(args.projectPublicId)}</code></p>`,
      `<p>${escapeHtml(contentPreview).replace(/\n/g, "<br />")}</p>`,
    ].join("");

    return await sendForToggle(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      toggle: "teamActivities",
      subject,
      text,
      html,
    });
  },
});

export const sendProjectLifecycleEvent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorUserId: v.id("users"),
    actorName: v.string(),
    projectPublicId: v.string(),
    projectName: v.string(),
    eventType: lifecycleEventTypeValidator,
    previousStatus: v.optional(v.string()),
    nextStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const eventLabelByType: Record<string, string> = {
      submitted: "Project submitted",
      reviewApproved: "Review approved",
      completed: "Project completed",
    };
    const eventLabel = eventLabelByType[args.eventType];
    const transition = `${args.previousStatus ?? "Unknown"} -> ${args.nextStatus}`;
    const subject = `Event notifications: ${eventLabel} (${args.projectName})`;
    const text = [
      `${args.actorName} triggered "${eventLabel}" for "${args.projectName}".`,
      `Project: ${args.projectPublicId}`,
      `Transition: ${transition}`,
    ].join("\n");
    const html = [
      `<p><strong>${escapeHtml(args.actorName)}</strong> triggered <strong>${escapeHtml(eventLabel)}</strong> for <strong>${escapeHtml(args.projectName)}</strong>.</p>`,
      `<p>Project: <code>${escapeHtml(args.projectPublicId)}</code></p>`,
      `<p>Transition: <code>${escapeHtml(transition)}</code></p>`,
    ].join("");

    return await sendForToggle(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      toggle: "eventNotifications",
      subject,
      text,
      html,
    });
  },
});

export const sendProductUpdateBroadcastInternal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorUserId: v.id("users"),
    actorName: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedSubject = args.subject.trim();
    const trimmedMessage = args.message.trim();
    if (trimmedSubject.length === 0 || trimmedMessage.length === 0) {
      throw new ConvexError("Product update subject and message are required");
    }

    const text = [
      `${args.actorName} published a product update:`,
      "",
      trimmedMessage,
    ].join("\n");
    const html = [
      `<p><strong>${escapeHtml(args.actorName)}</strong> published a product update.</p>`,
      `<p>${escapeHtml(trimmedMessage).replace(/\n/g, "<br />")}</p>`,
    ].join("");

    return await sendForToggle(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      toggle: "productUpdates",
      subject: trimmedSubject,
      text,
      html,
    });
  },
});

export const sendProductUpdateBroadcast = mutation({
  args: {
    workspaceSlug: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.workspaceSlug))
      .unique();

    if (!workspace || workspace.deletedAt != null) {
      throw new ConvexError("Workspace not found");
    }

    const { appUser } = await requireWorkspaceRole(ctx, workspace._id, "admin", { workspace });
    const trimmedSubject = args.subject.trim();
    const trimmedMessage = args.message.trim();
    if (trimmedSubject.length === 0 || trimmedMessage.length === 0) {
      throw new ConvexError("Product update subject and message are required");
    }

    return await sendForToggle(ctx, {
      workspaceId: workspace._id,
      actorUserId: appUser._id,
      toggle: "productUpdates",
      subject: trimmedSubject,
      text: `${toDisplayName(appUser.name, appUser.email)} published a product update:\n\n${trimmedMessage}`,
      html: `<p><strong>${escapeHtml(toDisplayName(appUser.name, appUser.email))}</strong> published a product update.</p><p>${escapeHtml(trimmedMessage).replace(/\n/g, "<br />")}</p>`,
    });
  },
});

export const cleanupResend = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupOldEmails, {
      olderThan: ONE_WEEK_MS,
    });
    await ctx.scheduler.runAfter(0, components.resend.lib.cleanupAbandonedEmails, {
      olderThan: 4 * ONE_WEEK_MS,
    });
    return { scheduled: true };
  },
});

export const internalDispatchByToggle = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorUserId: v.id("users"),
    toggle: toggleValidator,
    subject: v.string(),
    text: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) =>
    sendForToggle(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: args.actorUserId,
      toggle: args.toggle,
      subject: args.subject,
      text: args.text,
      html: args.html,
    }),
});
