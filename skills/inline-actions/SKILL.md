---
name: inline-actions
description: Interactive button-based UI for XMTP agents following XIP-67. Use when creating menus, confirmation dialogs, selection options, or any button-based interaction. Triggers on inline actions, buttons, menus, or ActionBuilder.
license: MIT
metadata:
  author: xmtp
  version: "1.0.0"
---

# XMTP inline actions

Interactive button-based UI for XMTP agents following the XIP-67 specification. Users can tap buttons instead of typing commands.

## When to apply

Reference these guidelines when:
- Creating interactive button menus
- Building confirmation dialogs
- Implementing selection options
- Setting up multi-menu navigation
- Handling action callbacks

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | ActionBuilder | CRITICAL | `builder-` |
| 2 | Helpers | HIGH | `helpers-` |
| 3 | App Config | MEDIUM | `config-` |
| 4 | Validators | MEDIUM | `validators-` |

## Quick reference

### ActionBuilder (CRITICAL)
- `builder-create` - Create action menus with ActionBuilder
- `builder-send` - Send actions to conversation

### Helpers (HIGH)
- `helpers-confirmation` - Send confirmation dialogs
- `helpers-selection` - Send selection menus
- `helpers-navigation` - Show navigation options

### App Config (MEDIUM)
- `config-menus` - Configure multi-menu applications
- `config-initialize` - Initialize app from config

### Validators (MEDIUM)
- `validators-inbox-id` - Validate inbox ID format
- `validators-ethereum-address` - Validate Ethereum address

## Quick start

```typescript
import {
  ActionBuilder,
  inlineActionsMiddleware,
  registerAction,
} from "../../utils/inline-actions";

// 1. Add middleware to your agent
agent.use(inlineActionsMiddleware);

// 2. Register action handlers
registerAction("my-action", async (ctx) => {
  await ctx.conversation.sendText("Action executed!");
});

// 3. Send interactive buttons
await ActionBuilder.create("my-menu", "Choose an option:")
  .add("my-action", "Click Me")
  .add("other-action", "Cancel")
  .send(ctx);
```

## How to use

Read individual rule files for detailed explanations:

```
rules/builder-create.md
rules/helpers-confirmation.md
rules/config-menus.md
```

## Related examples

- [xmtp-generalstore](../../examples/xmtp-generalstore/) - Full shopping cart with inline actions
- [xmtp-welcome-message](../../examples/xmtp-welcome-message/) - Welcome messages with buttons
