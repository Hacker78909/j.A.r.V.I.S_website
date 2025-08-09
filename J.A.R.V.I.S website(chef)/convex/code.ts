import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateCode = action({
  args: {
    prompt: v.string(),
    language: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const systemPrompt = `You are an expert ${args.language} developer. Generate clean, well-commented code based on the user's request.

Requirements:
- Write production-quality code
- Include helpful comments
- Follow best practices for ${args.language}
- Make it appropriate for ${args.difficulty} level
- Include error handling where appropriate

Language: ${args.language}
Difficulty: ${args.difficulty}

Provide only the code with comments, no additional explanations.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const code = response.choices[0].message.content;
      if (!code) {
        throw new Error("No code generated");
      }

      // Generate a title
      const titleResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Generate a short, descriptive title for this code snippet. Return only the title." },
          { role: "user", content: args.prompt }
        ],
        max_tokens: 50,
        temperature: 0.5,
      });

      const title = titleResponse.choices[0].message.content || "Code Snippet";

      return { title: title.trim(), code };
    } catch (error) {
      console.error("Error generating code:", error);
      throw new Error("Failed to generate code");
    }
  },
});

export const saveSnippet = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    language: v.string(),
    code: v.string(),
    tags: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    return await ctx.db.insert("codeSnippets", {
      userId,
      title: args.title,
      description: args.description,
      language: args.language,
      code: args.code,
      tags: args.tags,
      isPublic: false,
      likes: 0,
      forks: 0,
      category: args.category,
      difficulty: args.difficulty,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {
    language: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("codeSnippets").withIndex("by_user", (q) => q.eq("userId", userId));
    const snippets = await query.order("desc").collect();

    let filtered = snippets;
    if (args.language) {
      filtered = filtered.filter(snippet => snippet.language === args.language);
    }
    if (args.category) {
      filtered = filtered.filter(snippet => snippet.category === args.category);
    }

    return filtered;
  },
});

export const getSnippet = query({
  args: { id: v.id("codeSnippets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) {
      return null;
    }

    return snippet;
  },
});

export const deleteSnippet = mutation({
  args: { id: v.id("codeSnippets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) {
      throw new Error("Snippet not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateSnippet = mutation({
  args: {
    id: v.id("codeSnippets"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    code: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const snippet = await ctx.db.get(args.id);
    if (!snippet || snippet.userId !== userId) {
      throw new Error("Snippet not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.code !== undefined) updates.code = args.code;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.category !== undefined) updates.category = args.category;

    await ctx.db.patch(args.id, updates);
  },
});
