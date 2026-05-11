/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentChat from "../agentChat.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as companies from "../companies.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as environments from "../environments.js";
import type * as erase from "../erase.js";
import type * as establishmentSettings from "../establishmentSettings.js";
import type * as establishments from "../establishments.js";
import type * as establishmentsHelpers from "../establishmentsHelpers.js";
import type * as eventLog from "../eventLog.js";
import type * as ingredients from "../ingredients.js";
import type * as inventory from "../inventory.js";
import type * as inventoryQueries from "../inventoryQueries.js";
import type * as kpiBackfill from "../kpiBackfill.js";
import type * as kpis from "../kpis.js";
import type * as menu from "../menu.js";
import type * as orders from "../orders.js";
import type * as planning from "../planning.js";
import type * as products from "../products.js";
import type * as reservations from "../reservations.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as staff from "../staff.js";
import type * as tables from "../tables.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentChat: typeof agentChat;
  analytics: typeof analytics;
  auth: typeof auth;
  categories: typeof categories;
  companies: typeof companies;
  crons: typeof crons;
  customers: typeof customers;
  environments: typeof environments;
  erase: typeof erase;
  establishmentSettings: typeof establishmentSettings;
  establishments: typeof establishments;
  establishmentsHelpers: typeof establishmentsHelpers;
  eventLog: typeof eventLog;
  ingredients: typeof ingredients;
  inventory: typeof inventory;
  inventoryQueries: typeof inventoryQueries;
  kpiBackfill: typeof kpiBackfill;
  kpis: typeof kpis;
  menu: typeof menu;
  orders: typeof orders;
  planning: typeof planning;
  products: typeof products;
  reservations: typeof reservations;
  seed: typeof seed;
  sessions: typeof sessions;
  staff: typeof staff;
  tables: typeof tables;
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

export declare const components: {};
