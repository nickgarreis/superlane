import type {
  FileBlueprint,
  FileTab,
  ProjectBlueprint,
  SeedProfile,
  SeedUserBlueprint,
  TaskBlueprint,
} from "./devSeedShared";

export const buildUserBlueprints = (profile: SeedProfile): SeedUserBlueprint[] =>
  profile === "minimal"
    ? [
        {
          key: "teammate",
          name: "Seed Teammate",
          role: "member",
          status: "active",
        },
      ]
    : [
        {
          key: "admin",
          name: "Seed Admin",
          role: "admin",
          status: "active",
        },
        {
          key: "designer",
          name: "Seed Designer",
          role: "member",
          status: "active",
        },
        {
          key: "developer",
          name: "Seed Developer",
          role: "member",
          status: "active",
        },
        {
          key: "invitee",
          name: "Seed Invitee",
          role: "member",
          status: "invited",
        },
      ];

export const buildProjectBlueprints = (profile: SeedProfile): ProjectBlueprint[] => {
  const shared: ProjectBlueprint[] = [
    {
      key: "active-client-portal",
      name: "Client Portal Refresh",
      description:
        "Redesign the main client portal surfaces with a full UX pass, tighter navigation logic, and reusable UI patterns so account managers can move from briefing to approvals without losing context.",
      category: "Web Design",
      scope: "UX Audit + UI Production",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 12,
    },
    {
      key: "review-brand-kit",
      name: "Brand Kit Review",
      description:
        "Finalize the visual identity package with updated logo lockups, color accessibility checks, and typography guidance while gathering stakeholder review notes to close remaining approval blockers.",
      category: "Branding",
      scope: "Logo + Color + Typography",
      creatorKey: profile === "minimal" ? "teammate" : "designer",
      status: "Review",
      previousStatus: "Active",
      archived: false,
      deadlineOffsetDays: 4,
      includeReviewComment: true,
    },
  ];

  if (profile === "minimal") {
    return shared;
  }

  return [
    ...shared,
    {
      key: "draft-marketing-site",
      name: "Marketing Site Draft",
      description:
        "Build a draft structure for the new campaign website including wireframes, messaging hierarchy, and conversion-focused content placeholders so strategy and design can iterate in parallel.",
      category: "Website Design",
      scope: "Wireframes + Copy Draft",
      creatorKey: "admin",
      status: "Draft",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 20,
      includeDraftData: true,
    },
    {
      key: "completed-mobile-kit",
      name: "Mobile UI Kit",
      description:
        "Delivered a production-ready mobile component kit with documented interaction states, spacing tokens, and accessibility notes so product and growth squads can ship consistent in-app experiences.",
      category: "Product design",
      scope: "Components + Tokens",
      creatorKey: "developer",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: -3,
    },
    {
      key: "archived-legacy-site",
      name: "Legacy Site Maintenance",
      description:
        "Archive the legacy maintenance stream that previously handled deprecated landing pages, preserving final references and maintenance notes while preventing new work from entering this lane.",
      category: "Web Design",
      scope: "Maintenance",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
    {
      key: "active-design-system-rollout",
      name: "Design System Rollout",
      description:
        "Roll out the updated design system across product touchpoints with migration checklists, team enablement docs, and component adoption tracking to reduce drift between design and implementation.",
      category: "Product design",
      scope: "System Migration",
      creatorKey: "admin",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 16,
    },
    {
      key: "active-onboarding-redesign",
      name: "Onboarding Redesign",
      description:
        "Redesign the first-run onboarding journey with clearer milestones, friendlier guidance, and measurable activation checkpoints so new customers reach first value in fewer steps.",
      category: "UI/UX Design",
      scope: "Flow Redesign",
      creatorKey: "designer",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 14,
    },
    {
      key: "completed-email-automation",
      name: "Email Automation Visuals",
      description:
        "Completed the visual refresh for lifecycle email automations, including responsive templates, modular content blocks, and QA-approved variants for all critical campaign triggers.",
      category: "Email Design",
      scope: "Template System",
      creatorKey: "designer",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -2,
    },
    {
      key: "completed-sales-deck-refresh",
      name: "Sales Deck Refresh",
      description:
        "Finished the sales presentation refresh with updated narrative structure, stronger proof-point visuals, and reusable slide modules so the commercial team can tailor decks quickly.",
      category: "Presentation",
      scope: "Story + Slides",
      creatorKey: "admin",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -4,
    },
    {
      key: "completed-product-tour-assets",
      name: "Product Tour Assets",
      description:
        "Delivered final product tour assets including step-by-step overlays, annotation copy, and visual fallback states that support release communication across web and mobile channels.",
      category: "Product design",
      scope: "Tour Asset Pack",
      creatorKey: "developer",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -1,
    },
    {
      key: "archived-brand-audit-2024",
      name: "Brand Audit 2024",
      description:
        "Archive the historical brand audit stream from 2024 while keeping benchmark findings and decision context accessible for future strategy planning and cross-channel consistency checks.",
      category: "Branding",
      scope: "Historical Audit",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
    {
      key: "archived-social-campaign-q2",
      name: "Social Campaign Q2",
      description:
        "Archive the Q2 social campaign production lane after completion, preserving approved concepts, format variants, and performance notes so future campaign teams can reuse proven patterns.",
      category: "Social Media",
      scope: "Campaign Archive",
      creatorKey: "admin",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
  ];
};

export const buildTaskBlueprints = (
  profile: SeedProfile,
  projectBlueprints: ProjectBlueprint[],
): TaskBlueprint[] => {
  const assigneeKeys = profile === "minimal"
    ? ["owner", "teammate"]
    : ["owner", "admin", "designer", "developer"];
  const tasksPerProject = profile === "minimal" ? 3 : 4;
  const taskLabels = [
    "Define delivery milestones",
    "Prepare design and content iteration",
    "Run internal QA and stakeholder pass",
    "Finalize handoff package",
  ];

  const tasks: TaskBlueprint[] = [];
  for (const [projectIndex, project] of projectBlueprints.entries()) {
    const projectIsClosed = project.status === "Completed" || project.archived;
    const deadlineBase = project.deadlineOffsetDays ?? (projectIndex + 10);

    for (let taskIndex = 0; taskIndex < tasksPerProject; taskIndex += 1) {
      const assigneeKey = assigneeKeys[(projectIndex + taskIndex) % assigneeKeys.length];
      const completed = projectIsClosed ? true : taskIndex === 0;
      const dueOffsetDays = projectIsClosed
        ? null
        : Math.max(1, deadlineBase - (tasksPerProject - taskIndex));

      tasks.push({
        title: `${taskLabels[taskIndex]} - ${project.name}`,
        projectKey: project.key,
        assigneeKey,
        dueOffsetDays,
        completed,
      });
    }
  }

  return tasks;
};

const buildFileContent = (
  mimeType: string,
  projectKey: string,
  variantIndex: number,
) => {
  if (mimeType === "text/csv") {
    return `metric,value\n${projectKey}-${variantIndex},1`;
  }
  return `seed-file-${projectKey}-${variantIndex}`;
};

export const buildFileBlueprints = (
  profile: SeedProfile,
  projectBlueprints: ProjectBlueprint[],
): FileBlueprint[] => {
  const fileTemplates: Array<{ tab: FileTab; extension: string; mimeType: string }> = [
    { tab: "Assets", extension: "png", mimeType: "image/png" },
    { tab: "Contract", extension: "pdf", mimeType: "application/pdf" },
    { tab: "Attachments", extension: "txt", mimeType: "text/plain" },
    { tab: "Assets", extension: "csv", mimeType: "text/csv" },
  ];
  const filesPerProject = profile === "minimal" ? 2 : 3;

  const files: FileBlueprint[] = [];
  for (const [projectIndex, project] of projectBlueprints.entries()) {
    for (let fileIndex = 0; fileIndex < filesPerProject; fileIndex += 1) {
      const template = fileTemplates[(projectIndex + fileIndex) % fileTemplates.length];
      const variantIndex = fileIndex + 1;
      files.push({
        projectKey: project.key,
        tab: template.tab,
        name: `${project.key}-${variantIndex}.${template.extension}`,
        mimeType: template.mimeType,
        content: buildFileContent(template.mimeType, project.key, variantIndex),
      });
    }
  }

  return files;
};
