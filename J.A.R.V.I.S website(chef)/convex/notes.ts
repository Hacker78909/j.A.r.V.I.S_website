import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    content: v.string(),
    color: v.string(),
    position: v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    }),
    size: v.object({
      width: v.number(),
      height: v.number(),
    }),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId,
      content: args.content,
      color: args.color,
      position: args.position,
      size: args.size,
      tags: args.tags,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    position: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    })),
    size: v.optional(v.object({
      width: v.number(),
      height: v.number(),
    })),
    tags: v.optional(v.array(v.string())),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.content !== undefined) updates.content = args.content;
    if (args.color !== undefined) updates.color = args.color;
    if (args.position !== undefined) updates.position = args.position;
    if (args.size !== undefined) updates.size = args.size;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.pinned !== undefined) updates.pinned = args.pinned;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    await ctx.db.delete(args.id);
  },
});
