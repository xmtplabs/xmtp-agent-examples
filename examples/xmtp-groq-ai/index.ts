import { Agent } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import Groq from "groq-sdk";
import { loadEnvFile } from "../../utils/general";

loadEnvFile();

// Initialize Groq (FREE!)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const AGENT_NAME = process.env.AGENT_NAME || "GroqAI";
const AGENT_PERSONALITY =
  process.env.AGENT_PERSONALITY ||
  "You are a helpful AI assistant communicating via XMTP. Be concise and friendly.";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Store conversation history per user
const conversationHistory = new Map<string, Array<{ role: string; content: string }>>();

function getHistory(senderAddress: string) {
  if (!conversationHistory.has(senderAddress)) {
    conversationHistory.set(senderAddress, [
      { role: "system", content: AGENT_PERSONALITY },
    ]);
  }
  return conversationHistory.get(senderAddress)!;
}

async function generateResponse(senderAddress: string, userMessage: string) {
  const history = getHistory(senderAddress);
  history.push({ role: "user", content: userMessage });

  // Keep only last 20 messages
  if (history.length > 21) {
    const systemPrompt = history[0];
    history.splice(1, history.length - 20);
    history[0] = systemPrompt;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: history as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      "I'm having trouble thinking right now.";
    history.push({ role: "assistant", content: assistantMessage });

    return assistantMessage;
  } catch (error: any) {
    console.error("Groq Error:", error.message);
    return Sorry, I encountered an error: ${error.message};
  }
}

function handleCommand(message: string) {
  const cmd = message.toLowerCase().trim();

  if (cmd === "/help" || cmd === "help") {
    return Hi! I'm ${AGENT_NAME}, an AI assistant on XMTP.\n\nCommands:\n- /help - Show this message\n- /clear - Clear conversation history\n- /about - Learn about me\n\nJust send me any message and I'll respond!;
  }

  if (cmd === "/about" || cmd === "about") {
    return I'm an AI-powered agent running on XMTP.\n\n- End-to-end encrypted\n- Powered by Groq (Llama 3.3 70B) - FREE!\n- Built by @0xGiwax;
  }

  if (cmd === "/clear" || cmd === "clear history") {
    return "CLEAR_HISTORY";
  }

  return null;
}

const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV as "local" | "dev" | "production",
});

agent.on("text", async (ctx) => {
  const userMessage = ctx.message.content;
  const senderAddress = await ctx.getSenderAddress();

  console.log(Message from ${senderAddress.slice(0, 8)}...: ${userMessage});

  const commandResponse = handleCommand(userMessage);

  if (commandResponse === "CLEAR_HISTORY") {
    conversationHistory.delete(senderAddress);
    await ctx.sendText("Conversation history cleared! Fresh start.");
    return;
  }

  if (commandResponse) {
    await ctx.sendText(commandResponse);
    return;
  }

  console.log("Thinking...");
  const response = await generateResponse(senderAddress, userMessage);
  await ctx.sendText(response);
  console.log(Sent response to ${senderAddress.slice(0, 8)}...);
});

agent.on("start", () => {
  console.log(${AGENT_NAME} is running!);
  console.log(Address: ${agent.address});
  console.log(Test: ${getTestUrl(agent.client)});
  console.log(Model: ${MODEL});
});

await agent.start();
