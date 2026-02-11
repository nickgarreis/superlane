/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as collaboration from "../collaboration.js";
import type * as comments from "../comments.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as dateNormalization from "../dateNormalization.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dashboardContext from "../lib/dashboardContext.js";
import type * as lib_dateNormalization from "../lib/dateNormalization.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_filePolicy from "../lib/filePolicy.js";
import type * as lib_logging from "../lib/logging.js";
import type * as lib_notificationPreferences from "../lib/notificationPreferences.js";
import type * as lib_projectAttachments from "../lib/projectAttachments.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_taskMutations from "../lib/taskMutations.js";
import type * as lib_taskPagination from "../lib/taskPagination.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_workosOrganization from "../lib/workosOrganization.js";
import type * as notificationsEmail from "../notificationsEmail.js";
import type * as organizationSync from "../organizationSync.js";
import type * as organizationSyncInternal from "../organizationSyncInternal.js";
import type * as performanceBackfills from "../performanceBackfills.js";
import type * as projects from "../projects.js";
import type * as settings from "../settings.js";
import type * as tasks from "../tasks.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  collaboration: typeof collaboration;
  comments: typeof comments;
  crons: typeof crons;
  dashboard: typeof dashboard;
  dateNormalization: typeof dateNormalization;
  files: typeof files;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/dashboardContext": typeof lib_dashboardContext;
  "lib/dateNormalization": typeof lib_dateNormalization;
  "lib/env": typeof lib_env;
  "lib/filePolicy": typeof lib_filePolicy;
  "lib/logging": typeof lib_logging;
  "lib/notificationPreferences": typeof lib_notificationPreferences;
  "lib/projectAttachments": typeof lib_projectAttachments;
  "lib/rbac": typeof lib_rbac;
  "lib/taskMutations": typeof lib_taskMutations;
  "lib/taskPagination": typeof lib_taskPagination;
  "lib/validators": typeof lib_validators;
  "lib/workosOrganization": typeof lib_workosOrganization;
  notificationsEmail: typeof notificationsEmail;
  organizationSync: typeof organizationSync;
  organizationSyncInternal: typeof organizationSyncInternal;
  performanceBackfills: typeof performanceBackfills;
  projects: typeof projects;
  settings: typeof settings;
  tasks: typeof tasks;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workOSAuthKit: {
    lib: {
      enqueueWebhookEvent: FunctionReference<
        "mutation",
        "internal",
        {
          apiKey: string;
          event: string;
          eventId: string;
          eventTypes?: Array<string>;
          logLevel?: "DEBUG";
          onEventHandle?: string;
          updatedAt?: string;
        },
        any
      >;
      getAuthUser: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          createdAt: string;
          email: string;
          emailVerified: boolean;
          externalId?: null | string;
          firstName?: null | string;
          id: string;
          lastName?: null | string;
          lastSignInAt?: null | string;
          locale?: null | string;
          metadata: Record<string, any>;
          profilePictureUrl?: null | string;
          updatedAt: string;
        } | null
      >;
    };
  };
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: Array<string> | string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bcc?: Array<string>;
          bounced?: boolean;
          cc?: Array<string>;
          clicked?: boolean;
          complained: boolean;
          createdAt: number;
          deliveryDelayed?: boolean;
          errorMessage?: string;
          failed?: boolean;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bounced: boolean;
          clicked: boolean;
          complained: boolean;
          deliveryDelayed: boolean;
          errorMessage: string | null;
          failed: boolean;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          bcc?: Array<string>;
          cc?: Array<string>;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
