import { Agent } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import {
  ContentTypeMarkdown,
  MarkdownCodec,
} from "@xmtp/content-type-markdown";

import {
  inlineActionsMiddleware,
  registerAction,
  ActionBuilder,
  sendActions,
  sendConfirmation,
} from "../../utils/inline-actions/inline-actions";
import { ActionsCodec } from "../../utils/inline-actions/types/ActionsContent";
import { IntentCodec } from "../../utils/inline-actions/types/IntentContent";
import { loadEnvFile } from "../../utils/general";
//hi1
loadEnvFile();

// Store inventory
interface Product {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

const products: Product[] = [
  // Personal Care
  {
    id: "deodorant",
    name: "Deodorant",
    category: "personal-care",
    emoji: "🧴",
  },
  {
    id: "toothbrush",
    name: "Toothbrush",
    category: "personal-care",
    emoji: "🪥",
  },
  {
    id: "toothpaste",
    name: "Toothpaste",
    category: "personal-care",
    emoji: "🦷",
  },
  { id: "tictacs", name: "Tic Tacs", category: "personal-care", emoji: "🍬" },

  // Beverages
  { id: "redbull", name: "Red Bull", category: "beverages", emoji: "🔴" },
];

// Track orders per conversation
const orders = new Map<string, Product[]>();

// Hackathon prize information in markdown format
const hackathonPrizesMarkdown = `
## Say hi to XMTP!

XMTP is the largest & most secure decentralized messaging network. Powers a rapidly growing ecosystem of mini apps—where everything is a built-in chat experience from trading, prediction markets, event coordination, payments, and games.

## 🏆 Hackathon prizes

#### 📲 Best Miniapp in a Group Chat
- **$2500** x 1 team

#### 🤖 Best Use of the Agent SDK
- **$2500** x 1 team

---

📋 **[Full Prize Breakdown](https://ethglobal.com/events/buenosaires/prizes/xmtp)**`;

function getOrderSummary(conversationId: string): string {
  const orderItems = orders.get(conversationId) || [];
  if (orderItems.length === 0) {
    return "Your cart is empty.";
  }

  const itemCounts = new Map<string, number>();
  orderItems.forEach((item) => {
    itemCounts.set(item.id, (itemCounts.get(item.id) || 0) + 1);
  });

  const summary = Array.from(itemCounts.entries())
    .map(([id, count]) => {
      const product = products.find((p) => p.id === id);
      return `${product?.emoji} ${product?.name} x${count}`;
    })
    .join("\n");

  return `Your order:\n${summary}`;
}

async function main() {
  const agent = await Agent.createFromEnv({
    dbPath: (inboxId) =>
      process.env.RAILWAY_VOLUME_MOUNT_PATH ??
      "." + `/${process.env.XMTP_ENV}-${inboxId.slice(0, 8)}.db3`,
    codecs: [new ActionsCodec(), new IntentCodec(), new MarkdownCodec()],
  });

  // Register action handlers
  registerAction("show-menu", async (ctx) => {
    const builder = ActionBuilder.create(
      "main-menu",
      "🏪 Welcome to General Store!\n\nSelect a product:",
    );

    // Add all products to the menu
    products.forEach((product) => {
      builder.add(`add-${product.id}`, `${product.emoji} ${product.name}`);
    });

    // Add cart and checkout options
    builder.add("view-cart", "🛒 View Cart");
    builder.add("checkout", "✅ Checkout");

    await builder.send(ctx);
  });

  // Register add-to-cart actions for each product
  products.forEach((product) => {
    registerAction(`add-${product.id}`, async (ctx) => {
      const conversationId = ctx.conversation.id;
      const currentOrder = orders.get(conversationId) || [];
      currentOrder.push(product);
      orders.set(conversationId, currentOrder);

      await ctx.sendText(
        `✅ Added ${product.emoji} ${product.name} to your cart!\n\n${getOrderSummary(conversationId)}`,
      );
      //1
      // Show navigation options
      const navMenu = ActionBuilder.create(
        "after-add-menu",
        "What would you like to do next?",
      )
        .add("show-menu", "🛍️ Continue Shopping")
        .add("view-cart", "🛒 View Cart")
        .add("checkout", "✅ Checkout")
        .build();

      await sendActions(ctx.conversation, navMenu);
    });
  });

  registerAction("view-cart", async (ctx) => {
    const conversationId = ctx.conversation.id;
    const summary = getOrderSummary(conversationId);

    const menu = ActionBuilder.create("cart-menu", summary)
      .add("show-menu", "🛍️ Continue Shopping")
      .add("checkout", "✅ Checkout")
      .add("clear-cart", "🗑️ Clear Cart", "danger")
      .build();

    await sendActions(ctx.conversation, menu);
  });

  registerAction("clear-cart", async (ctx) => {
    await sendConfirmation(
      ctx,
      "Are you sure you want to clear your cart?",
      async (ctx) => {
        const conversationId = ctx.conversation.id;
        orders.delete(conversationId);
        await ctx.sendText("🗑️ Cart cleared!");

        const menu = ActionBuilder.create(
          "after-clear-menu",
          "Your cart has been cleared. What would you like to do?",
        )
          .add("show-menu", "🛍️ Start Shopping")
          .build();

        await sendActions(ctx.conversation, menu);
      },
    );
  });

  registerAction("checkout", async (ctx) => {
    const conversationId = ctx.conversation.id;
    const orderItems = orders.get(conversationId) || [];

    if (orderItems.length === 0) {
      await ctx.sendText("🛒 Your cart is empty! Add some items first.");
      const menu = ActionBuilder.create(
        "empty-cart-menu",
        "What would you like to do?",
      )
        .add("show-menu", "🛍️ Start Shopping")
        .build();

      await sendActions(ctx.conversation, menu);
      return;
    }

    const summary = getOrderSummary(conversationId);
    await sendConfirmation(
      ctx,
      `Confirm your order?\n\n${summary}\n\nThis will place your order.`,
      async (ctx) => {
        const conversationId = ctx.conversation.id;
        const orderItems = orders.get(conversationId) || [];

        const itemCounts = new Map<string, number>();
        orderItems.forEach((item) => {
          itemCounts.set(item.id, (itemCounts.get(item.id) || 0) + 1);
        });

        const orderDetails = Array.from(itemCounts.entries())
          .map(([id, count]) => {
            const product = products.find((p) => p.id === id);
            return `${product?.emoji} ${product?.name} x${count}`;
          })
          .join("\n");

        await ctx.sendText(
          `✅ Order confirmed!\n\n${orderDetails}\n\n📦 Your order will be ready for pickup soon. Thank you for shopping at General Store!`,
        );

        // Send hackathon prize information as markdown
        await ctx.conversation.send(
          hackathonPrizesMarkdown,
          ContentTypeMarkdown,
        );

        // Clear the cart after checkout
        orders.delete(conversationId);

        const menu = ActionBuilder.create(
          "after-checkout-menu",
          "Would you like to place another order?",
        )
          .add("show-menu", "🛍️ New Order")
          .build();

        await sendActions(ctx.conversation, menu);
      },
    );
  });

  // Use the inline actions middleware
  agent.use(inlineActionsMiddleware);

  // Track if hackathon message has been sent per conversation
  const hackathonMessageSent = new Set<string>();

  // Handle text messages - show menu on any text
  agent.on("text", async (ctx) => {
    const builder = ActionBuilder.create(
      "main-menu",
      "🏪 Welcome to General Store!\n\nSelect a product:",
    );

    // Add all products to the menu
    products.forEach((product) => {
      builder.add(`add-${product.id}`, `${product.emoji} ${product.name}`);
    });

    // Add cart and checkout options
    builder.add("view-cart", "🛒 View Cart");
    builder.add("checkout", "✅ Checkout");

    await sendActions(ctx.conversation, builder.build());

    // Send hackathon prize information on first interaction
    const conversationId = ctx.conversation.id;
    if (!hackathonMessageSent.has(conversationId)) {
      hackathonMessageSent.add(conversationId);
      await ctx.conversation.send(hackathonPrizesMarkdown, ContentTypeMarkdown);
    }
  });

  // Handle startup
  agent.on("start", () => {
    console.log(`🏪 General Store Agent is running...`);
    console.log(`Address: ${agent.address}`);
    console.log(`🔗 ${getTestUrl(agent.client)}`);
    console.log(`Send any message to start shopping!`);
  });

  // Start the agent
  await agent.start();
}

main().catch(console.error);
