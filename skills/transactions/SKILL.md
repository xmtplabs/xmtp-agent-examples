---
name: transactions
description: Token transactions and wallet integration for XMTP agents. Use when sending USDC, creating transaction requests, or handling transaction confirmations. Triggers on USDC transfer, wallet calls, or transaction reference.
license: MIT
metadata:
  author: xmtp
  version: "1.0.0"
---

# XMTP transactions

Send and receive token transactions using wallet_sendCalls (EIP-5792) specification.

## When to apply

Reference these guidelines when:
- Sending USDC or other tokens
- Creating transaction requests
- Handling transaction confirmations
- Checking token balances
- Working with smart contract wallets

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Send | CRITICAL | `send-` |
| 2 | Receive | CRITICAL | `receive-` |
| 3 | Balance | HIGH | `balance-` |

## Quick reference

### Send (CRITICAL)
- `send-usdc-transfer` - Create USDC transfer requests
- `send-wallet-calls` - Send wallet_sendCalls messages

### Receive (CRITICAL)
- `receive-transaction-reference` - Handle transaction confirmations

### Balance (HIGH)
- `balance-check` - Check USDC balance

## Supported networks

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Sepolia | 84532 | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base Mainnet | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Quick start

```typescript
import { createUSDCTransferCalls, getUSDCBalance } from "../../utils/transactions";
import { validHex } from "@xmtp/agent-sdk";

// Check balance
const balance = await getUSDCBalance("base-sepolia", validHex(address));

// Send transfer request
const calls = createUSDCTransferCalls(
  "base-sepolia",
  validHex(fromAddress),
  validHex(toAddress),
  1000000 // 1 USDC (6 decimals)
);
await ctx.conversation.sendWalletSendCalls(calls);
```

## How to use

Read individual rule files for detailed explanations:

```
rules/send-usdc-transfer.md
rules/receive-transaction-reference.md
rules/balance-check.md
```

## Related examples

- [xmtp-transactions](../../examples/xmtp-transactions/) - Full USDC transfer example
- [xmtp-smart-wallet](../../examples/xmtp-smart-wallet/) - Smart wallet integration
