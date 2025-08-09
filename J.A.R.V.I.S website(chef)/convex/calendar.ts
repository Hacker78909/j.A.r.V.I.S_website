import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    category: v.string(),
    color: v.string(),
    location: v.optional(v.string()),
    reminders: v.array(v.object({
      type: v.union(v.literal("email"), v.literal("notification")),
      minutes: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("events", {
      userId,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      allDay: args.allDay,
      category: args.category,
      color: args.color,
      reminders: args.reminders,
      location: args.location,
      attendees: [],
    });
  },
});

export const listEvents = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("events").withIndex("by_user", (q) => q.eq("userId", userId));
    const events = await query.collect();

    let filtered = events;
    if (args.startDate && args.endDate) {
      filtered = filtered.filter(event => 
        event.startDate >= args.startDate! && event.startDate <= args.endDate!
      );
    }
    if (args.category) {
      filtered = filtered.filter(event => event.category === args.category);
    }

    return filtered.sort((a, b) => a.startDate - b.startDate);
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    category: v.optional(v.string()),
    color: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Event not found");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.allDay !== undefined) updates.allDay = args.allDay;
    if (args.category !== undefined) updates.category = args.category;
    if (args.color !== undefined) updates.color = args.color;
    if (args.location !== undefined) updates.location = args.location;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getUpcomingEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const now = Date.now();
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return events
      .filter(event => event.startDate >= now)
      .sort((a, b) => a.startDate - b.startDate)
      .slice(0, args.limit || 10);
  },
});
