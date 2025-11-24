# General Store Bot

An XMTP agent that operates as a general store where people can order items using inline actions.

## Features

- 🛍️ Browse products by category
- 🛒 Shopping cart functionality
- ✅ Order confirmation
- 🎯 Interactive menu system using inline actions

## Products

### Personal Care

- 🦷 Toothpaste
- 🍬 Mints
- 🍬 TicTacs

### Beverages

- 🔴 Red Bull
- 💧 Water Bottle
- ☕ Coffee

## Getting Started

### Environment Variables

Create a `.env` file:

```bash
XMTP_WALLET_KEY=your_private_key_here
XMTP_DB_ENCRYPTION_KEY=your_encryption_key_here
XMTP_ENV=dev
```

### Run the Agent

```bash
cd examples/xmtp-generalstore
yarn install
yarn gen:keys
yarn dev
```

Send "hi" or "menu" to start shopping!
