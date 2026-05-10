import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
 
export const increment = mutation({
  args: {
    trigger: v.string(),
    guildId: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, { trigger, guildId, channelId }) => {
    const key = `${guildId}:${channelId}:${trigger}`;
 
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
 
    if (existing) {
      const newCount = existing.count + 1;
      await ctx.db.patch(existing._id, { count: newCount });
      return newCount;
    }
 
    await ctx.db.insert("counters", {
      key,
      trigger,
      guildId,
      channelId,
      count: 1,
    });
    return 1;
  },
});
 
/**
 * Para só mostrar o valor:
 */
export const get = query({
  args: {
    trigger: v.string(),
    guildId: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, { trigger, guildId, channelId }) => {
    const key = `${guildId}:${channelId}:${trigger}`;
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return existing?.count ?? 0;
  },
});
