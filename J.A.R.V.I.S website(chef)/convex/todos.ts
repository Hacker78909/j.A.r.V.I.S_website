import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    text: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("todos", {
      userId,
      text: args.text,
      completed: false,
      priority: args.priority,
      dueDate: args.dueDate,
      category: args.category,
      tags: args.tags,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    completed: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("todos").withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.completed !== undefined) {
      query = ctx.db.query("todos").withIndex("by_user_completed", (q) => 
        q.eq("userId", userId).eq("completed", args.completed!)
      );
    }

    const todos = await query.order("desc").collect();

    if (args.category) {
      return todos.filter(todo => todo.category === args.category);
    }

    return todos;
  },
});

export const toggle = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      completedAt: !todo.completed ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("todos"),
    text: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    const updates: any = {};
    if (args.text !== undefined) updates.text = args.text;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { total: 0, completed: 0, pending: 0, overdue: 0 };
    }

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = Date.now();
    const completed = todos.filter(todo => todo.completed).length;
    const pending = todos.filter(todo => !todo.completed).length;
    const overdue = todos.filter(todo => 
      !todo.completed && todo.dueDate && todo.dueDate < now
    ).length;

    return {
      total: todos.length,
      completed,
      pending,
      overdue,
    };
  },
});
