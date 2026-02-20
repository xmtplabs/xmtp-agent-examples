# XMTP agent examples

A collection of examples for building XMTP agents using the [`@xmtp/agent-sdk`](https://github.com/xmtp/xmtp-js/tree/main/sdks/agent-sdk).

## Examples

Runnable example agents that demonstrate specific capabilities:

| Example                                                    | Description                       |
| ---------------------------------------------------------- | --------------------------------- |
| [xmtp-gm](examples/xmtp-gm/)                               | Simple agent that replies "gm"    |
| [xmtp-gpt](examples/xmtp-gpt/)                             | GPT-powered responses             |
| [xmtp-gated-group](examples/xmtp-gated-group/)             | Group gating with passphrase      |
| [xmtp-domain-resolver](examples/xmtp-domain-resolver/)     | ENS and Farcaster resolution      |
| [xmtp-transactions](examples/xmtp-transactions/)           | USDC transactions                 |
| [xmtp-smart-wallet](examples/xmtp-smart-wallet/)           | Smart wallet usage                |
| [xmtp-attachments](examples/xmtp-attachments/)             | File attachments with Pinata      |
| [xmtp-generalstore](examples/xmtp-generalstore/)           | Shopping cart with inline actions |
| [xmtp-thinking-reaction](examples/xmtp-thinking-reaction/) | Thinking emoji pattern            |
| [xmtp-queue-dual-client](examples/xmtp-queue-dual-client/) | Dual client architecture          |
| [xmtp-welcome-message](examples/xmtp-welcome-message/)     | Welcome messages with buttons     |

> Visit [miniapps](https://xmtp.org/miniapps) to explore the latest agents and mini-apps.

## Quick start

### Run an example

```bash
# Clone the repo
git clone https://github.com/xmtplabs/xmtp-agent-examples.git
cd xmtp-agent-examples

# Install packages
yarn

# Generate random XMTP keys
yarn gen:keys

# Run an example
cd examples/xmtp-gm
yarn dev
```

### Environment variables

Create a `.env` file with:

```bash
XMTP_WALLET_KEY=      # Private key for the wallet
XMTP_DB_ENCRYPTION_KEY= # Encryption key for local database
XMTP_ENV=dev          # local, dev, or production
```

### Generate keys

```bash
yarn gen:keys
```

> Warning: Running `yarn gen:keys` will append keys to your existing `.env` file.

## Development

### Vibe coding

See the [skills](skills/) directory for AI-assisted development patterns.

```bash
Prompt: Create an agent that multiplies numbers by 2
```

### Debug mode

```bash
XMTP_FORCE_DEBUG=true
XMTP_FORCE_DEBUG_LEVEL=debug # debug, info, warn, error
```

### Talk to your agent

Test using [xmtp.chat](https://xmtp.chat), the official playground for agents.

### CLI debugging

```bash
yarn debug
yarn debug --agent 0x81bddb3d7cd9ccdfaeb117ce19fd77c1433b907d
```

### Local XMTP network

```bash
# Start local network
./dev/up

# Update .env
XMTP_ENV=local

# Stop
./dev/down
```

### Revoke installations

```bash
yarn revoke <inbox-id> <installations-to-exclude>
```

## Deploy

See [Deploy your own agent](https://docs.xmtp.org/agents/deploy/deploy-agent) for production deployment guides.

## Community examples

| Example                                                               | Description         |
| --------------------------------------------------------------------- | ------------------- |
| [xmtp-groq](https://github.com/xmtplabs/xmtp-agent-examples/pull/354) | Groq AI integration |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
