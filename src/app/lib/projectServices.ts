type ServiceJobConfig = {
  jobLabel: "Scope" | "Job";
  jobOptions: readonly string[];
  jobIcons: Record<string, string> | null;
};

const DEFAULT_JOB_OPTIONS = [
  "I would like to discuss some possibilities",
  "Create something new",
  "Refine something existing",
];

const WEB_DESIGN_SCOPE = [
  "UI/UX Audit",
  "Landing page(s)",
  "Website",
  "Web content or elements",
  "Design system",
  "Product design",
  "Interactive animations",
];

const WEB_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "UI/UX Audit": "\u{1F4E5}",
  "Landing page(s)": "\u{1F4C4}",
  Website: "\u{1F310}",
  "Web content or elements": "\u{1F58C}\uFE0F",
  "Design system": "\u{1F3A8}",
  "Product design": "\u{1F4F1}",
  "Interactive animations": "\u{1F300}",
};

const PRESENTATION_SCOPE = [
  "Create something new",
  "Revamp something existing",
  "Refine something existing",
  "Edit something existing",
];

const EMAIL_DESIGN_SCOPE = [...PRESENTATION_SCOPE];

const PRESENTATION_SCOPE_ICONS: Record<string, string> = {
  "Create something new": "\u{1F195}",
  "Revamp something existing": "\u{1F501}",
  "Refine something existing": "\u{270D}\uFE0F",
  "Edit something existing": "\u{1F4DD}",
};

const EMAIL_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "Create something new": "\u{1F4E7}",
  "Revamp something existing": "\u{1F501}",
  "Refine something existing": "\u{270D}\uFE0F",
  "Edit something existing": "\u{1F4DD}",
};

const BRANDING_SCOPE = [
  "From scratch",
  "Refresh an existing brand",
  "General brand assets",
  "Brand guidelines",
  "Logo design",
  "Icons",
  "Other",
];

const BRANDING_SCOPE_ICONS: Record<string, string> = {
  "From scratch": "\u{1F6E0}\uFE0F",
  "Refresh an existing brand": "\u{1F504}",
  "General brand assets": "\u{1F5C2}\uFE0F",
  "Brand guidelines": "\u{1F4D8}",
  "Logo design": "\u{2728}",
  Icons: "\u{1F522}",
  Other: "\u{2795}",
};

const PRODUCT_DESIGN_SCOPE = [
  "Web & mobile app design",
  "Dashboard design",
  "Digital assets (e.g. graphics or animations)",
  "Product Design MVP",
  "Other",
];

const PRODUCT_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "Web & mobile app design": "\u{1F4F1}",
  "Dashboard design": "\u{1F4CA}",
  "Digital assets (e.g. graphics or animations)": "\u{1F5BC}\uFE0F",
  "Product Design MVP": "\u{1F680}",
  Other: "\u{2795}",
};

export const CREATE_PROJECT_SERVICES = [
  "Web Design",
  "Branding",
  "Presentation",
  "Email Design",
  "Product Design",
  "Custom",
] as const;

export const DEFAULT_CREATE_PROJECT_SERVICE = CREATE_PROJECT_SERVICES[0];

const SERVICE_JOB_CONFIG: Record<string, ServiceJobConfig> = {
  "Web Design": {
    jobLabel: "Scope",
    jobOptions: WEB_DESIGN_SCOPE,
    jobIcons: WEB_DESIGN_SCOPE_ICONS,
  },
  Branding: {
    jobLabel: "Scope",
    jobOptions: BRANDING_SCOPE,
    jobIcons: BRANDING_SCOPE_ICONS,
  },
  Presentation: {
    jobLabel: "Scope",
    jobOptions: PRESENTATION_SCOPE,
    jobIcons: PRESENTATION_SCOPE_ICONS,
  },
  "Email Design": {
    jobLabel: "Scope",
    jobOptions: EMAIL_DESIGN_SCOPE,
    jobIcons: EMAIL_DESIGN_SCOPE_ICONS,
  },
  "Product Design": {
    jobLabel: "Scope",
    jobOptions: PRODUCT_DESIGN_SCOPE,
    jobIcons: PRODUCT_DESIGN_SCOPE_ICONS,
  },
  Custom: {
    jobLabel: "Scope",
    jobOptions: [],
    jobIcons: null,
  },
};

export const SERVICE_NAME_ALIASES: Record<string, string> = {
  webdesign: "Web Design",
  "web design": "Web Design",
  automation: "AI Automation",
  "ai automation": "AI Automation",
  marketing: "Marketing Campaigns",
  "marketing campaigns": "Marketing Campaigns",
  presentation: "Presentation",
  branding: "Branding",
  "email design": "Email Design",
  emaildesign: "Email Design",
  "product design": "Product Design",
  productdesign: "Product Design",
  custom: "Custom",
  "ai consulting": "AI Consulting",
  "creative strategy & concept": "Creative Strategy & Concept",
};

export const normalizeServiceName = (serviceName: string): string =>
  SERVICE_NAME_ALIASES[serviceName.toLowerCase()] ?? serviceName;

export const getServiceJobConfig = (
  selectedService: string | null | undefined,
): ServiceJobConfig => {
  if (!selectedService) {
    return {
      jobLabel: "Job",
      jobOptions: DEFAULT_JOB_OPTIONS,
      jobIcons: null,
    };
  }
  const normalizedService = normalizeServiceName(selectedService);
  return (
    SERVICE_JOB_CONFIG[normalizedService] ?? {
      jobLabel: "Job",
      jobOptions: DEFAULT_JOB_OPTIONS,
      jobIcons: null,
    }
  );
};

export const getServiceJobLabel = (
  selectedService: string | null | undefined,
): "Scope" | "Job" => getServiceJobConfig(selectedService).jobLabel;

export const serviceRequiresJobSelection = (
  selectedService: string | null | undefined,
): boolean => getServiceJobConfig(selectedService).jobOptions.length > 0;
