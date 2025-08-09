import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateGame = action({
  args: {
    prompt: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    gameType: v.string(),
  },
  handler: async (ctx, args): Promise<{ gameId: any; title: string; code: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const systemPrompt = `You are a Python game development expert. Generate complete, working Python games based on user prompts. 

Requirements:
- Use only standard Python libraries (pygame, tkinter, random, etc.)
- Include complete, runnable code
- Add comments explaining key parts
- Make the game fun and engaging
- Ensure the code is appropriate for ${args.difficulty} level

Game Type: ${args.gameType}
Difficulty: ${args.difficulty}

Return only the Python code, no explanations.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const code = response.choices[0].message.content;
      if (!code) {
        throw new Error("No code generated");
      }

      // Extract title from prompt or generate one
      const titleResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Generate a short, catchy title for this Python game. Return only the title, no quotes." },
          { role: "user", content: args.prompt }
        ],
        max_tokens: 50,
        temperature: 0.5,
      });

      const title = titleResponse.choices[0].message.content || "Python Game";

      // Save to database
      const gameId: any = await ctx.runMutation(api.games.saveGame, {
        title: title.trim(),
        description: args.prompt,
        prompt: args.prompt,
        code,
        difficulty: args.difficulty,
        tags: [args.gameType, args.difficulty],
      });

      return { gameId, title: title.trim(), code };
    } catch (error) {
      console.error("Error generating game:", error);
      throw new Error("Failed to generate game");
    }
  },
});

export const saveGame = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    prompt: v.string(),
    code: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    return await ctx.db.insert("pythonGames", {
      userId,
      title: args.title,
      description: args.description,
      prompt: args.prompt,
      code: args.code,
      tags: args.tags,
      difficulty: args.difficulty,
      plays: 0,
      likes: 0,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("pythonGames").withIndex("by_user", (q) => q.eq("userId", userId));
    const games = await query.order("desc").collect();

    if (args.difficulty) {
      return games.filter(game => game.difficulty === args.difficulty);
    }

    return games;
  },
});

export const getGame = query({
  args: { id: v.id("pythonGames") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const game = await ctx.db.get(args.id);
    if (!game || game.userId !== userId) {
      return null;
    }

    return game;
  },
});

export const deleteGame = mutation({
  args: { id: v.id("pythonGames") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db.get(args.id);
    if (!game || game.userId !== userId) {
      throw new Error("Game not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Import api for internal use
import { api } from "./_generated/api";
