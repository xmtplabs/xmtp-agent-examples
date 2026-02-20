import {
  Agent,
  createERC20TransferCalls,
  CommandRouter,
  getERC20Balance,
  getERC20Decimals,
  getTestUrl,
  validHex,
} from "@xmtp/agent-sdk";
import { formatUnits, parseUnits } from "viem";
import { base, baseSepolia } from "viem/chains";
import { loadEnvFile } from "../../utils/general";

loadEnvFile();
const agent = await Agent.createFromEnv();
const networkId = process.env.NETWORK_ID || "base-sepolia";
const CHAIN = networkId === "base-mainnet" ? base : baseSepolia;
const USDC_ADDRESS = (
  networkId === "base-mainnet"
    ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    : "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
) as `0x${string}`;

let USDC_DECIMALS = 6;
getERC20Decimals({ chain: CHAIN, tokenAddress: USDC_ADDRESS })
  .then((d) => {
    USDC_DECIMALS = d;
  })
  .catch(() => {});

const router = new CommandRouter();

router.command("/balance", async (ctx) => {
  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  const [agentBalance, senderBalance] = await Promise.all([
    getERC20Balance({
      chain: CHAIN,
      tokenAddress: USDC_ADDRESS,
      address: validHex(agentAddress),
    }),
    getERC20Balance({
      chain: CHAIN,
      tokenAddress: USDC_ADDRESS,
      address: validHex(senderAddress),
    }),
  ]);

  await ctx.conversation.sendText(
    `My USDC balance is: ${formatUnits(agentBalance, USDC_DECIMALS)} USDC\n` +
      `Your USDC balance is: ${formatUnits(senderBalance, USDC_DECIMALS)} USDC`,
  );
});

router.command("/tx", async (ctx) => {
  console.log("Received transaction request", ctx.message);

  const agentAddress = agent.address;
  const senderAddress = await ctx.getSenderAddress();

  // CommandRouter may pass either "/tx 2" or just "2" as message content.
  const messageContent = String(ctx.message.content ?? "").trim();
  const argsText = messageContent.toLowerCase().startsWith("/tx")
    ? messageContent.replace(/^\/tx\b/i, "").trim()
    : messageContent;
  const amountToken = argsText.split(/\s+/)[0] ?? "";

  let amount: bigint;
  try {
    amount = parseUnits(amountToken || "0", USDC_DECIMALS);
  } catch {
    await ctx.conversation.sendText(
      "Please provide a valid amount. Usage: /tx <amount>",
    );
    return;
  }
  if (amount <= 0n) {
    await ctx.conversation.sendText(
      "Please provide a positive amount. Usage: /tx <amount>",
    );
    return;
  }

  const walletSendCalls = createERC20TransferCalls({
    chain: CHAIN,
    tokenAddress: USDC_ADDRESS,
    from: validHex(senderAddress),
    to: validHex(agentAddress),
    amount,
    description: `Transfer ${amountToken} USDC to agent on ${CHAIN.name}`,
  });
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
