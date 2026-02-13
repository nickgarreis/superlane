import { describe, expect, it, vi } from "vitest";

type DemoConvexClient = {
  query: (queryRef: unknown, args?: unknown) => Promise<unknown>;
  mutation: (
    mutationRef: unknown,
    args?: Record<string, unknown>,
  ) => Promise<unknown>;
};

type WorkspaceTaskRow = {
  taskId: string;
};

type WorkspaceProjectRow = {
  publicId: string;
  status: string;
  archived: boolean;
  archivedAt: number | null;
  completedAt: number | null;
  lastApprovedAt: number | null;
};

const loadDemoClient = async () => {
  vi.resetModules();
  const [{ api }, demo] = await Promise.all([
    import("../../../convex/_generated/api"),
    import("../../demo/mockConvexReact"),
  ]);

  return {
    api,
    client: demo.useConvex() as DemoConvexClient,
  };
};

describe("demo convex task diff mutations", () => {
  it("removes tasks from workspace results when applyDiff includes removes", async () => {
    const { api, client } = await loadDemoClient();

    const initialResult = (await client.query(
      api.tasks.listForWorkspace,
      {
        workspaceSlug: "demo-workspace",
      },
    )) as WorkspaceTaskRow[];
    expect(initialResult.length).toBeGreaterThan(0);

    const taskIdToRemove = initialResult[0]?.taskId;
    expect(taskIdToRemove).toBeTruthy();

    const mutationResult = await client.mutation(api.tasks.applyDiff, {
      workspaceSlug: "demo-workspace",
      creates: [],
      updates: [],
      removes: [taskIdToRemove],
    });

    expect(mutationResult).toMatchObject({ removed: 1 });

    const nextResult = (await client.query(api.tasks.listForWorkspace, {
      workspaceSlug: "demo-workspace",
    })) as WorkspaceTaskRow[];

    expect(nextResult.some((task) => task.taskId === taskIdToRemove)).toBe(
      false,
    );
  });
});

describe("demo convex project mutations", () => {
  it("updates a draft project to review via projects:update", async () => {
    const { api, client } = await loadDemoClient();

    const mutationResult = await client.mutation(api.projects.update, {
      publicId: "proj-onboarding-revamp",
      status: "Review",
      draftData: null,
    });

    expect(mutationResult).toMatchObject({ publicId: "proj-onboarding-revamp" });

    const projects = (await client.query(api.projects.listForWorkspace, {
      workspaceSlug: "demo-workspace",
      includeArchived: false,
    })) as WorkspaceProjectRow[];
    const updated = projects.find(
      (project) => project.publicId === "proj-onboarding-revamp",
    );

    expect(updated?.status).toBe("Review");
  });

  it("marks projects completed and approves review projects via projects:setStatus", async () => {
    const { api, client } = await loadDemoClient();

    const completeResult = await client.mutation(api.projects.setStatus, {
      publicId: "proj-client-portal",
      status: "Completed",
    });
    expect(completeResult).toMatchObject({ publicId: "proj-client-portal" });

    await client.mutation(api.projects.setStatus, {
      publicId: "proj-onboarding-revamp",
      status: "Review",
    });
    const approveResult = await client.mutation(api.projects.setStatus, {
      publicId: "proj-onboarding-revamp",
      status: "Active",
    });
    expect(approveResult).toMatchObject({ publicId: "proj-onboarding-revamp" });

    const projects = (await client.query(api.projects.listForWorkspace, {
      workspaceSlug: "demo-workspace",
      includeArchived: false,
    })) as WorkspaceProjectRow[];
    const completed = projects.find(
      (project) => project.publicId === "proj-client-portal",
    );
    const approved = projects.find(
      (project) => project.publicId === "proj-onboarding-revamp",
    );

    expect(completed?.status).toBe("Completed");
    expect(typeof completed?.completedAt).toBe("number");
    expect(approved?.status).toBe("Active");
    expect(typeof approved?.lastApprovedAt).toBe("number");
  });

  it("archives and unarchives projects using publicId args", async () => {
    const { api, client } = await loadDemoClient();

    const archiveResult = await client.mutation(api.projects.archive, {
      publicId: "proj-email-templates",
    });
    expect(archiveResult).toMatchObject({ publicId: "proj-email-templates" });

    const activeProjectsAfterArchive = (await client.query(
      api.projects.listForWorkspace,
      {
        workspaceSlug: "demo-workspace",
        includeArchived: false,
      },
    )) as WorkspaceProjectRow[];
    expect(
      activeProjectsAfterArchive.some(
        (project) => project.publicId === "proj-email-templates",
      ),
    ).toBe(false);

    const allProjectsAfterArchive = (await client.query(
      api.projects.listForWorkspace,
      {
        workspaceSlug: "demo-workspace",
        includeArchived: true,
      },
    )) as WorkspaceProjectRow[];
    const archivedProject = allProjectsAfterArchive.find(
      (project) => project.publicId === "proj-email-templates",
    );
    expect(archivedProject?.archived).toBe(true);
    expect(typeof archivedProject?.archivedAt).toBe("number");

    const unarchiveResult = await client.mutation(api.projects.unarchive, {
      publicId: "proj-email-templates",
    });
    expect(unarchiveResult).toMatchObject({ publicId: "proj-email-templates" });

    const activeProjectsAfterUnarchive = (await client.query(
      api.projects.listForWorkspace,
      {
        workspaceSlug: "demo-workspace",
        includeArchived: false,
      },
    )) as WorkspaceProjectRow[];
    const restoredProject = activeProjectsAfterUnarchive.find(
      (project) => project.publicId === "proj-email-templates",
    );
    expect(restoredProject?.archived).toBe(false);
    expect(restoredProject?.status).toBe("Active");
  });
});
