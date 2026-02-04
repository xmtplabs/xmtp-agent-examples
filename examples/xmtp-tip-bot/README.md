# xmtp-tip-bot

Send ETH tips via XMTP chat on Base network!

## Features

- Send ETH tips in chat
- Base network (fast & cheap)
- Confirmation flow before sending
- Balance checking

## Commands

- \/tip <address> <amount>\ - Send ETH tip
- \/balance\ - Check bot wallet
- \/confirm\ - Confirm pending tip
- \/cancel\ - Cancel pending tip
- \/help\ - Show help

## Example

\\\
/tip 0x1234...abcd 0.001
\\\

## Setup

1. Add your wallet key to .env (needs ETH on Base!)
2. Run the agent:

\\\ash
yarn dev
\\\

## Important

The bot wallet needs ETH on Base for:
- Gas fees
- Sending tips

## Author

Built by [@0xGiwax](https://x.com/0xGiwax)
