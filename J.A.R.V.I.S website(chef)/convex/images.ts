import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateImage = action({
  args: {
    prompt: v.string(),
    style: v.string(),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
  },
  handler: async (ctx, args): Promise<{ imageId: any; imageUrl: string; enhancedPrompt: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    try {
      // For now, we'll simulate image generation since DALL-E isn't available in the bundled OpenAI
      // In a real implementation, you would use DALL-E or another image generation API
      
      // Generate an enhanced prompt
      const enhancedPromptResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at writing detailed, artistic prompts for image generation. Enhance the user's prompt with artistic details, lighting, composition, and style elements. Keep it under 200 words." 
          },
          { role: "user", content: `Style: ${args.style}\nPrompt: ${args.prompt}` }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      const enhancedPrompt = enhancedPromptResponse.choices[0].message.content || args.prompt;

      // For demo purposes, we'll use a placeholder image service
      const imageUrl = `https://picsum.photos/${args.dimensions.width}/${args.dimensions.height}?random=${Date.now()}`;

      // Save to database
      const imageId: any = await ctx.runMutation(api.images.saveImage, {
        prompt: args.prompt,
        enhancedPrompt,
        imageUrl,
        style: args.style,
        dimensions: args.dimensions,
        tags: [args.style],
      });

      return { imageId, imageUrl, enhancedPrompt };
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error("Failed to generate image");
    }
  },
});

export const saveImage = mutation({
  args: {
    prompt: v.string(),
    enhancedPrompt: v.string(),
    imageUrl: v.string(),
    style: v.string(),
    dimensions: v.object({
      width: v.number(),
      height: v.number(),
    }),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // For demo, we'll use a placeholder storage ID
    const storageId = "placeholder_storage_id" as any;

    return await ctx.db.insert("generatedImages", {
      userId,
      prompt: args.prompt,
      enhancedPrompt: args.enhancedPrompt,
      imageUrl: args.imageUrl,
      storageId,
      style: args.style,
      dimensions: args.dimensions,
      tags: args.tags,
      isPublic: false,
      likes: 0,
      downloads: 0,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("generatedImages").withIndex("by_user", (q) => q.eq("userId", userId));
    const images = await query.order("desc").collect();

    if (args.style) {
      return images.filter(image => image.style === args.style);
    }

    return images;
  },
});

export const deleteImage = mutation({
  args: { id: v.id("generatedImages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const image = await ctx.db.get(args.id);
    if (!image || image.userId !== userId) {
      throw new Error("Image not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Import api for internal use
import { api } from "./_generated/api";
