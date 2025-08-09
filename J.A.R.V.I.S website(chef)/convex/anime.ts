import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("anime"), v.literal("tv"), v.literal("movie")),
    status: v.union(
      v.literal("watching"),
      v.literal("completed"),
      v.literal("plan_to_watch"),
      v.literal("dropped"),
      v.literal("on_hold")
    ),
    episodes: v.object({
      current: v.number(),
      total: v.optional(v.number()),
    }),
    genre: v.array(v.string()),
    season: v.optional(v.string()),
    year: v.optional(v.number()),
    poster: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("animeList", {
      userId,
      title: args.title,
      type: args.type,
      status: args.status,
      episodes: args.episodes,
      genre: args.genre,
      season: args.season,
      year: args.year,
      poster: args.poster,
      streamingLinks: [],
      startDate: args.status === "watching" ? Date.now() : undefined,
    });
  },
});

export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("watching"),
      v.literal("completed"),
      v.literal("plan_to_watch"),
      v.literal("dropped"),
      v.literal("on_hold")
    )),
    type: v.optional(v.union(v.literal("anime"), v.literal("tv"), v.literal("movie"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("animeList").withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.status) {
      query = ctx.db.query("animeList").withIndex("by_user_status", (q) => 
        q.eq("userId", userId).eq("status", args.status!)
      );
    }

    const animeList = await query.order("desc").collect();

    if (args.type) {
      return animeList.filter(anime => anime.type === args.type);
    }

    return animeList;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("animeList"),
    status: v.union(
      v.literal("watching"),
      v.literal("completed"),
      v.literal("plan_to_watch"),
      v.literal("dropped"),
      v.literal("on_hold")
    ),
    currentEpisode: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const anime = await ctx.db.get(args.id);
    if (!anime || anime.userId !== userId) {
      throw new Error("Anime not found");
    }

    const updates: any = { status: args.status };

    if (args.currentEpisode !== undefined) {
      updates.episodes = {
        ...anime.episodes,
        current: args.currentEpisode,
      };
    }

    if (args.status === "watching" && anime.status !== "watching") {
      updates.startDate = Date.now();
    }

    if (args.status === "completed" && anime.status !== "completed") {
      updates.endDate = Date.now();
      if (anime.episodes.total) {
        updates.episodes = {
          ...anime.episodes,
          current: anime.episodes.total,
        };
      }
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const rate = mutation({
  args: {
    id: v.id("animeList"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const anime = await ctx.db.get(args.id);
    if (!anime || anime.userId !== userId) {
      throw new Error("Anime not found");
    }

    if (args.rating < 1 || args.rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

    await ctx.db.patch(args.id, {
      rating: args.rating,
      review: args.review,
    });
  },
});

export const addStreamingLink = mutation({
  args: {
    id: v.id("animeList"),
    platform: v.string(),
    url: v.string(),
    quality: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const anime = await ctx.db.get(args.id);
    if (!anime || anime.userId !== userId) {
      throw new Error("Anime not found");
    }

    const newLink = {
      platform: args.platform,
      url: args.url,
      quality: args.quality,
    };

    await ctx.db.patch(args.id, {
      streamingLinks: [...anime.streamingLinks, newLink],
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("animeList"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const anime = await ctx.db.get(args.id);
    if (!anime || anime.userId !== userId) {
      throw new Error("Anime not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        total: 0,
        watching: 0,
        completed: 0,
        planToWatch: 0,
        dropped: 0,
        onHold: 0,
        averageRating: 0,
      };
    }

    const animeList = await ctx.db
      .query("animeList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      total: animeList.length,
      watching: animeList.filter(a => a.status === "watching").length,
      completed: animeList.filter(a => a.status === "completed").length,
      planToWatch: animeList.filter(a => a.status === "plan_to_watch").length,
      dropped: animeList.filter(a => a.status === "dropped").length,
      onHold: animeList.filter(a => a.status === "on_hold").length,
      averageRating: 0,
    };

    const ratedAnime = animeList.filter(a => a.rating);
    if (ratedAnime.length > 0) {
      const totalRating = ratedAnime.reduce((sum, a) => sum + (a.rating || 0), 0);
      stats.averageRating = Math.round((totalRating / ratedAnime.length) * 10) / 10;
    }

    return stats;
  },
});
