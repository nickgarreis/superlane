import { describe, expect, test } from "vitest";
import {
  getServiceJobConfig,
  getServiceJobLabel,
  normalizeServiceName,
  serviceRequiresJobSelection,
} from "./projectServices";

describe("projectServices", () => {
  test("normalizes service aliases", () => {
    expect(normalizeServiceName("webdesign")).toBe("Web Design");
    expect(normalizeServiceName("emaildesign")).toBe("Email Design");
    expect(normalizeServiceName("productdesign")).toBe("Product Design");
    expect(normalizeServiceName("custom")).toBe("Custom");
  });

  test("returns scope-based config for new services", () => {
    const brandingConfig = getServiceJobConfig("Branding");
    expect(brandingConfig.jobLabel).toBe("Scope");
    expect(brandingConfig.jobOptions).toContain("Brand guidelines");
    expect(brandingConfig.jobOptions).toContain("Logo design");
    expect(brandingConfig.jobIcons?.["Brand guidelines"]).toBeDefined();

    const productConfig = getServiceJobConfig("Product Design");
    expect(productConfig.jobLabel).toBe("Scope");
    expect(productConfig.jobOptions).toContain("Dashboard design");
    expect(productConfig.jobIcons?.["Dashboard design"]).toBeDefined();

    const presentationConfig = getServiceJobConfig("Presentation");
    expect(presentationConfig.jobIcons?.["Create something new"]).toBeDefined();

    const emailDesignConfig = getServiceJobConfig("Email Design");
    expect(emailDesignConfig.jobIcons?.["Create something new"]).toBeDefined();
  });

  test("keeps generic fallback for unknown services", () => {
    expect(getServiceJobLabel("Unknown Service")).toBe("Job");
    expect(getServiceJobConfig("Unknown Service").jobOptions).toEqual([
      "I would like to discuss some possibilities",
      "Create something new",
      "Refine something existing",
    ]);
  });

  test("supports custom service with no scope selection", () => {
    const customConfig = getServiceJobConfig("Custom");

    expect(customConfig.jobLabel).toBe("Scope");
    expect(customConfig.jobOptions).toEqual([]);
    expect(serviceRequiresJobSelection("Custom")).toBe(false);
  });
});
