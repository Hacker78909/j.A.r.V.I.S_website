import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// JARVIS personality system prompt
const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), an advanced AI assistant with a sophisticated British accent and personality. You are:

- Polite, intelligent, and slightly witty
- Helpful and efficient in all tasks
- Knowledgeable across many domains
- Capable of understanding context and maintaining conversation flow
- Professional yet personable
- Always ready to assist with productivity, creativity, and problem-solving

You should respond in a way that feels natural and conversational, while being informative and helpful. Use British spellings and expressions when appropriate. Be concise but thorough in your responses.`;

export const sendMessage = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Store user message
    await ctx.db.insert("chatMessages", {
      userId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
      sessionId: args.sessionId,
    });

    return { success: true };
  },
});

export const generateResponse = action({
  args: {
    content: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ content: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    try {
      // Get recent chat history for context
      const recentMessages: any[] = await ctx.runQuery(api.jarvis.getChatHistory, {
        sessionId: args.sessionId,
        limit: 10,
      });

      // Prepare messages for OpenAI
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system" as const, content: JARVIS_SYSTEM_PROMPT },
        ...recentMessages.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ];

      const startTime = Date.now();
      const response: any = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const responseTime = Date.now() - startTime;
      const assistantMessage: string | null = response.choices[0].message.content;

      if (!assistantMessage) {
        throw new Error("No response from AI");
      }

      // Store assistant response
      await ctx.runMutation(api.jarvis.storeResponse, {
        content: assistantMessage,
        sessionId: args.sessionId,
        metadata: {
          tokens: response.usage?.total_tokens,
          model: "gpt-4o-mini",
          responseTime,
        },
      });

      return { content: assistantMessage };
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response");
    }
  },
});

export const storeResponse = mutation({
  args: {
    content: v.string(),
    sessionId: v.string(),
    metadata: v.optional(v.object({
      tokens: v.optional(v.number()),
      model: v.optional(v.string()),
      responseTime: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("chatMessages", {
      userId,
      content: args.content,
      role: "assistant",
      timestamp: Date.now(),
      sessionId: args.sessionId,
      metadata: args.metadata,
    });
  },
});

export const getChatHistory = query({
  args: {
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_session", (q) => 
        q.eq("userId", userId).eq("sessionId", args.sessionId)
      )
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

export const clearChatHistory = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user_session", (q) => 
        q.eq("userId", userId).eq("sessionId", args.sessionId)
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

// Import api for internal use
import { api } from "./_generated/api";
