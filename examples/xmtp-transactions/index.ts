import { Agent, validHex } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import { CommandRouter } from "@xmtp/agent-sdk/middleware";
import { loadEnvFile } from "../../utils/general";
import {
  createUSDCTransferCalls,
  getUSDCBalance,
} from "../../utils/transactions";

loadEnvFile();
const agent = await Agent.createFromEnv();
const networkId = process.env.NETWORK_ID || "base-sepolia";

const router = new CommandRouter();

router.command("/balance", async (ctx) => {
  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  const agentBalance = await getUSDCBalance(networkId, validHex(agentAddress));
  const senderBalance = await getUSDCBalance(
    networkId,
    validHex(senderAddress),
  );

  await ctx.conversation.sendText(
    `My USDC balance is: ${agentBalance} USDC\n` +
      `Your USDC balance is: ${senderBalance} USDC`,
  );
});

router.command("/tx", async (ctx) => {
  console.log("Received transaction request", ctx.message);

  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  // Parse amount from command arguments
  const messageContent = String(ctx.message.content).trim();
  const parts = messageContent.split(/\s+/);
  const valueToParse = parts[1] || "";
  const amount = parseFloat(valueToParse);

  if (isNaN(amount) || amount <= 0 || !isFinite(amount)) {
    await ctx.conversation.sendText(
      "Please provide a valid amount. Usage: /tx <amount>",
    );
    return;
  }

  // Convert amount to USDC decimals (6 decimal places)
  const amountInDecimals = Math.floor(amount * Math.pow(10, 6));

  console.log("Amount", amount);
  console.log("Amount in decimals", amountInDecimals);

  const walletSendCalls = createUSDCTransferCalls(
    networkId,
    validHex(senderAddress),
    validHex(agentAddress),
    amountInDecimals,
  );
  console.log("Replied with wallet sendcall");
  await ctx.conversation.sendWalletSendCalls(walletSendCalls);

  // Send a follow-up message about transaction references
  await ctx.conversation.sendText(
    `💡 After completing the transaction, you can send a transaction reference message to confirm completion.`,
  );
});

router.default(async (ctx) => {
  // Use the exposed command list from CommandRouter
  const commands = router.commandList;
  const commandDescriptions: Record<string, string> = {
    "/balance": "Check your USDC balance",
    "/tx": "Send USDC to the agent (e.g. /tx 0.1)",
  };

  const helpText =
    "Available commands:\n" +
    commands
      .map((cmd: string) => {
        const desc = commandDescriptions[cmd] || "";
        return desc ? `${cmd} - ${desc}` : cmd;
      })
      .join("\n");

  await ctx.conversation.sendText(helpText);
});

agent.on("start", () => {
  console.log(`Address: ${agent.address}`);
  console.log(`🔗${getTestUrl(agent.client)}`);
  console.log(`Agent started. Waiting for messages...`);
});

agent.on("transaction-reference", async (ctx) => {
  // Handle both standard format and Coinbase's incorrect nested format
  // Standard: { transactionReference: { networkId, reference, metadata } }
  // Coinbase: { transactionReference: { transactionReference: { networkId, reference, metadata } } }

  // @ts-expect-error - Coinbase Wallet incorrectly wraps transaction references in an extra `transactionReference` property
  let transactionRef = ctx.message.content.transactionReference;
  if (transactionRef.transactionReference) {
    transactionRef = transactionRef.transactionReference;
  }

  console.log("Received transaction reference: ", transactionRef);

  await ctx.conversation.sendText(
    `✅ Transaction confirmed!\n` +
      `🔗 Network: ${transactionRef.networkId}\n` +
      `📄 Hash: ${transactionRef.reference}\n` +
      `${transactionRef.metadata ? `📝 Transaction metadata received` : ""}`,
  );
});

agent.use(router.middleware());
await agent.start();
