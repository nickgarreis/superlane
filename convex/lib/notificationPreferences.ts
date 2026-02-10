export type NotificationEventPreferences = {
  eventNotifications: boolean;
  teamActivities: boolean;
  productUpdates: boolean;
};

export const DEFAULT_NOTIFICATION_EVENTS: NotificationEventPreferences = {
  eventNotifications: true,
  teamActivities: true,
  productUpdates: true,
};

type LegacyRowShape = {
  channels?: {
    email?: boolean;
  };
  events?: {
    eventNotifications?: boolean;
    teamActivities?: boolean;
    productUpdates?: boolean;
    teamActivity?: boolean;
  };
} | null | undefined;

export const normalizeNotificationEvents = (
  row: LegacyRowShape,
): NotificationEventPreferences => {
  const eventNotifications =
    typeof row?.events?.eventNotifications === "boolean"
      ? row.events.eventNotifications
      : typeof row?.channels?.email === "boolean"
        ? row.channels.email
        : DEFAULT_NOTIFICATION_EVENTS.eventNotifications;

  const teamActivities =
    typeof row?.events?.teamActivities === "boolean"
      ? row.events.teamActivities
      : typeof row?.events?.teamActivity === "boolean"
        ? row.events.teamActivity
        : DEFAULT_NOTIFICATION_EVENTS.teamActivities;

  const productUpdates =
    typeof row?.events?.productUpdates === "boolean"
      ? row.events.productUpdates
      : DEFAULT_NOTIFICATION_EVENTS.productUpdates;

  return {
    eventNotifications,
    teamActivities,
    productUpdates,
  };
};
