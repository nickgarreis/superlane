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
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_filePolicy from "../lib/filePolicy.js";
import type * as lib_projectAttachments from "../lib/projectAttachments.js";
import type * as lib_rbac from "../lib/rbac.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_workosOrganization from "../lib/workosOrganization.js";
import type * as organizationSync from "../organizationSync.js";
import type * as organizationSyncInternal from "../organizationSyncInternal.js";
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
  files: typeof files;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/env": typeof lib_env;
  "lib/filePolicy": typeof lib_filePolicy;
  "lib/projectAttachments": typeof lib_projectAttachments;
  "lib/rbac": typeof lib_rbac;
  "lib/validators": typeof lib_validators;
  "lib/workosOrganization": typeof lib_workosOrganization;
  organizationSync: typeof organizationSync;
  organizationSyncInternal: typeof organizationSyncInternal;
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
};
