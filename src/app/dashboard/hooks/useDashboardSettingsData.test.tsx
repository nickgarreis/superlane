/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useDashboardSettingsData } from "./useDashboardSettingsData";

describe("useDashboardSettingsData", () => {
  test("uses fallback account and notification defaults when settings are absent", () => {
    const { result } = renderHook(() => useDashboardSettingsData({
      accountSettings: undefined,
      notificationSettings: undefined,
      companySettings: undefined,
      fallbackAvatarUrl: "https://cdn.test/fallback.png",
      user: {
        firstName: "Nick",
        lastName: "User",
        email: "nick@example.com",
        profilePictureUrl: "https://cdn.test/profile.png",
      },
    }));

    expect(result.current.settingsAccountData).toEqual({
      firstName: "Nick",
      lastName: "User",
      email: "nick@example.com",
      avatarUrl: "https://cdn.test/fallback.png",
    });
    expect(result.current.settingsNotificationsData).toEqual({
      events: {
        eventNotifications: true,
        teamActivities: true,
        productUpdates: true,
      },
    });
    expect(result.current.settingsCompanyData).toBeNull();
  });

  test("uses explicit settings and filters null company entries", () => {
    const { result } = renderHook(() => useDashboardSettingsData({
      accountSettings: {
        firstName: "Jane",
        lastName: "Owner",
        email: "jane@example.com",
        avatarUrl: "https://cdn.test/jane.png",
      },
      notificationSettings: {
        events: {
          eventNotifications: false,
          teamActivities: true,
          productUpdates: false,
        },
      },
      companySettings: {
        name: "Company",
        logo: null,
        logoColor: null,
        logoText: null,
        members: [
          null,
          {
            userId: "user-1",
            name: "Jane",
            email: "jane@example.com",
            avatarUrl: null,
            role: "owner",
            isViewer: true,
          },
        ],
        pendingInvitations: [
          null,
          {
            invitationId: "inv-1",
            email: "member@example.com",
            role: "member",
            invitedAt: Date.now(),
            expiresAt: Date.now() + 1000,
          },
        ],
        brandAssets: [
          null,
          {
            id: "asset-1",
            name: "Brand Asset",
            fileType: "PNG",
            uploadedAt: Date.now(),
          },
        ],
      },
      fallbackAvatarUrl: null,
      user: null,
    }));

    expect(result.current.settingsAccountData).toEqual({
      firstName: "Jane",
      lastName: "Owner",
      email: "jane@example.com",
      avatarUrl: "https://cdn.test/jane.png",
    });
    expect(result.current.settingsNotificationsData).toEqual({
      events: {
        eventNotifications: false,
        teamActivities: true,
        productUpdates: false,
      },
    });
    expect(result.current.settingsCompanyData?.members).toHaveLength(1);
    expect(result.current.settingsCompanyData?.pendingInvitations).toHaveLength(1);
    expect(result.current.settingsCompanyData?.brandAssets).toHaveLength(1);
  });
});
