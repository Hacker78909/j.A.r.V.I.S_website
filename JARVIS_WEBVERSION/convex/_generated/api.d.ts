/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as anime from "../anime.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as creator from "../creator.js";
import type * as dataExport from "../dataExport.js";
import type * as http from "../http.js";
import type * as notes from "../notes.js";
import type * as router from "../router.js";
import type * as todos from "../todos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  anime: typeof anime;
  auth: typeof auth;
  chat: typeof chat;
  creator: typeof creator;
  dataExport: typeof dataExport;
  http: typeof http;
  notes: typeof notes;
  router: typeof router;
  todos: typeof todos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
