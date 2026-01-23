import {
  Agent,
  type MessageContext,
  type AgentMiddleware,
  filter,
} from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import { ReactionSchema } from "@xmtp/node-sdk";
import { loadEnvFile } from "../../utils/general";

loadEnvFile();

// Helper function to sleep for a specified number of milliseconds
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Extended context type to include thinking reaction helpers
interface ThinkingReactionContext extends MessageContext {
  thinkingReaction?: {
    removeThinkingEmoji: () => Promise<void>;
  };
}

// Middleware for thinking reaction pattern
const thinkingReactionMiddleware: AgentMiddleware = async (ctx, next) => {
  // Only apply to inbound text messages (ignore read receipts, reactions, etc.)
  // and never react to our own messages to avoid infinite loops.
  if (
    !filter.hasContent(ctx.message) ||
    !filter.isText(ctx.message) ||
    filter.fromSelf(ctx.message, ctx.client)
  ) {
    return;
  }

  try {
    console.log("🤔 Reacting with thinking emoji...");

    // Step 1: Add thinking emoji reaction
    await ctx.sendReaction("⏳", ReactionSchema.Shortcode);

    // Step 2: Add helper function to remove the thinking emoji
    const removeThinkingEmoji = async () => {
      await ctx.sendReaction("⏳", ReactionSchema.Shortcode);
    };

    // Attach helper to context
    (ctx as ThinkingReactionContext).thinkingReaction = {
      removeThinkingEmoji,
    };

    // Continue to next middleware/handler
    await next();
  } catch (error) {
    console.error("Error in thinking reaction middleware:", error);
    // Continue anyway
    await next();
  }
};

const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV as "local" | "dev" | "production",
});

// Apply the thinking reaction middleware
agent.use(thinkingReactionMiddleware);

agent.on("text", async (ctx) => {
  console.log("Received message", ctx.message);
  const thinkingCtx = ctx as ThinkingReactionContext;

  try {
    const messageContent = ctx.message.content;
    console.log(`Received message: ${messageContent}`);

    // Step 1: Sleep for 2 seconds (thinking emoji already shown by middleware)
    console.log("💤 Sleeping for 2 seconds...");
    await sleep(2000);

    // Step 2: Send response
    console.log("💭 Sending response...");
    await ctx.conversation.sendText(
      "I've been thinking about your message and here's my response!",
    );

    // Step 3: Remove thinking emoji after sending the response
    if (thinkingCtx.thinkingReaction?.removeThinkingEmoji) {
      console.log("🗑️ Removing thinking emoji...");
      await thinkingCtx.thinkingReaction.removeThinkingEmoji();
    }

    console.log("✅ Response sent successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error processing message:", errorMessage);

    // Still try to remove thinking emoji on error
    if (thinkingCtx.thinkingReaction?.removeThinkingEmoji) {
      try {
        await thinkingCtx.thinkingReaction.removeThinkingEmoji();
      } catch (removeError) {
        console.error("Error removing thinking emoji:", removeError);
      }
    }
  }
});

agent.on("start", () => {
  console.log(`Address: ${agent.address}`);
  console.log(`🔗${getTestUrl(agent.client)}`);
  console.log(`Agent started. Waiting for messages...`);
});

void agent.start();
