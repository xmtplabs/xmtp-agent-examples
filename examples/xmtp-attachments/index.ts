import { readFile } from "node:fs/promises";
import {
  Agent,
  type AttachmentUploadCallback,
  downloadRemoteAttachment,
  getTestUrl,
  type MessageContext,
} from "@xmtp/agent-sdk";

import { uploadToPinata } from "./upload";
import { loadEnvFile } from "../../utils/general";

loadEnvFile();
const DEFAULT_IMAGE_PATH = "./logo.png";

const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV as "local" | "dev" | "production",
});

agent.on("text", async (ctx: MessageContext) => {
  console.log(
    `Received text message: ${ctx.message.content} by ${ctx.message.senderInboxId}`,
  );

  const senderAddress = await ctx.getSenderAddress();
  console.log(`Preparing attachment for ${senderAddress}...`);
  await ctx.conversation.sendText(`I'll send you an attachment now...`);

  const fileData = await readFile(DEFAULT_IMAGE_PATH);
  const file = new File([fileData], "logo.png", {
    type: "image/png",
  });

  const uploadCallback: AttachmentUploadCallback = async (attachment) => {
    console.log(
      `Uploading encrypted attachment, size: ${attachment.payload.length} bytes`,
    );
    const fileUrl = await uploadToPinata(
      new Uint8Array(attachment.payload),
      "encrypted-attachment",
    );
    console.log(`File uploaded to: ${fileUrl}`);
    return fileUrl;
  };

  await ctx.conversation.sendRemoteAttachment(file, uploadCallback);
  console.log("Remote attachment sent successfully");
});

agent.on("attachment", async (ctx: MessageContext) => {
  console.log("Received attachment message");

  // Type guard ensures ctx.message.content is RemoteAttachment
  if (!ctx.isRemoteAttachment()) {
    return;
  }

  const receivedAttachment = await downloadRemoteAttachment(
    ctx.message.content,
  );

  const filename = receivedAttachment.filename || "unnamed";
  const mimeType = receivedAttachment.mimeType || "application/octet-stream";

  console.log(`Processing attachment: ${filename} (${mimeType})`);

  await ctx.conversation.sendText(
    `I received your attachment "${filename}"! Processing it now...`,
  );

  const file = new File([receivedAttachment.content], filename, {
    type: mimeType,
  });

  const uploadCallback: AttachmentUploadCallback = async (attachment) => {
    console.log(
      `Re-uploading attachment, size: ${attachment.payload.length} bytes`,
    );
    return await uploadToPinata(
      new Uint8Array(attachment.payload),
      "encrypted-attachment",
    );
  };

  await ctx.conversation.sendRemoteAttachment(file, uploadCallback);
  console.log(`Successfully sent back attachment: ${filename}`);
  await ctx.conversation.sendText(`Here's your attachment back: ${filename}`);
});

agent.on("start", () => {
  console.log(`Address: ${agent.address}`);
  console.log(`🔗${getTestUrl(agent.client)}`);
  console.log(`Agent started. Waiting for messages...`);
});

void agent.start();
