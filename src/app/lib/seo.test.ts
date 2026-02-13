import { describe, expect, test } from "vitest";
import { DEFAULT_PAGE_TITLE, getPageTitle } from "./seo";

describe("getPageTitle", () => {
  test("returns auth titles", () => {
    expect(getPageTitle("/login")).toBe("Sign In | Build Design");
    expect(getPageTitle("/signup")).toBe("Sign Up | Build Design");
    expect(getPageTitle("/auth/callback")).toBe("Signing In | Build Design");
    expect(getPageTitle("/reset-password")).toBe(
      "Reset Password | Build Design",
    );
  });

  test("returns dashboard titles", () => {
    expect(getPageTitle("/tasks")).toBe("Tasks | Build Design");
    expect(getPageTitle("/dashboard")).toBe("Tasks | Build Design");
    expect(getPageTitle("/inbox")).toBe("Tasks | Build Design");
  });

  test("returns archive and project titles", () => {
    expect(getPageTitle("/archive")).toBe("Archive | Build Design");
    expect(getPageTitle("/completed")).toBe(
      "Completed Projects | Build Design",
    );
    expect(getPageTitle("/archive/project-123")).toBe("Archived Project | Build Design");
    expect(getPageTitle("/completed/project-123")).toBe(
      "Completed Project | Build Design",
    );
    expect(getPageTitle("/drafts")).toBe("Drafts & Pending Projects | Build Design");
    expect(getPageTitle("/pending")).toBe("Drafts & Pending Projects | Build Design");
    expect(getPageTitle("/drafts/project-123")).toBe("Draft Project | Build Design");
    expect(getPageTitle("/pending/project-123")).toBe("Pending Project | Build Design");
    expect(getPageTitle("/project/project-123")).toBe("Project | Build Design");
    expect(getPageTitle("/settings")).toBe("Settings | Build Design");
  });

  test("falls back to default title", () => {
    expect(getPageTitle("/unknown")).toBe(DEFAULT_PAGE_TITLE);
    expect(getPageTitle("/activities")).toBe(DEFAULT_PAGE_TITLE);
  });
});
