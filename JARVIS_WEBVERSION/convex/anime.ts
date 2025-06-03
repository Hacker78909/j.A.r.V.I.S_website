import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("animeList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const encodedTitle = encodeURIComponent(args.title.toLowerCase().replace(/\s+/g, "-"));
    
    const streamingLinks = args.type === "anime" ? [
      { site: "HiAnime", url: `https://hianime.to/anime/${encodedTitle}` },
      { site: "AniWatch", url: `https://aniwatch.to/search?keyword=${encodeURIComponent(args.title)}` },
      { site: "Zoro", url: `https://zorox.to/search?keyword=${encodeURIComponent(args.title)}` },
      { site: "GogoAnime", url: `https://gogoanime3.net/search/${encodedTitle}` },
      { site: "Crunchyroll", url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(args.title)}` },
      { site: "MAL", url: `https://myanimelist.net/anime.php?q=${encodeURIComponent(args.title)}` }
    ] : [
      { site: "WatchCartoon", url: `https://www.wcofun.net/search?keyword=${encodeURIComponent(args.title)}` },
      { site: "KissCartoon", url: `https://kisscartoon.help/search.html?keyword=${encodeURIComponent(args.title)}` },
      { site: "SuperCartoons", url: `https://www.supercartoons.net/search?q=${encodeURIComponent(args.title)}` },
      { site: "Disney+", url: `https://www.disneyplus.com/search?q=${encodeURIComponent(args.title)}` },
      { site: "Netflix Kids", url: `https://www.netflix.com/browse/genre/27346?q=${encodeURIComponent(args.title)}` },
      { site: "Prime Video", url: `https://www.amazon.com/s?k=${encodeURIComponent(args.title)}&i=instant-video&rh=n%3A2958933011` }
    ];

    await ctx.db.insert("animeList", {
      ...args,
      streamingLinks,
      userId,
    });
  },
});

export const rate = mutation({
  args: {
    id: v.id("animeList"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const anime = await ctx.db.get(args.id);
    if (!anime || anime.userId !== userId) throw new Error("Not found");
    
    await ctx.db.patch(args.id, { rating: args.rating });
  },
});
