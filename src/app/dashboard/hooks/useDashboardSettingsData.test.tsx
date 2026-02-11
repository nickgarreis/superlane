/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useDashboardSettingsData } from "./useDashboardSettingsData";

describe("useDashboardSettingsData", () => {
  test("uses fallback account and notification defaults when settings are absent", () => {
    const { result } = renderHook(() => useDashboardSettingsData({
      accountSettings: undefined,
      notificationSettings: undefined,
      companySummary: undefined,
      companyMembersResult: undefined,
      companyPendingInvitationsResult: undefined,
      companyBrandAssetsResult: undefined,
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
      companySummary: {
        workspace: {
          id: "workspace-1",
          slug: "workspace-1",
          name: "Company",
          plan: "free",
          logo: null,
          logoColor: null,
          logoText: null,
          workosOrganizationId: null,
        },
        capability: {
          hasOrganizationLink: true,
          canManageWorkspaceGeneral: true,
          canManageMembers: true,
          canManageBrandAssets: true,
          canDeleteWorkspace: true,
        },
        viewerRole: "owner",
      },
      companyMembersResult: {
        results: [
          {
            userId: "user-1",
            name: "Jane",
            email: "jane@example.com",
            avatarUrl: null,
            role: "owner",
            status: "active",
          },
        ],
      },
      companyPendingInvitationsResult: {
        results: [
          {
            invitationId: "inv-1",
            email: "member@example.com",
            state: "pending",
            requestedRole: "member",
            expiresAt: new Date(Date.now() + 1000).toISOString(),
          },
        ],
      },
      companyBrandAssetsResult: {
        results: [
          {
            id: "asset-1",
            name: "Brand Asset",
            type: "PNG",
            mimeType: "image/png",
            sizeBytes: 1024,
            displayDateEpochMs: Date.now(),
            downloadUrl: null,
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
