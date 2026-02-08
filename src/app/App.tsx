import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { Tasks } from "./components/Tasks";
import { ArchivePage } from "./components/ArchivePage";
import { SearchPopup } from "./components/SearchPopup";
import { CreateProjectPopup } from "./components/CreateProjectPopup";
import { SettingsPopup } from "./components/SettingsPopup";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import { Workspace, ProjectData, ProjectDraftData } from "./types";
import { AuthPage } from "./components/AuthPage";

const WORKSPACES: Workspace[] = [
  { id: "spacex", name: "SpaceX", plan: "Free Plan", logo: imgLogo },
  { id: "tesla", name: "Tesla", plan: "Pro Plan", logoColor: "emerald-600", logoText: "T" }
];

const INITIAL_PROJECTS: Record<string, ProjectData> = {
  "website-redesign": {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Automatically looks at incoming emails and determines if they should be replied to. If so, it will write a draft response. Draft responses will be found directly in your email account and in Sana.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" },
    category: "Web Design",
    scope: "Website",
    deadline: "24.02.26",
    workspaceId: "spacex",
    tasks: [
      { id: "1", title: "Design system audit", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Tomorrow", completed: false },
      { id: "2", title: "Update typography tokens", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 10", completed: true },
      { id: "3", title: "Review mobile navigation", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 12", completed: false }
    ]
  },
  "n8n-workflow": {
    id: "n8n-workflow",
    name: "N8N Workflow",
    description: "Automated workflow for processing incoming customer support tickets and routing them to the correct department based on keyword analysis.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Build something new",
    deadline: "15.03.26",
    workspaceId: "spacex",
    tasks: [
      { id: "n1", title: "Map ticket categories", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 15", completed: true },
      { id: "n2", title: "Build routing logic", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 20", completed: false },
      { id: "n3", title: "Test with sample tickets", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 1", completed: false }
    ]
  },
  "meta-ad": {
    id: "meta-ad",
    name: "Meta Ad",
    description: "Campaign assets and copy for the Q2 marketing push. Includes A/B testing variations for different demographics.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Review", color: "#FF5F1F", bgColor: "rgba(255, 95, 31, 0.1)", dotColor: "#FF5F1F" },
    category: "Web Design",
    scope: "Build something new",
    deadline: "01.04.26",
    workspaceId: "spacex",
    tasks: [
      { id: "m1", title: "Write ad copy variations", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 5", completed: true },
      { id: "m2", title: "Design carousel assets", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 10", completed: false }
    ]
  },
  // ── More Active Projects ──────────────────────────────────────
  "mobile-app-v2": {
    id: "mobile-app-v2",
    name: "Mobile App V2",
    description: "Major overhaul of the mobile experience with new onboarding flow, redesigned dashboard, and push notification system.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "App Redesign",
    deadline: "20.04.26",
    workspaceId: "spacex",
    tasks: [
      { id: "mv1", title: "Onboarding wireframes", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 28", completed: true },
      { id: "mv2", title: "Push notification service", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 15", completed: false },
      { id: "mv3", title: "Beta testing round 1", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Apr 1", completed: false }
    ]
  },
  "seo-audit": {
    id: "seo-audit",
    name: "SEO Audit Q1",
    description: "Comprehensive audit of all landing pages, meta tags, page speed, and backlink profile to improve organic search rankings.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "SEO",
    deadline: "10.03.26",
    workspaceId: "spacex",
    tasks: [
      { id: "seo1", title: "Run Lighthouse audits", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 12", completed: true },
      { id: "seo2", title: "Fix meta descriptions", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 20", completed: true },
      { id: "seo3", title: "Submit updated sitemap", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 1", completed: false }
    ]
  },
  "crm-integration": {
    id: "crm-integration",
    name: "CRM Integration",
    description: "Connect our CRM with Slack, email, and the internal dashboard for real-time lead notifications and pipeline updates.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" },
    category: "Web Design",
    scope: "Integration",
    deadline: "30.04.26",
    workspaceId: "spacex",
    tasks: []
  },
  "investor-deck": {
    id: "investor-deck",
    name: "Investor Deck 2026",
    description: "Updated pitch deck for the Series B fundraise. Includes new traction metrics, product roadmap, and financial projections.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Review", color: "#FF5F1F", bgColor: "rgba(255, 95, 31, 0.1)", dotColor: "#FF5F1F" },
    category: "Web Design",
    scope: "Presentation",
    deadline: "28.02.26",
    workspaceId: "spacex",
    tasks: [
      { id: "inv1", title: "Update revenue slide", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 20", completed: true },
      { id: "inv2", title: "Add product roadmap", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 25", completed: false }
    ]
  },
  "design-system": {
    id: "design-system",
    name: "Design System v3",
    description: "Migrate the existing component library to Tailwind v4 tokens with dark mode support and improved accessibility standards.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Design System",
    deadline: "15.05.26",
    workspaceId: "spacex",
    tasks: [
      { id: "ds1", title: "Audit existing tokens", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 15", completed: true },
      { id: "ds2", title: "Build color palette", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Mar 1", completed: false },
      { id: "ds3", title: "Document components", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Apr 1", completed: false }
    ]
  },
  // ── Tesla Workspace Projects ──────────────────────────────────
  "tesla-landing": {
    id: "tesla-landing",
    name: "Tesla Landing Page",
    description: "Promotional landing page for the Cybertruck pre-order campaign with interactive 3D configurator and lead capture form.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Landing Page",
    deadline: "01.03.26",
    workspaceId: "tesla",
    tasks: [
      { id: "tl1", title: "Hero section design", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 14", completed: true },
      { id: "tl2", title: "3D model integration", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Feb 22", completed: false }
    ]
  },
  "tesla-social": {
    id: "tesla-social",
    name: "Social Media Campaign",
    description: "Monthly content calendar and creative assets for Tesla's Instagram, Twitter, and LinkedIn channels.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" },
    category: "Web Design",
    scope: "Social Media",
    deadline: "28.02.26",
    workspaceId: "tesla",
    tasks: []
  },
  // ── Archived Projects ─────────────────────────────────────────
  "old-blog": {
    id: "old-blog",
    name: "Blog Migration",
    description: "Migrated the legacy WordPress blog to a headless CMS with Next.js frontend. All 450 posts transferred successfully.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Blog",
    deadline: "01.12.25",
    workspaceId: "spacex",
    archived: true,
    archivedAt: "2025-12-15T10:30:00Z",
    tasks: [
      { id: "ob1", title: "Export WordPress data", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Nov 10", completed: true },
      { id: "ob2", title: "Build CMS schema", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Nov 20", completed: true }
    ]
  },
  "old-email-campaign": {
    id: "old-email-campaign",
    name: "Holiday Email Campaign",
    description: "Email drip sequence for the 2025 holiday season including Black Friday, Cyber Monday, and end-of-year promotions.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Email",
    deadline: "25.12.25",
    workspaceId: "spacex",
    archived: true,
    archivedAt: "2025-12-28T14:00:00Z",
    tasks: []
  },
  "old-api-docs": {
    id: "old-api-docs",
    name: "API Documentation v1",
    description: "Initial API reference documentation covering all public endpoints, authentication flows, and rate limits.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" },
    category: "Web Design",
    scope: "Documentation",
    deadline: "15.11.25",
    workspaceId: "spacex",
    archived: true,
    archivedAt: "2025-11-20T09:00:00Z",
    tasks: []
  },
  "old-onboarding": {
    id: "old-onboarding",
    name: "Onboarding Flow v1",
    description: "Original user onboarding flow with email verification, profile setup, and guided tour. Replaced by v2.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Review", color: "#FF5F1F", bgColor: "rgba(255, 95, 31, 0.1)", dotColor: "#FF5F1F" },
    category: "Web Design",
    scope: "UX",
    deadline: "01.10.25",
    workspaceId: "spacex",
    archived: true,
    archivedAt: "2025-10-15T11:30:00Z",
    tasks: []
  },
  // ── Completed Projects (12 total — enough to test the 8 limit + "View all") ──
  "completed-brand-guide": {
    id: "completed-brand-guide",
    name: "Brand Guidelines",
    description: "Comprehensive brand guidelines document covering logo usage, typography, color palette, voice & tone, and photography style.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Branding",
    deadline: "15.01.26",
    workspaceId: "spacex",
    completedAt: "2026-01-12T16:00:00Z",
    tasks: [
      { id: "bg1", title: "Define color palette", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Dec 20", completed: true },
      { id: "bg2", title: "Write tone of voice guide", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jan 5", completed: true },
      { id: "bg3", title: "Create logo usage rules", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jan 10", completed: true }
    ]
  },
  "completed-analytics": {
    id: "completed-analytics",
    name: "Analytics Dashboard",
    description: "Internal analytics dashboard showing real-time KPIs, user funnels, and revenue metrics with exportable reports.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Dashboard",
    deadline: "20.12.25",
    workspaceId: "spacex",
    completedAt: "2025-12-18T09:30:00Z",
    tasks: [
      { id: "an1", title: "Connect data sources", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Nov 30", completed: true },
      { id: "an2", title: "Build chart components", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Dec 10", completed: true }
    ]
  },
  "completed-newsletter": {
    id: "completed-newsletter",
    name: "Newsletter System",
    description: "Automated newsletter pipeline with subscriber segmentation, template builder, and delivery scheduling.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Email",
    deadline: "05.01.26",
    workspaceId: "spacex",
    completedAt: "2026-01-03T14:15:00Z",
    tasks: []
  },
  "completed-chatbot": {
    id: "completed-chatbot",
    name: "Support Chatbot",
    description: "AI-powered customer support chatbot trained on our knowledge base. Handles tier-1 support queries automatically.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "AI/ML",
    deadline: "10.11.25",
    workspaceId: "spacex",
    completedAt: "2025-11-08T11:00:00Z",
    tasks: [
      { id: "cb1", title: "Train on knowledge base", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Oct 25", completed: true },
      { id: "cb2", title: "Build chat widget", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Nov 1", completed: true },
      { id: "cb3", title: "QA testing", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Nov 5", completed: true }
    ]
  },
  "completed-payment": {
    id: "completed-payment",
    name: "Payment Gateway",
    description: "Stripe integration with support for subscriptions, one-time payments, invoicing, and webhook-based fulfillment.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Payments",
    deadline: "01.10.25",
    workspaceId: "spacex",
    completedAt: "2025-09-28T10:00:00Z",
    tasks: []
  },
  "completed-landing-a": {
    id: "completed-landing-a",
    name: "Product Launch Page",
    description: "High-conversion landing page for the V2 product launch with animated hero, testimonials, and pricing section.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Landing Page",
    deadline: "15.09.25",
    workspaceId: "spacex",
    completedAt: "2025-09-12T15:30:00Z",
    tasks: []
  },
  "completed-video-ads": {
    id: "completed-video-ads",
    name: "Video Ad Series",
    description: "Three 30-second video ads for YouTube and Instagram targeting different audience segments with A/B variants.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Video Production",
    deadline: "20.08.25",
    workspaceId: "spacex",
    completedAt: "2025-08-18T13:00:00Z",
    tasks: [
      { id: "va1", title: "Script writing", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jul 30", completed: true },
      { id: "va2", title: "Storyboard review", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Aug 5", completed: true },
      { id: "va3", title: "Final render", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Aug 15", completed: true }
    ]
  },
  "completed-email-templates": {
    id: "completed-email-templates",
    name: "Email Templates",
    description: "Responsive HTML email templates for transactional emails: welcome, password reset, invoice, and shipping confirmation.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Email",
    deadline: "01.08.25",
    workspaceId: "spacex",
    completedAt: "2025-07-29T10:45:00Z",
    tasks: []
  },
  "completed-competitor-analysis": {
    id: "completed-competitor-analysis",
    name: "Competitor Analysis",
    description: "Deep-dive competitive analysis covering pricing, features, market positioning, and SWOT for our top 5 competitors.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Research",
    deadline: "15.07.25",
    workspaceId: "spacex",
    completedAt: "2025-07-14T08:30:00Z",
    tasks: [
      { id: "ca1", title: "Gather competitor data", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jun 30", completed: true },
      { id: "ca2", title: "Build comparison matrix", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jul 8", completed: true }
    ]
  },
  "completed-icon-set": {
    id: "completed-icon-set",
    name: "Custom Icon Set",
    description: "Bespoke icon library with 120 icons in outline and filled variants, exported as SVG and React components.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Icons",
    deadline: "01.07.25",
    workspaceId: "spacex",
    completedAt: "2025-06-28T17:00:00Z",
    tasks: []
  },
  "completed-slack-bot": {
    id: "completed-slack-bot",
    name: "Slack Bot",
    description: "Custom Slack bot for internal standup collection, PTO tracking, and automated weekly digest posting to #general.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Bot",
    deadline: "15.06.25",
    workspaceId: "spacex",
    completedAt: "2025-06-12T12:00:00Z",
    tasks: [
      { id: "sb1", title: "Build standup flow", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "May 30", completed: true },
      { id: "sb2", title: "Add PTO commands", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jun 5", completed: true },
      { id: "sb3", title: "Weekly digest cron", assignee: { name: "Nick", avatar: imgAvatar }, dueDate: "Jun 10", completed: true }
    ]
  },
  "completed-data-pipeline": {
    id: "completed-data-pipeline",
    name: "Data Pipeline",
    description: "ETL pipeline pulling data from 6 sources into a unified data warehouse with daily refresh and anomaly detection.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Data Engineering",
    deadline: "01.06.25",
    workspaceId: "spacex",
    completedAt: "2025-05-29T09:00:00Z",
    tasks: []
  },
  // ── Tesla completed projects ──────────────────────────────────
  "tesla-completed-brochure": {
    id: "tesla-completed-brochure",
    name: "Digital Brochure",
    description: "Interactive digital brochure for the Model Y refresh with embedded video, 360° interior view, and spec comparison tool.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" },
    category: "Web Design",
    scope: "Brochure",
    deadline: "01.01.26",
    workspaceId: "tesla",
    completedAt: "2025-12-30T10:00:00Z",
    tasks: []
  },
  // ── Tesla archived project ────────────────────────────────────
  "tesla-old-microsite": {
    id: "tesla-old-microsite",
    name: "Event Microsite",
    description: "Microsite for the 2025 Tesla AI Day event. Included live stream embed, agenda, and speaker bios.",
    creator: { name: "Nick", avatar: imgAvatar },
    status: { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" },
    category: "Web Design",
    scope: "Microsite",
    deadline: "01.09.25",
    workspaceId: "tesla",
    archived: true,
    archivedAt: "2025-09-05T16:00:00Z",
    tasks: []
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentView, setCurrentView] = React.useState("project:n8n-workflow");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = React.useState(false);
  const [highlightedArchiveProjectId, setHighlightedArchiveProjectId] = React.useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] = React.useState<{ type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string } | null>(null);
  const [editProjectId, setEditProjectId] = React.useState<string | null>(null);
  const [editDraftData, setEditDraftData] = React.useState<ProjectDraftData | null>(null);
  const [reviewProject, setReviewProject] = React.useState<ProjectData | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [settingsTab, setSettingsTab] = React.useState<"Account" | "Notifications" | "Company" | "Billing">("Account");

  const [projects, setProjects] = React.useState<Record<string, ProjectData>>(INITIAL_PROJECTS);
  
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState("spacex");
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>(WORKSPACES);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSettings = (tab: "Account" | "Notifications" | "Company" | "Billing" = "Account") => {
      setSettingsTab(tab);
      setIsSettingsOpen(true);
  };

  // Filter projects for the active workspace
  const visibleProjects = Object.entries(projects).reduce((acc, [key, project]) => {
     if (project.workspaceId === activeWorkspaceId) {
        acc[key] = project;
     }
     return acc;
  }, {} as Record<string, ProjectData>);

  const handleSwitchWorkspace = (id: string) => {
     setActiveWorkspaceId(id);
     
     // Prefer Active projects that have detail pages (skip Draft & Review)
     const activeProject = Object.values(projects).find(
       p => p.workspaceId === id && !p.archived && p.status.label !== "Draft" && p.status.label !== "Review"
     );
     const firstProjectInWorkspace = activeProject || Object.values(projects).find(p => p.workspaceId === id && !p.archived);
     if (firstProjectInWorkspace && firstProjectInWorkspace.status.label !== "Draft" && firstProjectInWorkspace.status.label !== "Review") {
         setCurrentView(`project:${firstProjectInWorkspace.id}`);
     } else {
         setCurrentView("tasks");
     }
  };

  const handleCreateWorkspace = () => {
      const name = window.prompt("Enter workspace name:");
      if (name) {
         const newWorkspace: Workspace = {
             id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
             name: name,
             plan: "Free Plan",
             logoColor: "blue-600", // Randomize or default
             logoText: name.charAt(0).toUpperCase()
         };
         setWorkspaces(prev => [...prev, newWorkspace]);
         handleSwitchWorkspace(newWorkspace.id);
      }
  };

  const handleUpdateWorkspace = (id: string, data: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => 
        w.id === id ? { ...w, ...data } : w
    ));
  };

  const handleCreateProject = (projectData: Partial<ProjectData> & { status?: string; draftData?: ProjectDraftData | null; _editProjectId?: string }) => {
    // Determine status object based on the passed string status or default to Draft
    let statusObj = { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" };
    
    if (projectData.status === "Review") {
        statusObj = { label: "Review", color: "#FF5F1F", bgColor: "rgba(255, 95, 31, 0.1)", dotColor: "#FF5F1F" };
    } else if (projectData.status === "Active") {
        statusObj = { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" };
    } else if (projectData.status === "Completed") {
        statusObj = { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" };
    }

    // Check if we're editing an existing project
    const existingId = projectData._editProjectId;
    if (existingId && projects[existingId]) {
      setProjects(prev => ({
        ...prev,
        [existingId]: {
          ...prev[existingId],
          name: projectData.name || prev[existingId].name,
          description: projectData.description || "",
          category: projectData.category || prev[existingId].category,
          scope: projectData.scope || undefined,
          deadline: projectData.deadline || prev[existingId].deadline,
          status: statusObj,
          draftData: projectData.draftData || undefined,
          attachments: projectData.attachments && projectData.attachments.length > 0 
            ? [...(prev[existingId].attachments || []), ...projectData.attachments]
            : prev[existingId].attachments,
        }
      }));
      // Only navigate to project detail page for Active statuses
      if (projectData.status !== "Draft" && projectData.status !== "Review") {
        setCurrentView(`project:${existingId}`);
      }
      // Clear edit state
      setEditProjectId(null);
      setEditDraftData(null);
      // Toast notification
      if (projectData.status === "Draft") {
        toast.success("Draft saved");
      } else {
        toast.success("Project updated");
      }
      return;
    }

    const id = projectData._generatedId || (projectData.name || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const newProject: ProjectData = {
      id,
      name: projectData.name || "Untitled Project",
      description: projectData.description || "",
      creator: { name: "Nick", avatar: imgAvatar },
      status: statusObj,
      category: projectData.category || "General",
      scope: projectData.scope || undefined,
      deadline: projectData.deadline || new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      workspaceId: activeWorkspaceId,
      attachments: projectData.attachments,
      draftData: projectData.draftData || undefined,
    };

    setProjects(prev => ({ ...prev, [id]: newProject }));
    // Only navigate to project detail page for Active statuses
    if (projectData.status !== "Draft" && projectData.status !== "Review") {
      setCurrentView(`project:${id}`);
    }
    // Toast notification for new projects
    if (projectData.status === "Draft") {
      toast.success("Draft saved");
    } else {
      toast.success("Project created");
    }
  };

  // Map legacy category names to SERVICES array values for the creation funnel
  const categoryToService = (category: string): string => {
    const map: Record<string, string> = {
      "webdesign": "Web Design",
      "web design": "Web Design",
      "automation": "AI Automation",
      "ai automation": "AI Automation",
      "marketing": "Marketing Campaigns",
      "marketing campaigns": "Marketing Campaigns",
      "presentation": "Presentation",
      "ai consulting": "AI Consulting",
      "creative strategy & concept": "Creative Strategy & Concept",
    };
    return map[category.toLowerCase()] || category;
  };

  const handleEditProject = (project: ProjectData) => {
    // Build draft data from project fields if no stored draftData exists
    const draftData: ProjectDraftData = project.draftData || {
      selectedService: categoryToService(project.category),
      projectName: project.name,
      selectedJob: project.scope || "",
      description: project.description,
      isAIEnabled: true,
      deadline: undefined,
      lastStep: 1,
    };
    setEditProjectId(project.id);
    setEditDraftData(draftData);
    setIsCreateProjectOpen(true);
  };

  const handleViewReviewProject = (project: ProjectData) => {
    setReviewProject(project);
    setIsCreateProjectOpen(true);
  };

  const handleUpdateComments = (projectId: string, comments: Array<{ id: string; author: { name: string; avatar: string }; content: string; timestamp: string }>) => {
    setProjects(prev => {
      if (!prev[projectId]) return prev;
      return {
        ...prev,
        [projectId]: {
          ...prev[projectId],
          comments,
        },
      };
    });
  };

  const handleArchiveProject = (id: string) => {
    setProjects(prev => {
        const project = prev[id];
        if (!project) return prev;
        
        return {
            ...prev,
            [id]: {
                ...project,
                archived: true,
                archivedAt: new Date().toISOString(),
                previousStatus: project.status, // Save current status
                status: { 
                    label: "Archived", 
                    color: "#9CA3AF", 
                    bgColor: "rgba(156, 163, 175, 0.1)", 
                    dotColor: "#6B7280" 
                }
            }
        };
    });
    // Navigate to archive page and highlight the newly archived project
    setHighlightedArchiveProjectId(id);
    setCurrentView("archive");
    toast.success("Project archived");
  };

  const handleUnarchiveProject = (id: string) => {
    setProjects(prev => {
        const project = prev[id];
        if (!project) return prev;
        
        // Restore previous status or default to Review if no previous status exists
        const restoredStatus = project.previousStatus || { 
            label: "Review", 
            color: "#FF5F1F", 
            bgColor: "rgba(255, 95, 31, 0.1)", 
            dotColor: "#FF5F1F" 
        };

        return {
            ...prev,
            [id]: {
                ...project,
                archived: false,
                archivedAt: undefined,
                previousStatus: undefined, // Clear previous status
                status: restoredStatus
            }
        };
    });
    // If viewing this project from the archive, go back to archive page
    if (currentView === `archive-project:${id}`) {
        setCurrentView("archive");
    }
    toast.success("Project unarchived");
  };

  const handleDeleteProject = (id: string) => {
    const project = projects[id];
    const isDraft = project?.status?.label === "Draft";
    
    setProjects(prev => {
        const newProjects = { ...prev };
        delete newProjects[id];
        return newProjects;
    });
    
    // If the deleted project was the current view, switch to a safe view
    if (currentView === `project:${id}` || currentView === `archive-project:${id}`) {
        if (currentView.startsWith('archive-project:')) {
            setCurrentView("archive");
        } else {
            // Try to find another project
            const otherProject = Object.values(visibleProjects).find(p => p.id !== id && !p.archived);
            if (otherProject) {
                setCurrentView(`project:${otherProject.id}`);
            } else {
                setCurrentView("empty");
            }
        }
    }
    toast.success(isDraft ? "Draft deleted" : "Project deleted");
  };

  const handleUpdateProjectStatus = (id: string, newStatus: string) => {
    setProjects(prev => {
        const project = prev[id];
        if (!project) return prev;

        let statusObj = project.status;
        if (newStatus === "Draft") {
            statusObj = { label: "Draft", color: "#58AFFF", bgColor: "rgba(0,122,187,0.1)", dotColor: "#0087d5" };
        } else if (newStatus === "Review") {
            statusObj = { label: "Review", color: "#FF5F1F", bgColor: "rgba(255, 95, 31, 0.1)", dotColor: "#FF5F1F" };
        } else if (newStatus === "Active") {
            statusObj = { label: "Active", color: "#a6f4c5", bgColor: "rgba(16,185,129,0.1)", dotColor: "#10b981" };
        } else if (newStatus === "Completed") {
            statusObj = { label: "Completed", color: "#22c55e", bgColor: "rgba(34,197,94,0.1)", dotColor: "#16a34a" };
        }

        return {
            ...prev,
            [id]: {
                ...project,
                archived: false,
                status: statusObj,
                completedAt: newStatus === "Completed" ? new Date().toISOString() : undefined
            }
        };
    });
    if (newStatus === "Completed") {
        toast.success("Project marked as completed");
    }
  };

  const handleUpdateProject = (id: string, data: Partial<ProjectData>) => {
      setProjects(prev => ({
          ...prev,
          [id]: { ...prev[id], ...data }
      }));
  };

  const renderContent = () => {
    if (currentView === "tasks") return (
        <Tasks 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen} 
            projects={visibleProjects}
            onUpdateProject={handleUpdateProject}
        />
    );
    if (currentView === "archive") return (
        <ArchivePage 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen}
            projects={visibleProjects}
            onNavigateToProject={(id) => setCurrentView(`archive-project:${id}`)}
            onUnarchiveProject={handleUnarchiveProject}
            onDeleteProject={handleDeleteProject}
            highlightedProjectId={highlightedArchiveProjectId}
            setHighlightedProjectId={setHighlightedArchiveProjectId}
        />
    );

    if (currentView.startsWith("archive-project:")) {
      const projectId = currentView.split(":")[1];
      const project = projects[projectId];
      if (project) {
        return (
            <MainContent 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                isSidebarOpen={isSidebarOpen}
                project={project} 
                onArchiveProject={handleArchiveProject} 
                onUnarchiveProject={handleUnarchiveProject} 
                onDeleteProject={handleDeleteProject}
                allProjects={visibleProjects}
                onNavigate={setCurrentView}
                onUpdateStatus={handleUpdateProjectStatus}
                onUpdateProject={(data) => handleUpdateProject(project.id, data)}
                backTo="archive"
                onBack={() => setCurrentView("archive")}
                pendingHighlight={pendingHighlight}
                onClearPendingHighlight={() => setPendingHighlight(null)}
            />
        );
      }
    }

    if (currentView.startsWith("project:")) {
      const projectId = currentView.split(":")[1];
      const project = projects[projectId];
      // Ensure we only show projects from active workspace, or handle cross-workspace links if needed.
      if (project) {
        return (
            <MainContent 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                isSidebarOpen={isSidebarOpen}
                project={project} 
                onArchiveProject={handleArchiveProject} 
                onUnarchiveProject={handleUnarchiveProject} 
                onDeleteProject={handleDeleteProject}
                allProjects={visibleProjects}
                onNavigate={setCurrentView}
                onUpdateStatus={handleUpdateProjectStatus}
                onUpdateProject={(data) => handleUpdateProject(project.id, data)}
                pendingHighlight={pendingHighlight}
                onClearPendingHighlight={() => setPendingHighlight(null)}
            />
        );
      }
    }
    
    // Fallback: If current view is invalid, try to find the first Active project.
    const firstProject = Object.values(visibleProjects).find(
      p => !p.archived && p.status.label !== "Draft" && p.status.label !== "Review"
    );
    if (firstProject) {
        return (
            <MainContent 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                isSidebarOpen={isSidebarOpen}
                project={firstProject} 
                onArchiveProject={handleArchiveProject} 
                onUnarchiveProject={handleUnarchiveProject} 
                onDeleteProject={handleDeleteProject}
                allProjects={visibleProjects}
                onNavigate={setCurrentView}
                onUpdateStatus={handleUpdateProjectStatus}
                onUpdateProject={(data) => handleUpdateProject(firstProject.id, data)}
                pendingHighlight={pendingHighlight}
                onClearPendingHighlight={() => setPendingHighlight(null)}
            />
        );
    }

    // Empty state if no projects exist
    return (
        <div className="flex-1 h-full bg-[#141515] flex flex-col items-center justify-center text-white/20">
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <img src={imgLogo} className="w-8 h-8 opacity-40 grayscale" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">No projects in this workspace</p>
                    <button 
                        onClick={() => setIsCreateProjectOpen(true)} 
                        className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
                    >
                        Create new project
                    </button>
                </div>
             </div>
        </div>
    );
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="flex h-screen w-full bg-[#141515] overflow-hidden font-['Roboto',sans-serif] antialiased text-[#E8E8E8]">
      <SearchPopup 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        projects={projects}
        onNavigate={(view) => { setCurrentView(view); }}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenSettings={(tab) => handleOpenSettings(tab as any)}
        onHighlightNavigate={(projectId, highlight) => {
          setPendingHighlight(highlight);
        }}
      />
      <CreateProjectPopup 
        isOpen={isCreateProjectOpen} 
        onClose={() => {
          setIsCreateProjectOpen(false);
          setEditProjectId(null);
          setEditDraftData(null);
          setReviewProject(null);
        }} 
        onCreate={handleCreateProject}
        user={{ name: "Nick", avatar: imgAvatar }}
        editProjectId={editProjectId}
        initialDraftData={editDraftData}
        onDeleteDraft={handleDeleteProject}
        reviewProject={reviewProject}
        onUpdateComments={handleUpdateComments}
      />
      <SettingsPopup 
         isOpen={isSettingsOpen}
         onClose={() => setIsSettingsOpen(false)}
         initialTab={settingsTab}
         activeWorkspace={activeWorkspace}
         onUpdateWorkspace={handleUpdateWorkspace}
      />
      <Toaster 
         position="bottom-right" 
         theme="dark"
         gap={8}
         duration={3000}
         offset={20}
         toastOptions={{
           style: {
             background: '#1A1A1C',
             border: '1px solid rgba(255,255,255,0.08)',
             borderRadius: '14px',
             color: '#E8E8E8',
             fontFamily: "'Roboto', sans-serif",
             fontSize: '13px',
             padding: '14px 16px',
             boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
             backdropFilter: 'blur(12px)',
             gap: '12px',
           },
           classNames: {
             toast: 'custom-toast',
             title: 'custom-toast-title',
             icon: 'custom-toast-icon',
             success: 'custom-toast-success',
             error: 'custom-toast-error',
             info: 'custom-toast-info',
           },
         }}
       />
      
      <AnimatePresence mode="wait" initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full shrink-0 overflow-hidden"
          >
            <div className="w-[260px] h-full">
              <Sidebar 
                onNavigate={setCurrentView} 
                onSearch={() => setIsSearchOpen(true)} 
                currentView={currentView}
                onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                projects={visibleProjects}
                activeWorkspace={activeWorkspace}
                workspaces={workspaces}
                onSwitchWorkspace={handleSwitchWorkspace}
                onCreateWorkspace={handleCreateWorkspace}
                onOpenSettings={handleOpenSettings}
                onArchiveProject={handleArchiveProject}
                onUnarchiveProject={handleUnarchiveProject}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                onEditProject={handleEditProject}
                onViewReviewProject={handleViewReviewProject}
                onLogout={() => setIsAuthenticated(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {renderContent()}
    </div>
    </DndProvider>
  );
}