/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardApiHandlers } from "./useDashboardApiHandlers";

const { useActionMock, useMutationMock } = vi.hoisted(() => ({
  useActionMock: vi.fn(),
  useMutationMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useAction: (...args: unknown[]) => useActionMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("useDashboardApiHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionMock.mockReturnValue({ kind: "action" });
    useMutationMock.mockReturnValue({ kind: "mutation" });
  });

  test("maps convex action/mutation hooks into dashboard handlers", () => {
    const { result } = renderHook(() => useDashboardApiHandlers());

    expect(useActionMock).toHaveBeenCalled();
    expect(useMutationMock).toHaveBeenCalled();
    expect(Object.keys(result.current)).toHaveLength(48);
    expect(result.current.ensureDefaultWorkspaceAction).toMatchObject({
      kind: "action",
    });
    expect(result.current.requestPasswordResetAction).toMatchObject({
      kind: "action",
    });
    expect(
      result.current.syncCurrentUserLinkedIdentityProvidersAction,
    ).toMatchObject({
      kind: "action",
    });
    expect(result.current.createProjectMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.createTaskMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.reorderTasksMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.applyTaskDiffMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.markActivityReadMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.markAllReadMutation).toMatchObject({
      kind: "mutation",
    });
    expect(result.current.ensureOrganizationLinkAction).toMatchObject({
      kind: "action",
    });
    expect(result.current.softDeleteWorkspaceMutation).toMatchObject({
      kind: "mutation",
    });
  });

  test("keeps handler object reference stable across rerenders", () => {
    const { result, rerender } = renderHook(() => useDashboardApiHandlers());
    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });
});
