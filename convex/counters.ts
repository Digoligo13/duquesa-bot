import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Incrementa o novo valor
export const increment = mutation({
  args: {
    name: v.string(),       // ex: "ronaldo"
    guildId: v.string(),
    channelId: v.string(),
  },
  handler: async (ctx, { name, guildId, channelId }) => {
    const key = `${guildId}:${channelId}:${name}`;
    const existing = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
      return existing.count + 1;
    } else {
      await ctx.db.insert("counters", { key, name, guildId, channelId, count: 1 });
      return 1;
    }
  },
});
