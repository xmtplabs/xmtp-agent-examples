# Remote attachments example

An XMTP agent that demonstrates [file attachment](https://docs.xmtp.org/agents/content-types/attachments) handling using utility functions for encryption, decoding, and re-encoding.

<p align="center" >
  <img src="screenshot.png" alt="Image 1" width="49%">
</p>

## Usage

Send and receive attachments using the `sendRemoteAttachment` and `downloadRemoteAttachment` utility functions.

```ts
import { type AttachmentUploadCallback } from "@xmtp/agent-sdk/util";

agent.on("text", async (ctx) => {
  if (ctx.message.content === "/send-file") {
    // Create a File object (in Node.js, you can use the File class from buffer or file-system)
    const file = new File(["Hello, World!"], "hello.txt", {
      type: "text/plain",
    });

    // Upload callback - implement your own storage solution
    const uploadCallback: AttachmentUploadCallback = async (attachment) => {
      // Upload "attachment.content.payload" to your storage
      const pinata = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT,
        pinataGateway: process.env.PINATA_GATEWAY,
      });

      const mimeType = "application/octet-stream";
      const encryptedBlob = new Blob(
        [Buffer.from(attachment.content.payload)],
        {
          type: mimeType,
        },
      );
      const encryptedFile = new File([encryptedBlob], attachment.filename, {
        type: mimeType,
      });
      const upload = await pinata.upload.public.file(encryptedFile);

      // Return the public URL where the file can be downloaded
      return pinata.gateways.public.convert(`${upload.cid}`);
    };

    // Send the encrypted remote attachment
    await ctx.conversation.sendRemoteAttachment(file, uploadCallback);
  }
});
```

Other agents can then download and decrypt the attachment using the `"attachment"` topic:

```ts
import { downloadRemoteAttachment } from "@xmtp/agent-sdk/util";

agent.on("attachment", async (ctx) => {
  const receivedAttachment = await downloadRemoteAttachment(
    ctx.message.content,
    agent,
  );
  console.log(`Received attachment: ${receivedAttachment.filename}`);
});
```

## Getting started

### Requirements

- Node.js v20 or higher
- Yarn v4 or higher
- Docker (optional, for local network)

### Environment variables

To run your XMTP agent, you must create a `.env` file with the following variables:

```bash
XMTP_WALLET_KEY= # the private key of the wallet
XMTP_DB_ENCRYPTION_KEY= # encryption key for the local database
XMTP_ENV=dev # local, dev, production

# Pinata API Key
PINATA_API_KEY= # the API key for the Pinata service
PINATA_SECRET_KEY= # the secret key for the Pinata service
```

### Run the agent

```bash
# git clone repo
git clone https://github.com/ephemeraHQ/xmtp-agent-examples.git
# go to the folder
cd xmtp-agent-examples
cd examples/xmtp-attachments
# install packages
yarn
# generate random xmtp keys (optional)
yarn gen:keys
# run the example
yarn dev
```
