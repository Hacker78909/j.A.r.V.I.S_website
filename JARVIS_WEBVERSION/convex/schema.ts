import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  notes: defineTable({
    content: v.string(),
    color: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  animeList: defineTable({
    title: v.string(),
    type: v.optional(v.string()),
    status: v.string(),
    rating: v.optional(v.number()),
    streamingLinks: v.optional(v.array(v.object({
      site: v.string(),
      url: v.string(),
    }))),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  chatMessages: defineTable({
    content: v.string(),
    role: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  // New tables for creative platform
  pythonGames: defineTable({
    title: v.string(),
    description: v.string(),
    code: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  generatedImages: defineTable({
    prompt: v.string(),
    enhancedPrompt: v.optional(v.string()),
    imageUrl: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
