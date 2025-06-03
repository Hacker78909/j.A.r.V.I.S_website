import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Image Generation
export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // First, let's enhance the prompt using GPT to make it more detailed
    const enhancementResponse = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing detailed image generation prompts. Take the user's prompt and enhance it with more details to create a better image. Focus on style, lighting, composition, and artistic elements. Keep the enhancement concise but descriptive."
        },
        {
          role: "user",
          content: `Enhance this image prompt: ${args.prompt}`
        }
      ],
    });

    const enhancedPrompt = enhancementResponse.choices[0].message.content;
    if (!enhancedPrompt) throw new Error("Failed to enhance prompt");

    // For now, we'll use a placeholder image service
    const imageUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(args.prompt)}`;

    await ctx.runMutation(api.creator.saveImage, {
      prompt: args.prompt,
      enhancedPrompt,
      imageUrl,
      userId,
    });

    return imageUrl;
  },
});

export const saveImage = mutation({
  args: {
    prompt: v.string(),
    enhancedPrompt: v.string(),
    imageUrl: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId || authUserId !== args.userId) throw new Error("Not authenticated");
    
    await ctx.db.insert("generatedImages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deleteImage = mutation({
  args: { id: v.id("generatedImages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const image = await ctx.db.get(args.id);
    if (!image || image.userId !== userId) throw new Error("Not found");
    
    await ctx.db.delete(args.id);
  },
});

export const listImages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Python Game Generation
export const generatePythonGame = action({
  args: { 
    title: v.string(),
    description: v.string() 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = `Create a simple Python game that can run in a browser using Pygame.js based on this description: ${args.description}
    Make it well-commented and beginner-friendly. Use basic shapes and colors.
    Include proper initialization, game loop, event handling, and clean exit.
    The game should work with both keyboard and mouse input.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
    });

    const code = response.choices[0].message.content;
    if (!code) throw new Error("Failed to generate code");

    await ctx.runMutation(api.creator.savePythonGame, {
      title: args.title,
      description: args.description,
      code,
      userId,
    });

    return code;
  },
});

export const savePythonGame = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    code: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId || authUserId !== args.userId) throw new Error("Not authenticated");
    
    await ctx.db.insert("pythonGames", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deletePythonGame = mutation({
  args: { id: v.id("pythonGames") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const game = await ctx.db.get(args.id);
    if (!game || game.userId !== userId) throw new Error("Not found");
    
    await ctx.db.delete(args.id);
  },
});

export const listPythonGames = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("pythonGames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Code Assistant
export const getCodeHelp = action({
  args: { 
    code: v.string(),
    request: v.string() 
  },
  handler: async (ctx, args) => {
    const prompt = `${args.request}\n\nCode:\n${args.code}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  },
});
