# Content Types Removal Errors

Build errors when removing content type packages and importing from `@xmtp/agent-sdk`.

**Summary**: 13 errors across 7 files | **SDK Version**: 2.0.0-rc1  
**Root Cause**: SDK does not re-export content types, codecs, or primitives from its main entry point.

---

## Error Reference

| # | File | Line | Missing Export | Workaround Package |
|---|------|------|----------------|-------------------|
| 1 | `examples/xmtp-attachments/index.ts` | 10 | `ContentTypeRemoteAttachment` | `@xmtp/content-type-remote-attachment` |
| 2 | `examples/xmtp-generalstore/index.ts` | 4 | `ContentTypeMarkdown` | `@xmtp/content-type-markdown` |
| 3 | `examples/xmtp-generalstore/index.ts` | 5 | `MarkdownCodec` | `@xmtp/content-type-markdown` |
| 4 | `examples/xmtp-thinking-reaction/index.ts` | 8 | `ContentTypeReaction` | `@xmtp/content-type-reaction` |
| 5 | `examples/xmtp-thinking-reaction/index.ts` | 9 | `ReactionCodec` | `@xmtp/content-type-reaction` |
| 6 | `examples/xmtp-thinking-reaction/index.ts` | 10 | `Reaction` (type) | `@xmtp/content-type-reaction` |
| 7 | `examples/xmtp-transactions/index.ts` | 4 | `ContentTypeWalletSendCalls` | `@xmtp/content-type-wallet-send-calls` |
| 8 | `utils/transactions.ts` | 2 | `WalletSendCallsParams` (type) | `@xmtp/content-type-wallet-send-calls` |
| 9 | `utils/inline-actions/types/ActionsContent.ts` | 3 | `ContentCodec` | `@xmtp/content-type-primitives` |
| 10 | `utils/inline-actions/types/ActionsContent.ts` | 11 | `ContentTypeId` (value) | `@xmtp/content-type-primitives` |
| 11 | `utils/inline-actions/types/IntentContent.ts` | 3 | `ContentCodec` | `@xmtp/content-type-primitives` |
| 12 | `utils/inline-actions/types/IntentContent.ts` | 11 | `ContentTypeId` (value) | `@xmtp/content-type-primitives` |
| 13 | `examples/xmtp-welcome-message/index.ts` | 69 | Type incompatibility | Keep `@xmtp/content-type-primitives` |

---

## Error Categories

### Content Type Constants (4 errors: #1, #2, #4, #7)
Content type constants not exported from SDK.

### Codecs (2 errors: #3, #5)
Codecs not exported from SDK.

### Types (2 errors: #6, #8)
Type definitions not exported from SDK.

### Primitives (4 errors: #9, #10, #11, #12)
`ContentCodec` and `ContentTypeId` not exported. SDK exports `ContentTypeId` as type-only, not as value.

### Type Incompatibility (1 error: #13)
Custom codecs use `ContentTypeId` from `@xmtp/content-type-primitives` (has `sameAs`), but SDK expects `ContentTypeId` from `@xmtp/node-bindings` (missing `sameAs`).

---

## Quick Reference: Workarounds

```typescript
// Content Type Constants
import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import { ContentTypeMarkdown } from "@xmtp/content-type-markdown";
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
import { ContentTypeWalletSendCalls } from "@xmtp/content-type-wallet-send-calls";

// Codecs
import { MarkdownCodec } from "@xmtp/content-type-markdown";
import { ReactionCodec } from "@xmtp/content-type-reaction";

// Types
import type { Reaction } from "@xmtp/content-type-reaction";
import type { WalletSendCallsParams } from "@xmtp/content-type-wallet-send-calls";

// Primitives (for custom codecs)
import { ContentTypeId } from "@xmtp/content-type-primitives";
import type { ContentCodec, EncodedContent } from "@xmtp/content-type-primitives";
```

---

## Future Fix (PR #1644)

Content types will come from `@xmtp/node-sdk` as functions:

```typescript
// Old (2.0.0-rc1):
import { ContentTypeReaction } from "@xmtp/content-type-reaction";
message.contentType?.sameAs(ContentTypeReaction)

// New (after PR #1644):
import { contentTypeReaction, contentTypesAreEqual } from "@xmtp/node-sdk";
contentTypesAreEqual(message.contentType, contentTypeReaction())
```

**Solution**: Keep content type packages until SDK version with PR #1644 is released.

---

*Last updated: 2026-01-21 | SDK Version: 2.0.0-rc1*
