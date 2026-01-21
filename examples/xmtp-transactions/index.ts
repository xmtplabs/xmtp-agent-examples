import { Agent, validHex } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import { CommandRouter } from "@xmtp/agent-sdk/middleware";
import { ContentTypeWalletSendCalls } from "@xmtp/agent-sdk";
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

  const walletSendCalls = createUSDCTransferCalls(
    networkId,
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

  await ctx.sendText(
    `✅ Transaction confirmed!\n` +
      `🔗 Network: ${transactionRef.networkId}\n` +
      `📄 Hash: ${transactionRef.reference}\n` +
      `${transactionRef.metadata ? `📝 Transaction metadata received` : ""}`,
  );
});

agent.use(router.middleware());
await agent.start();
