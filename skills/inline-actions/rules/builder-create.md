---
title: Create action menus with ActionBuilder
impact: CRITICAL
tags: inline-actions, buttons, menus
---

## Create action menus with ActionBuilder

Use `ActionBuilder` to create interactive button menus.

**Basic menu:**

```typescript
await ActionBuilder.create("menu-id", "Choose an option:")
  .add("action-1", "Option 1")
  .add("action-2", "Option 2")
  .add("action-3", "Cancel")
  .send(ctx);
```

Implement `ActionBuilder` as a fluent builder that constructs action objects and sends via `ctx.conversation.sendActions()`.

**With button styles:**

```typescript
import { ActionStyle } from "@xmtp/node-sdk";

await ActionBuilder.create("confirm-delete", "Delete this item?")
  .add("confirm-yes", "Yes, Delete", ActionStyle.Danger)
  .add("confirm-no", "Cancel")
  .send(ctx);
```

**Register handlers:**

```typescript
registerAction("action-1", async (ctx) => {
  await ctx.conversation.sendText("You selected Option 1!");
});

registerAction("action-2", async (ctx) => {
  await ctx.conversation.sendText("You selected Option 2!");
});
```

Implement `registerAction` to store handlers in a Map keyed by action ID.

**Important:** Always register action handlers before sending menus, or handle unknown actions gracefully.
