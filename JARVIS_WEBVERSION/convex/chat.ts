import { v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { Doc } from "./_generated/dataModel";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), an advanced AI assistant created by Tony Stark.
Your personality traits:
- Highly intelligent and efficient
- Polite and professional, but with a subtle dry wit
- Deeply knowledgeable about technology and science
- Always ready to help with any task
- Can handle multiple topics and switch contexts smoothly
- Provides concise but informative responses
- Uses technical terminology when appropriate
- Has a slight British accent (in writing, this means being a bit more formal)

You have access to:
- Code generation and analysis (CodeBuddy tab)
- Task management (Home tab)
- Note-taking (Home tab)
- Anime tracking (Anime tab)
- Image generation (Image Generator tab)
- Python game creation (Game Maker tab)

When responding:
1. Keep responses concise but informative
2. If the user asks about a specific feature, guide them to the appropriate tab
3. If asked to create something, suggest using the relevant creator tool
4. Maintain your JARVIS personality throughout
5. Format your responses using Markdown for better readability:
   - Use **bold** for emphasis
   - Use \`code\` for technical terms
   - Use bullet points for lists
   - Use > for important notes
   - Use ### for section headers if needed

For example, if someone asks about creating a game, respond like:
"Certainly, sir. I recommend using the **Game Maker** tab for that. Would you like me to:
- Generate a new Python game from your description
- Help you understand the game code
- Assist with game mechanics

> Note: All games are created with Pygame.js for browser compatibility."

Remember: You're not just a chatbot, you're JARVIS - Mr. Stark's trusted AI companion.`;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const send = action({
  args: { content: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const user = await ctx.runQuery(api.auth.loggedInUser);
    if (!user) throw new Error("Not authenticated");

    // Get recent chat history for context
    const recentMessages: Doc<"chatMessages">[] = await ctx.runQuery(api.chat.list);
    const lastMessages = recentMessages.slice(-5); // Get last 5 messages for context

    // Build the conversation history
    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...lastMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: args.content }
    ];

    // Save user message
    await ctx.runMutation(internal.chat.saveMessage, {
      content: args.content,
      role: "user",
      userId: user._id,
    });

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      temperature: 0.7, // Add some creativity
      max_tokens: 500, // Keep responses concise
    });

    const aiMessage = response.choices[0].message.content;
    if (!aiMessage) throw new Error("No response from AI");

    // Save AI response
    await ctx.runMutation(internal.chat.saveMessage, {
      content: aiMessage,
      role: "assistant",
      userId: user._id,
    });

    return aiMessage;
  },
});

export const saveMessage = internalMutation({
  args: {
    content: v.string(),
    role: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", args);
  },
});
