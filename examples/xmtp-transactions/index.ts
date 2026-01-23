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

  const parseUsdcToBaseUnits = (raw: string): number | null => {
    const s = raw.trim();
    if (!s) return null;

    // Accept: "2", "2.5", ".5" (USDC has 6 decimals)
    if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(s)) return null;

    const [wholePart, fracPartRaw = ""] = s.split(".");
    const whole = BigInt(wholePart === "" ? "0" : wholePart);
    const fracPart = fracPartRaw.padEnd(6, "0").slice(0, 6);
    const frac = BigInt(fracPart === "" ? "0" : fracPart);
    const units = whole * 1_000_000n + frac;

    if (units <= 0n) return null;
    if (units > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(units);
  };

  // CommandRouter may pass either "/tx 2" or just "2" as message content.
  const messageContent = String(ctx.message.content ?? "").trim();
  const argsText = messageContent.toLowerCase().startsWith("/tx")
    ? messageContent.replace(/^\/tx\b/i, "").trim()
    : messageContent;
  const amountToken = argsText.split(/\s+/)[0] ?? "";
  const amountInDecimals = parseUsdcToBaseUnits(amountToken);

  if (!amountInDecimals) {
    await ctx.conversation.sendText(
      "Please provide a valid amount. Usage: /tx <amount>",
    );
    return;
  }

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
