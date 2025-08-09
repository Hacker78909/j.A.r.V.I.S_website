import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createRecipe = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.object({
      name: v.string(),
      amount: v.string(),
      unit: v.string(),
    })),
    instructions: v.array(v.string()),
    prepTime: v.number(),
    cookTime: v.number(),
    servings: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    cuisine: v.string(),
    dietaryTags: v.array(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("recipes", {
      userId,
      title: args.title,
      description: args.description,
      ingredients: args.ingredients,
      instructions: args.instructions,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      servings: args.servings,
      difficulty: args.difficulty,
      cuisine: args.cuisine,
      dietaryTags: args.dietaryTags,
      rating: args.rating,
      isPublic: false,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    cuisine: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("recipes").withIndex("by_user", (q) => q.eq("userId", userId));
    const recipes = await query.order("desc").collect();

    let filtered = recipes;
    if (args.cuisine) {
      filtered = filtered.filter(recipe => recipe.cuisine === args.cuisine);
    }
    if (args.difficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === args.difficulty);
    }

    return filtered;
  },
});

export const deleteRecipe = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recipe = await ctx.db.get(args.id);
    if (!recipe || recipe.userId !== userId) {
      throw new Error("Recipe not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalRecipes: 0, averageRating: 0, totalCookTime: 0 };
    }

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalRecipes = recipes.length;
    const totalCookTime = recipes.reduce((sum, r) => sum + r.cookTime, 0);
    const ratingsSum = recipes.reduce((sum, r) => sum + (r.rating || 0), 0);
    const ratingsCount = recipes.filter(r => r.rating).length;
    const averageRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0;

    return { totalRecipes, averageRating, totalCookTime };
  },
});
