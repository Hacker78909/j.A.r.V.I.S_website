import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createHabit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    target: v.number(),
    unit: v.string(),
    category: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("habits", {
      userId,
      name: args.name,
      description: args.description,
      frequency: args.frequency,
      target: args.target,
      unit: args.unit,
      category: args.category,
      color: args.color,
      streak: 0,
      bestStreak: 0,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("habits").withIndex("by_user", (q) => q.eq("userId", userId));
    const habits = await query.order("desc").collect();

    if (args.isActive !== undefined) {
      return habits.filter(habit => habit.isActive === args.isActive);
    }

    return habits;
  },
});

export const logCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    value: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new Error("Habit not found");
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already logged today
    const existing = await ctx.db
      .query("habitCompletions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .filter((q) => q.eq(q.field("habitId"), args.habitId))
      .first();

    if (existing) {
      // Update existing completion
      await ctx.db.patch(existing._id, {
        value: args.value,
        notes: args.notes,
        completedAt: Date.now(),
      });
    } else {
      // Create new completion
      await ctx.db.insert("habitCompletions", {
        userId,
        habitId: args.habitId,
        date: today,
        value: args.value,
        notes: args.notes,
        completedAt: Date.now(),
      });

      // Update streak
      const newStreak = habit.streak + 1;
      await ctx.db.patch(args.habitId, {
        streak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak),
      });
    }
  },
});

export const deleteHabit = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== userId) {
      throw new Error("Habit not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalHabits: 0, activeHabits: 0, bestStreak: 0 };
    }

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.isActive).length;
    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);

    return { totalHabits, activeHabits, bestStreak };
  },
});
