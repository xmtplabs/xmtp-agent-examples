# AI agent guidelines

Guidelines for AI agents working with this repository.

## Repository structure

```
xmtp-agent-skills/
├── skills/           # Best practices and patterns
│   ├── building-agents/
│   ├── handling-commands/
│   ├── creating-inline-actions/
│   ├── handling-attachments/
│   ├── handling-transactions/
│   ├── managing-groups/
│   ├── sending-reactions/
│   └── resolving-domains/
├── examples/         # Runnable example agents
│   ├── xmtp-gm/
│   ├── xmtp-gpt/
│   └── ...
├── utils/            # Shared utilities
│   ├── inline-actions.ts
│   ├── transactions.ts
│   ├── resolver.ts
│   └── general.ts
└── dev/              # Local development tools
```

## Working with skills

### Skill structure

Each skill follows this pattern:

```
skills/{skill-name}/
├── SKILL.md          # Main skill definition
└── rules/            # Individual rule files
    ├── rule-1.md
    ├── rule-2.md
    └── ...
```

### SKILL.md format

```markdown
---
name: xmtp-skill-name
description: When to use this skill
license: MIT
metadata:
  author: xmtp
  version: "1.0.0"
---

# Skill title

Brief description.

## When to apply

- Use case 1
- Use case 2

## Quick reference

- `rule-name` - Description
```

### Rule file format

````markdown
---
title: Rule Title
impact: CRITICAL | HIGH | MEDIUM | LOW
tags: tag1, tag2
---

## Rule title

Why it matters.

**Incorrect:**

```typescript
// Bad example
```
````

**Correct:**

```typescript
// Good example
```

````

## Creating new skills

1. Create directory: `skills/{skill-name}/rules/`
2. Create `SKILL.md` with frontmatter
3. Add individual rule files in `rules/`
4. Update root `README.md` to list the skill

## Creating new examples

1. Create directory: `examples/xmtp-{name}/`
2. Add `index.ts` with agent implementation
3. Add `package.json` with dependencies
4. Add `README.md` with usage instructions
5. Update root `README.md` to list the example

### Example package.json template

```json
{
  "name": "@examples/xmtp-agent-name",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx --watch index.ts",
    "gen:keys": "yarn dlx @xmtp/cli init --output ./.env",
    "start": "tsx index.ts"
  },
  "dependencies": {
    "@xmtp/agent-sdk": "*"
  },
  "devDependencies": {
    "tsx": "*",
    "typescript": "*"
  },
  "engines": {
    "node": ">=20"
  }
}
````

## Code patterns

### Agent initialization

```typescript
import { Agent, getTestUrl } from "@xmtp/agent-sdk";

const agent = await Agent.createFromEnv();

agent.on("text", async (ctx) => {
  await ctx.conversation.sendText("Hello!");
});

agent.on("start", () => {
  console.log(`Agent: ${agent.address}`);
  console.log(`Test: ${getTestUrl(agent.client)}`);
});

await agent.start();
```

### Use validators over type assertions

```typescript
// Bad
const address = value as `0x${string}`;

// Good
import { validHex } from "@xmtp/agent-sdk";
const address = validHex(value);
```

### Use CommandRouter for commands

```typescript
import { Agent, CommandRouter } from "@xmtp/agent-sdk";

const router = new CommandRouter();
router.command("/help", async (ctx) => { ... });
agent.use(router.middleware());
```

### Use filters for type safety

```typescript
import { filter, isText } from "@xmtp/agent-sdk";

if (isText(ctx.message) && !filter.fromSelf(ctx.message, ctx.client)) {
  // Handle text message
}
```

## Testing

Test agents using:

- [xmtp.chat](https://xmtp.chat) - Official playground
- `yarn debug` - CLI tool
- Local network via `./dev/up`
