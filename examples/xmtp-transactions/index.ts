import { Agent, validHex, type AgentMiddleware } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import { CommandRouter } from "@xmtp/agent-sdk/middleware";
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference";
import { ContentTypeWalletSendCalls } from "@xmtp/content-type-wallet-send-calls";
import { loadEnvFile } from "../../utils/general";
import { USDCHandler } from "../../utils/usdc";

loadEnvFile();

const NETWORK_ID = process.env.NETWORK_ID || "base-sepolia";

const usdcHandler = new USDCHandler(NETWORK_ID);

// Transaction reference middleware
const transactionReferenceMiddleware: AgentMiddleware = async (ctx, next) => {
  // Check if this is a transaction reference message
  if (ctx.usesCodec(TransactionReferenceCodec)) {
    const transactionRef = ctx.message.content;
    console.log("Received transaction reference:", transactionRef);

    await ctx.sendText(
      `✅ Transaction confirmed!\n` +
        `🔗 Network: ${transactionRef.networkId}\n` +
        `📄 Hash: ${transactionRef.reference}\n` +
        `${transactionRef.metadata ? `📝 Transaction metadata received` : ""}`,
    );

    // Don't continue to other handlers since we handled this message
    return;
  }

  // Continue to next middleware/handler
  await next();
};

const agent = await Agent.createFromEnv();

// Apply the transaction reference middleware
const router = new CommandRouter();

router.command("/balance", async (ctx) => {
  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  const agentBalance = await usdcHandler.getUSDCBalance(validHex(agentAddress));
  const senderBalance = await usdcHandler.getUSDCBalance(
    validHex(senderAddress),
  );

  await ctx.sendText(
    `My USDC balance is: ${agentBalance} USDC\n` +
      `Your USDC balance is: ${senderBalance} USDC`,
  );
});

router.command("/tx", async (ctx) => {
  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  const amount = parseFloat(ctx.message.content.split(" ")[1]);
  if (isNaN(amount) || amount <= 0) {
    await ctx.sendText("Please provide a valid amount. Usage: /tx <amount>");
    return;
  }

  // Convert amount to USDC decimals (6 decimal places)
  const amountInDecimals = Math.floor(amount * Math.pow(10, 6));

  const walletSendCalls = usdcHandler.createUSDCTransferCalls(
    validHex(senderAddress),
    validHex(agentAddress),
    amountInDecimals,
  );
  console.log("Replied with wallet sendcall");
  await ctx.conversation.send(walletSendCalls, ContentTypeWalletSendCalls);

  // Send a follow-up message about transaction references
  await ctx.sendText(
    `💡 After completing the transaction, you can send a transaction reference message to confirm completion.`,
  );
});

router.default(async (ctx) => {
  await ctx.sendText(
    "Available commands:\n" +
      "/balance - Check your USDC balance\n" +
      "/tx <amount> - Send USDC to the agent (e.g. /tx 0.1)",
  );
});

agent.use(router.middleware());
agent.use(transactionReferenceMiddleware);

agent.on("start", () => {
  console.log(`Waiting for messages...`);
  console.log(`Address: ${agent.address}`);
  console.log(`🔗${getTestUrl(agent.client)}`);
});

await agent.start();
