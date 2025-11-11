# Transactions example

This example allows users to send tokens like USDC to an agent.

<p align="center" >
  <img src="media/one.png" alt="Image 1" width="30%">
  <img src="media/two.png" alt="Image 2" width="30%">
  <img src="media/three.png" alt="Image 2" width="30%">
</p>

## Usage

### Commands

```bash
# send a transaction request
/tx <amount>

# check your balance
/balance
```

### Create a transaction request

With XMTP, a transaction request is represented using wallet_sendCalls RPC specification from [EIP-5792](https://finviz.com/map.ashx) with additional metadata for display:

```tsx
const walletSendCalls: WalletSendCallsParams = {
  version: "1.0",
  from: `0x123...abc`,
  chainId: toHex(84532), // Base Sepolia Testnet
  calls: [
    {
      to: "0x456...xyz",
      data: "0x111...aaa",
      metadata: {
        description: "Transfer 10 USDC on Base Sepolia",
        transactionType: "transfer",
        currency: "USDC",
        amount: 10,
        decimals: 6,
        networkId: "base-sepolia",
      },
    },
  ],
};
```

Once you have a transaction reference, you can send it as part of your conversation:

```tsx
await conversation.messages.send(walletSendCalls, ContentTypeWalletSendCalls);
```

### Transaction reference middleware

The agent automatically handles transaction reference messages through middleware. When a transaction reference is received, it will display confirmation details including the network, transaction hash, and metadata.

```tsx
import { type AgentMiddleware } from "@xmtp/agent-sdk";
import {
  TransactionReferenceCodec,
  ContentTypeTransactionReference,
  type TransactionReference,
} from "@xmtp/content-type-transaction-reference";

// Transaction reference middleware
const transactionReferenceMiddleware: AgentMiddleware = async (ctx, next) => {
  // Check if this is a transaction reference message
  if (ctx.useCodec(ContentTypeTransactionReference)) {
    const transactionRef = ctx.message.content as TransactionReference;

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

// Apply the middleware
agent.use(transactionReferenceMiddleware);
```

The middleware automatically detects and processes transaction reference messages without requiring any commands.

> ⚠️ **Coinbase Wallet Compatibility**
>
> Coinbase Wallet incorrectly wraps transaction references in an extra `transactionReference` property. Handle both formats:
>
> ```tsx
> let transactionRef = ctx.message.content.transactionReference;
> if (transactionRef.transactionReference) {
>   transactionRef = transactionRef.transactionReference;
> }
> ```

### Supported networks

All eth networks are supported.This example covers Base Sepolia and Base Mainnet.

```tsx
// Configuration constants
const networks = [
  {
    tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
    chainId: toHex(84532), // Base Sepolia network ID (84532 in hex)
    decimals: 6,
    networkName: "Base Sepolia",
    networkId: "base-sepolia",
  },
  {
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base Mainnet
    chainId: toHex(8453), // Base Mainnet network ID (8453 in hex)
    decimals: 6,
    networkName: "Base Mainnet",
    networkId: "base-mainnet",
  },
];
```

## Getting started

### Requirements

- Node.js v20 or higher
- Yarn v4 or higher
- This example works on [Base Sepolia Testnet](https://chainlist.org/chain/84532)
- You'll need some `ETH` in your wallet to pay for the transaction
- Connect with a wallet extension like [MetaMask](https://metamask.io/) or Coinbase Wallet
- Docker (optional, for `local` network)
- Faucets: [Circle](https://faucet.circle.com), [Base](https://portal.cdp.coinbase.com/products/faucet)
- [@xmtp/content-type-transaction-reference](https://github.com/xmtp/xmtp-js/tree/main/content-types/content-type-transaction-reference)
- [@xmtp/content-type-wallet-send-calls](https://github.com/xmtp/xmtp-js/tree/main/content-types/content-type-wallet-send-calls)

### Environment variables

To run your XMTP agent, you must create a `.env` file with the following variables:

```bash
XMTP_WALLET_KEY= # the private key for the wallet
XMTP_DB_ENCRYPTION_KEY= # the encryption key for the wallet

NETWORK_ID=base-sepolia # base-mainnet or others
XMTP_ENV=dev # local, dev, production
```

### Run the agent

```bash
# git clone repo
git clone https://github.com/ephemeraHQ/xmtp-agent-examples.git
# go to the folder
cd xmtp-agent-examples
cd examples/xmtp-transactions
# install packages
yarn
# generate random xmtp keys (optional)
yarn gen:keys
# run the example
yarn dev
```

## How to test?

1. Start the agent
1. Visit [xmtp.chat](https://xmtp.chat)
1. Make sure "Smart contract wallet" toggle is turned on (ephemeral wallets are not supported)
1. Get testnet USDC from a [Base Sepolia faucet](https://docs.base.org/base-chain/tools/network-faucets)
1. Send `/balance` to the agent to check your testnet USDC balance

**Note:** If you connect with an externally owned account (EOA) instead of a smart contract wallet (SCW), you will likely see this error:

> Signature error Signature validation failed
