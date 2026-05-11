import type { Message } from "discord.js";
import { api } from "../../convex/_generated/api.js";
import { getConvexClient } from "../services/convex.js";
import { DISCORD_MESSAGE_LIMIT, splitMessage } from "../services/message.js";
 
const COUNTER_TRIGGERS: Record<string, (count: number) => string> = {
  ronaldo: (n) => `⚽ Ronaldo schulepou **${n}** vez${n !== 1 ? "es" : ""}os gordões!`,
};
 
export async function handleTrigger(message: Message): Promise<void> {
  const convex = getConvexClient();
 
  try {
    const resolved = await convex.query(api.commands.resolveTriggerResponse, {
      channelId: message.channelId,
      content: message.content,
    });
 
    if (!resolved) return;
 
    const channel = message.channel;
    if (!("send" in channel) || typeof channel.send !== "function") return;
 
    if (resolved.trigger in COUNTER_TRIGGERS) {
      const count = await convex.mutation(api.counters.increment, {
        trigger: resolved.trigger,
        guildId: message.guildId ?? "dm",
        channelId: message.channelId,
      });
      await channel.send(COUNTER_TRIGGERS[resolved.trigger](count));
      return;
    }
 
    const chunks = splitMessage(resolved.response, DISCORD_MESSAGE_LIMIT);
    for (const chunk of chunks) {
      await channel.send(chunk);
    }
  } catch (error) {
    console.error(
      `[trigger] Error handling trigger in channel ${message.channelId}:`,
      error,
    );
  }
}
