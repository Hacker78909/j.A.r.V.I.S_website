import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const exportToExcel = action({
  args: {},
  handler: async (ctx): Promise<Blob> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch all user data
    const todos = await ctx.runQuery(api.todos.list) as Doc<"todos">[];
    const notes = await ctx.runQuery(api.notes.list) as Doc<"notes">[];
    const animeList = await ctx.runQuery(api.anime.list) as Doc<"animeList">[];
    const chatMessages = await ctx.runQuery(api.chat.list) as Doc<"chatMessages">[];
    const pythonGames = await ctx.runQuery(api.creator.listPythonGames) as Doc<"pythonGames">[];
    const generatedImages = await ctx.runQuery(api.creator.listImages) as Doc<"generatedImages">[];

    // Create CSV content
    const csvContent: string = [
      // Todos
      "TODOS",
      "Text,Completed,Created At",
      ...todos.map(todo => `"${todo.text}",${todo.completed},${new Date(todo._creationTime).toISOString()}`),
      "",

      // Notes
      "NOTES",
      "Content,Color,Position X,Position Y,Created At",
      ...notes.map(note => `"${note.content}","${note.color}",${note.position.x},${note.position.y},${new Date(note._creationTime).toISOString()}`),
      "",

      // Anime List
      "ANIME LIST",
      "Title,Type,Status,Rating,Created At",
      ...animeList.map(anime => `"${anime.title}","${anime.type || ''}","${anime.status}",${anime.rating || ''},${new Date(anime._creationTime).toISOString()}`),
      "",

      // Chat Messages
      "CHAT MESSAGES",
      "Role,Content,Created At",
      ...chatMessages.map(msg => `"${msg.role}","${msg.content.replace(/"/g, '""')}",${new Date(msg._creationTime).toISOString()}`),
      "",

      // Python Games
      "PYTHON GAMES",
      "Title,Description,Created At",
      ...pythonGames.map(game => `"${game.title}","${game.description}",${new Date(game.createdAt).toISOString()}`),
      "",

      // Generated Images
      "GENERATED IMAGES",
      "Prompt,Enhanced Prompt,Created At",
      ...generatedImages.map(img => `"${img.prompt}","${img.enhancedPrompt || ''}",${new Date(img.createdAt).toISOString()}`),
    ].join("\n");

    // Convert to Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    return blob;
  },
});
