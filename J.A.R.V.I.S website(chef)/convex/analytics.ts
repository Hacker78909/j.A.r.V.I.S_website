import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const trackEvent = mutation({
  args: {
    feature: v.string(),
    action: v.string(),
    sessionId: v.string(),
    metadata: v.optional(v.object({
      duration: v.optional(v.number()),
      value: v.optional(v.string()),
      count: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("analytics", {
      userId,
      feature: args.feature,
      action: args.action,
      metadata: args.metadata,
      timestamp: Date.now(),
      sessionId: args.sessionId,
    });
  },
});

export const getUsageStats = query({
  args: {
    timeRange: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalEvents: 0,
        featureUsage: {},
        dailyActivity: [],
        topFeatures: [],
      };
    }

    const now = Date.now();
    let startTime: number;
    
    switch (args.timeRange) {
      case "day":
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    const events = await ctx.db
      .query("analytics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const filteredEvents = events.filter(event => event.timestamp >= startTime);

    // Calculate feature usage
    const featureUsage: Record<string, number> = {};
    filteredEvents.forEach(event => {
      featureUsage[event.feature] = (featureUsage[event.feature] || 0) + 1;
    });

    // Calculate daily activity
    const dailyActivity: Array<{ date: string; count: number }> = [];
    const days = args.timeRange === "day" ? 1 : args.timeRange === "week" ? 7 : 30;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const dayEvents = filteredEvents.filter(event => 
        event.timestamp >= dayStart && event.timestamp < dayEnd
      );
      
      dailyActivity.unshift({
        date: date.toISOString().split('T')[0],
        count: dayEvents.length,
      });
    }

    // Top features
    const topFeatures = Object.entries(featureUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }));

    return {
      totalEvents: filteredEvents.length,
      featureUsage,
      dailyActivity,
      topFeatures,
    };
  },
});

export const getSystemStats = query({
  handler: async (ctx) => {
    // This would typically be restricted to admin users
    const totalUsers = await ctx.db.query("users").collect();
    const totalTodos = await ctx.db.query("todos").collect();
    const totalNotes = await ctx.db.query("notes").collect();
    const totalAnime = await ctx.db.query("animeList").collect();
    const totalGames = await ctx.db.query("pythonGames").collect();
    const totalImages = await ctx.db.query("generatedImages").collect();
    const totalSnippets = await ctx.db.query("codeSnippets").collect();
    const totalEvents = await ctx.db.query("events").collect();

    return {
      users: totalUsers.length,
      todos: totalTodos.length,
      notes: totalNotes.length,
      anime: totalAnime.length,
      games: totalGames.length,
      images: totalImages.length,
      snippets: totalSnippets.length,
      events: totalEvents.length,
    };
  },
});
