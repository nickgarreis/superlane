const DEFAULT_NOTIFICATIONS_FROM_EMAIL = "notifications@example.com";

const configuredNotificationsFromEmail =
  import.meta.env.VITE_NOTIFICATIONS_FROM_EMAIL;

export const NOTIFICATIONS_FROM_EMAIL =
  typeof configuredNotificationsFromEmail === "string" &&
  configuredNotificationsFromEmail.trim().length > 0
    ? configuredNotificationsFromEmail.trim()
    : DEFAULT_NOTIFICATIONS_FROM_EMAIL;
