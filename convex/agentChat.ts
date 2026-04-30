import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Agent chat history — stores conversations between WhatsApp users and the AI agents.
 * Used by the CamarAI Agent to maintain conversation context.
 */

// Get recent messages for a session (last N messages within TTL)
export const getMessages = query({
  args: {
    session_id: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20; // Default: last 10 exchanges (20 messages)
    const ttlMs = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - ttlMs;

    const messages = await ctx.db
      .query("agent_chat_messages")
      .withIndex("by_session", (q) =>
        q.eq("session_id", args.session_id).gt("created_at", cutoff)
      )
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

// Add a message pair (human + ai) to the chat history
export const addMessages = mutation({
  args: {
    establishment_id: v.id("establishments"),
    session_id: v.string(),
    human_message: v.string(),
    ai_message: v.string(),
    agent_type: v.union(v.literal("customer"), v.literal("manager")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("agent_chat_messages", {
      establishment_id: args.establishment_id,
      session_id: args.session_id,
      role: "human",
      content: args.human_message,
      agent_type: args.agent_type,
      created_at: now,
    });

    await ctx.db.insert("agent_chat_messages", {
      establishment_id: args.establishment_id,
      session_id: args.session_id,
      role: "ai",
      content: args.ai_message,
      agent_type: args.agent_type,
      created_at: now + 1, // +1ms to ensure ordering
    });
  },
});

// Clear all messages for a session
export const clearSession = mutation({
  args: {
    session_id: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("agent_chat_messages")
      .withIndex("by_session", (q) => q.eq("session_id", args.session_id))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    return messages.length;
  },
});
