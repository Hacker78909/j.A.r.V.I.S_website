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
import type * as analytics from "../analytics.js";
import type * as anime from "../anime.js";
import type * as auth from "../auth.js";
import type * as calendar from "../calendar.js";
import type * as code from "../code.js";
import type * as expenses from "../expenses.js";
import type * as games from "../games.js";
import type * as habits from "../habits.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as jarvis from "../jarvis.js";
import type * as notes from "../notes.js";
import type * as recipes from "../recipes.js";
import type * as router from "../router.js";
import type * as todos from "../todos.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  anime: typeof anime;
  auth: typeof auth;
  calendar: typeof calendar;
  code: typeof code;
  expenses: typeof expenses;
  games: typeof games;
  habits: typeof habits;
  http: typeof http;
  images: typeof images;
  jarvis: typeof jarvis;
  notes: typeof notes;
  recipes: typeof recipes;
  router: typeof router;
  todos: typeof todos;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
