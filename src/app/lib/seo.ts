const APP_NAME = "Build Design";

export const DEFAULT_PAGE_TITLE = `${APP_NAME} - Agency Operations Dashboard`;

export const getPageTitle = (pathname: string): string => {
  if (pathname === "/login") {
    return `Sign In | ${APP_NAME}`;
  }

  if (pathname === "/signup") {
    return `Sign Up | ${APP_NAME}`;
  }

  if (pathname === "/auth/callback") {
    return `Signing In | ${APP_NAME}`;
  }

  if (pathname === "/reset-password") {
    return `Reset Password | ${APP_NAME}`;
  }

  if (pathname === "/tasks" || pathname === "/dashboard" || pathname === "/inbox") {
    return `Tasks | ${APP_NAME}`;
  }

  if (pathname === "/archive") {
    return `Archive | ${APP_NAME}`;
  }

  if (pathname === "/activities") {
    return `Activities | ${APP_NAME}`;
  }

  if (pathname.startsWith("/archive/")) {
    return `Archived Project | ${APP_NAME}`;
  }

  if (pathname.startsWith("/project/")) {
    return `Project | ${APP_NAME}`;
  }

  if (pathname === "/settings") {
    return `Settings | ${APP_NAME}`;
  }

  return DEFAULT_PAGE_TITLE;
};
