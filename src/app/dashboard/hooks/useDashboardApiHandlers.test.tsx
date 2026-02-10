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
    useActionMock.mockImplementation((ref: unknown) => ({ kind: "action", ref }));
    useMutationMock.mockImplementation((ref: unknown) => ({ kind: "mutation", ref }));
  });

  test("maps convex action/mutation hooks into dashboard handlers", () => {
    const { result } = renderHook(() => useDashboardApiHandlers());

    expect(useActionMock).toHaveBeenCalled();
    expect(useMutationMock).toHaveBeenCalled();
    expect(Object.keys(result.current)).toHaveLength(37);
    expect(result.current.ensureDefaultWorkspaceAction).toMatchObject({ kind: "action" });
    expect(result.current.createProjectMutation).toMatchObject({ kind: "mutation" });
    expect(result.current.ensureOrganizationLinkAction).toMatchObject({ kind: "action" });
    expect(result.current.softDeleteWorkspaceMutation).toMatchObject({ kind: "mutation" });
  });
});
