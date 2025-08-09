import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    date: v.number(),
    paymentMethod: v.string(),
    tags: v.array(v.string()),
    isRecurring: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("expenses", {
      userId,
      amount: args.amount,
      category: args.category,
      subcategory: args.subcategory,
      description: args.description,
      date: args.date,
      paymentMethod: args.paymentMethod,
      tags: args.tags,
      isRecurring: args.isRecurring,
    });
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("expenses").withIndex("by_user", (q) => q.eq("userId", userId));
    const expenses = await query.order("desc").collect();

    let filtered = expenses;
    if (args.category) {
      filtered = filtered.filter(expense => expense.category === args.category);
    }
    if (args.startDate && args.endDate) {
      filtered = filtered.filter(expense => 
        expense.date >= args.startDate! && expense.date <= args.endDate!
      );
    }

    return filtered;
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Expense not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {
    period: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("year"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalExpenses: 0, totalAmount: 0, averageExpense: 0, categoryBreakdown: {} };
    }

    const now = Date.now();
    let startDate = 0;
    
    switch (args.period) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = now - (365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = 0;
    }

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("date"), startDate))
      .collect();

    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageExpense = totalExpenses > 0 ? Math.round((totalAmount / totalExpenses) * 100) / 100 : 0;

    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach(expense => {
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
    });

    return { totalExpenses, totalAmount, averageExpense, categoryBreakdown };
  },
});
