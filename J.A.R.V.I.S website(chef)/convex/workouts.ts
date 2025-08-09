import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createWorkout = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    exercises: v.array(v.object({
      name: v.string(),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      distance: v.optional(v.number()),
      notes: v.optional(v.string()),
    })),
    duration: v.number(),
    calories: v.optional(v.number()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    equipment: v.array(v.string()),
    bodyParts: v.array(v.string()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("workouts", {
      userId,
      name: args.name,
      type: args.type,
      exercises: args.exercises,
      duration: args.duration,
      calories: args.calories,
      difficulty: args.difficulty,
      equipment: args.equipment,
      bodyParts: args.bodyParts,
      completedAt: Date.now(),
      rating: args.rating,
      notes: args.notes,
    });
  },
});

export const list = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("workouts").withIndex("by_user", (q) => q.eq("userId", userId));
    const workouts = await query.order("desc").collect();

    if (args.type) {
      return workouts.filter(workout => workout.type === args.type);
    }

    return workouts;
  },
});

export const deleteWorkout = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalWorkouts: 0, totalCalories: 0, averageRating: 0 };
    }

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const ratingsSum = workouts.reduce((sum, w) => sum + (w.rating || 0), 0);
    const ratingsCount = workouts.filter(w => w.rating).length;
    const averageRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0;

    return { totalWorkouts, totalCalories, averageRating };
  },
});
