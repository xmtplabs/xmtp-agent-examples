import { readFile } from "node:fs/promises";
import { Agent } from "@xmtp/agent-sdk";
import { getTestUrl } from "@xmtp/agent-sdk/debug";
import {
  type AttachmentUploadCallback,
  createRemoteAttachmentFromFile,
  downloadRemoteAttachment,
} from "@xmtp/agent-sdk/util";

import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import { uploadToPinata } from "./upload";
import { loadEnvFile } from "../../utils/general";

loadEnvFile();
const DEFAULT_IMAGE_PATH = "./logo.png";

const agent = await Agent.createFromEnv({
  env: process.env.XMTP_ENV as "local" | "dev" | "production",
});

agent.on("text", async (ctx) => {
  console.log(
    `Received text message: ${ctx.message.content} by ${ctx.message.senderInboxId}`,
  );

  const senderAddress = await ctx.getSenderAddress();
  console.log(`Preparing attachment for ${senderAddress}...`);
  await ctx.sendText(`I'll send you an attachment now...`);

  const fileData = await readFile(DEFAULT_IMAGE_PATH);
  const file = new File([fileData], "logo.png", {
    type: "image/png",
  });

  const uploadCallback: AttachmentUploadCallback = async (attachment) => {
    console.log(
      `Uploading encrypted attachment: ${attachment.filename}, size: ${attachment.content.payload.length} bytes`,
    );
    const fileUrl = await uploadToPinata(
      new Uint8Array(attachment.content.payload),
      attachment.filename,
    );
    console.log(`File uploaded to: ${fileUrl}`);
    return fileUrl;
  };

  const remoteAttachment = await createRemoteAttachmentFromFile(
    file,
    uploadCallback,
  );
  await ctx.conversation.send(remoteAttachment, ContentTypeRemoteAttachment);
  console.log("Remote attachment sent successfully");
});

agent.on("attachment", async (ctx) => {
  console.log("Received attachment message");

  const receivedAttachment = await downloadRemoteAttachment(
    ctx.message.content,
    agent,
  );

  const filename = receivedAttachment.filename || "unnamed";
  const mimeType = receivedAttachment.mimeType || "application/octet-stream";

  console.log(`Processing attachment: ${filename} (${mimeType})`);

  await ctx.sendText(
    `I received your attachment "${filename}"! Processing it now...`,
  );

  const file = new File([receivedAttachment.data], filename, {
    type: mimeType,
  });

  const uploadCallback: AttachmentUploadCallback = async (attachment) => {
    console.log(
      `Re-uploading attachment: ${attachment.filename}, size: ${attachment.content.payload.length} bytes`,
    );
    return await uploadToPinata(
      new Uint8Array(attachment.content.payload),
      attachment.filename,
    );
  };

  const remoteAttachment = await createRemoteAttachmentFromFile(
    file,
    uploadCallback,
  );
  await ctx.conversation.send(remoteAttachment, ContentTypeRemoteAttachment);
  console.log(`Successfully sent back attachment: ${filename}`);
  await ctx.sendText(`Here's your attachment back: ${filename}`);
});

agent.on("start", () => {
  console.log(`Address: ${agent.address}`);
  console.log(`🔗${getTestUrl(agent.client)}`);
  console.log(`Agent started. Waiting for messages...`);
});

void agent.start();
