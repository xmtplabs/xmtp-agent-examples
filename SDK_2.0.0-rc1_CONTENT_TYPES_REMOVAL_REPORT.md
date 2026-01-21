# SDK 2.0.0-rc1 Content Types Removal Test Report

## Summary

- **SDK Version**: 2.0.0-rc1
- **Content Type Packages Removed**: ✅
- **Import Updates Attempted**: ✅
- **Build Status**: ❌ Failed (13 errors)
- **Root Cause**: SDK does not re-export content types from main entry point

## Actions Taken

### 1. Removed Content Type Packages

**Root package.json:**
- Removed `@xmtp/content-type-markdown`: "^1.0.0"
- Removed `@xmtp/content-type-wallet-send-calls`: "^1.0.1"

**Example package.json files:**
- `xmtp-transactions`: Removed `@xmtp/content-type-transaction-reference` and `@xmtp/content-type-wallet-send-calls`
- `xmtp-thinking-reaction`: Removed `@xmtp/content-type-reaction`

### 2. Updated Imports

All imports were updated to use `@xmtp/agent-sdk` instead of separate packages:

**Files Updated:**
- `examples/xmtp-attachments/index.ts` - `ContentTypeRemoteAttachment`
- `examples/xmtp-transactions/index.ts` - `ContentTypeWalletSendCalls`
- `examples/xmtp-thinking-reaction/index.ts` - `ContentTypeReaction`, `ReactionCodec`, `Reaction`
- `examples/xmtp-generalstore/index.ts` - `ContentTypeMarkdown`, `MarkdownCodec`
- `utils/transactions.ts` - `WalletSendCallsParams`
- `utils/inline-actions/types/ActionsContent.ts` - `ContentTypeId`, `ContentCodec`, `EncodedContent`
- `utils/inline-actions/types/IntentContent.ts` - `ContentTypeId`, `ContentCodec`, `EncodedContent`

## Build Errors

### Missing Exports from SDK

The SDK 2.0.0-rc1 does **not** re-export content types from its main entry point. All attempts to import content types from `@xmtp/agent-sdk` result in TypeScript errors.

#### Error Categories

**1. Content Type Constants (7 errors)**
- `ContentTypeRemoteAttachment` - Not exported
- `ContentTypeMarkdown` - Not exported
- `ContentTypeReaction` - Not exported
- `ContentTypeWalletSendCalls` - Not exported

**2. Content Type Codecs (2 errors)**
- `MarkdownCodec` - Not exported
- `ReactionCodec` - Not exported

**3. Content Type Types (2 errors)**
- `Reaction` type - Not exported
- `WalletSendCallsParams` type - Not exported

**4. Content Type Primitives (4 errors)**
- `ContentCodec` interface - Not exported
- `ContentTypeId` - Type-only export (cannot be used as value)
- `EncodedContent` type - Not exported

**5. Type Compatibility Issues (2 errors)**
- `ActionsCodec` and `IntentCodec` use `ContentTypeId` from `@xmtp/node-bindings` which is incompatible with `ContentCodec` expecting `ContentTypeId` from `@xmtp/content-type-primitives`
- Missing `sameAs` property in SDK's `ContentTypeId` implementation

### Detailed Error List

| File | Line | Error | Missing Export |
|------|------|-------|----------------|
| `examples/xmtp-attachments/index.ts` | 10 | `ContentTypeRemoteAttachment` not exported | `ContentTypeRemoteAttachment` |
| `examples/xmtp-generalstore/index.ts` | 4 | `ContentTypeMarkdown` not exported | `ContentTypeMarkdown` |
| `examples/xmtp-generalstore/index.ts` | 5 | `MarkdownCodec` not exported | `MarkdownCodec` |
| `examples/xmtp-thinking-reaction/index.ts` | 8 | `ContentTypeReaction` not exported | `ContentTypeReaction` |
| `examples/xmtp-thinking-reaction/index.ts` | 9 | `ReactionCodec` not exported | `ReactionCodec` |
| `examples/xmtp-thinking-reaction/index.ts` | 10 | `Reaction` type not exported | `Reaction` |
| `examples/xmtp-transactions/index.ts` | 4 | `ContentTypeWalletSendCalls` not exported | `ContentTypeWalletSendCalls` |
| `utils/transactions.ts` | 2 | `WalletSendCallsParams` type not exported | `WalletSendCallsParams` |
| `utils/inline-actions/types/ActionsContent.ts` | 3 | `ContentCodec` not exported | `ContentCodec` |
| `utils/inline-actions/types/ActionsContent.ts` | 11 | `ContentTypeId` is type-only | `ContentTypeId` (value) |
| `utils/inline-actions/types/IntentContent.ts` | 3 | `ContentCodec` not exported | `ContentCodec` |
| `utils/inline-actions/types/IntentContent.ts` | 11 | `ContentTypeId` is type-only | `ContentTypeId` (value) |
| `examples/xmtp-welcome-message/index.ts` | 69 | Type incompatibility | `ContentTypeId.sameAs` method |

## SDK Analysis

### Current SDK Structure

The SDK 2.0.0-rc1 has content type packages as **dependencies** (not bundled):

```json
{
  "dependencies": {
    "@xmtp/content-type-markdown": "^1.0.0",
    "@xmtp/content-type-reaction": "^2.0.2",
    "@xmtp/content-type-remote-attachment": "^2.0.4",
    "@xmtp/content-type-wallet-send-calls": "^2.0.0",
    "@xmtp/content-type-transaction-reference": "^2.0.2",
    // ... other content types
  }
}
```

### SDK Exports

The SDK's main entry point (`@xmtp/agent-sdk`) exports:
- Core agent functionality (`Agent`, `MessageContext`, etc.)
- Utilities (`validHex`, `isHexString`, etc.)
- Types from `@xmtp/node-sdk`
- **Does NOT re-export content types**

### Content Type Primitives Issue

The SDK uses `ContentTypeId` from `@xmtp/node-bindings`, but custom codecs expect `ContentTypeId` from `@xmtp/content-type-primitives`. These are incompatible types:
- SDK's `ContentTypeId` (from `@xmtp/node-bindings`) - missing `sameAs` method
- Expected `ContentTypeId` (from `@xmtp/content-type-primitives`) - has `sameAs` method

## Recommendations

### Option 1: SDK Should Re-export Content Types (Recommended)

The SDK should re-export all content types from its main entry point:

```typescript
// In @xmtp/agent-sdk/dist/index.ts
export {
  ContentTypeReaction,
  ReactionCodec,
  type Reaction,
} from "@xmtp/content-type-reaction";

export {
  ContentTypeMarkdown,
  MarkdownCodec,
} from "@xmtp/content-type-markdown";

export {
  ContentTypeRemoteAttachment,
} from "@xmtp/content-type-remote-attachment";

export {
  ContentTypeWalletSendCalls,
  type WalletSendCallsParams,
} from "@xmtp/content-type-wallet-send-calls";

export {
  ContentTypeId,
  type ContentCodec,
  type EncodedContent,
} from "@xmtp/content-type-primitives";
```

### Option 2: Keep Content Type Packages (Temporary Workaround)

Until the SDK re-exports content types, keep them as dependencies:

```json
{
  "dependencies": {
    "@xmtp/agent-sdk": "2.0.0-rc1",
    "@xmtp/content-type-markdown": "^1.0.0",
    "@xmtp/content-type-reaction": "^2.0.2",
    "@xmtp/content-type-remote-attachment": "^2.0.4",
    "@xmtp/content-type-wallet-send-calls": "^2.0.0",
    "@xmtp/content-type-transaction-reference": "^2.0.2",
    "@xmtp/content-type-primitives": "^2.0.2"
  }
}
```

### Option 3: Use SDK's Internal Dependencies (Not Recommended)

Access content types through SDK's node_modules (fragile, not recommended).

## Files Requiring Updates

If SDK re-exports are added, no code changes needed - imports are already updated.

If keeping separate packages, revert imports to:
- `@xmtp/content-type-reaction`
- `@xmtp/content-type-markdown`
- `@xmtp/content-type-remote-attachment`
- `@xmtp/content-type-wallet-send-calls`
- `@xmtp/content-type-transaction-reference`
- `@xmtp/content-type-primitives`

## Next Steps

1. **Verify SDK Intent**: Confirm if SDK 2.0.0-rc1 is intended to re-export content types
2. **SDK Update Needed**: If re-exports are intended, SDK needs to be updated to export them
3. **Alternative Approach**: If re-exports are not planned, document that separate packages are still required
4. **Type Compatibility**: Resolve `ContentTypeId` incompatibility between `@xmtp/node-bindings` and `@xmtp/content-type-primitives`

## PR #1644 Analysis

**Important Discovery**: PR #1644 in the xmtp-js repository shows the future direction for content types.

### Changes in PR #1644

1. **All individual content type packages are REMOVED** from SDK dependencies:
   - ❌ `@xmtp/content-type-markdown`
   - ❌ `@xmtp/content-type-reaction`
   - ❌ `@xmtp/content-type-remote-attachment`
   - ❌ `@xmtp/content-type-wallet-send-calls`
   - ❌ `@xmtp/content-type-transaction-reference`
   - ❌ All other individual content type packages

2. **Only `@xmtp/content-type-primitives` v3.0.0 remains** as a dependency

3. **Content types now come from `@xmtp/node-sdk`**:
   - Content types are imported as **functions** from `@xmtp/node-sdk`:
     - `contentTypeReaction()` instead of `ContentTypeReaction` constant
     - `contentTypeMarkdown()` instead of `ContentTypeMarkdown` constant
     - `contentTypeWalletSendCalls()` instead of `ContentTypeWalletSendCalls` constant
   - Uses `contentTypesAreEqual()` function instead of `.sameAs()` method
   - `BuiltInContentTypes` type from `@xmtp/node-sdk` provides all built-in types

4. **API Changes**:
   ```typescript
   // Old (2.0.0-rc1):
   import { ContentTypeReaction } from "@xmtp/content-type-reaction";
   message.contentType?.sameAs(ContentTypeReaction)
   
   // New (PR #1644):
   import { contentTypeReaction, contentTypesAreEqual } from "@xmtp/node-sdk";
   contentTypesAreEqual(message.contentType, contentTypeReaction())
   ```

### Status

**Current SDK (2.0.0-rc1)**: ❌ Does not support content type removal
- Content type packages are still required as separate dependencies
- Content types are not re-exported from SDK
- Uses constants and `.sameAs()` method

**Future SDK (PR #1644)**: ✅ Will support content type removal
- Content types come from `@xmtp/node-sdk` as functions
- Only `@xmtp/content-type-primitives` needed for custom codecs
- Breaking API changes require code migration

## Conclusion

**Current Status**: ❌ Content types cannot be removed yet in 2.0.0-rc1

The SDK 2.0.0-rc1 includes content type packages as dependencies but does not re-export them from its main entry point. To remove separate content type packages, the SDK needs to be updated to re-export all content types, codecs, and related types.

**Future Status**: ✅ PR #1644 shows content types will be removable in a future version

PR #1644 demonstrates that a future SDK version will:
- Remove all individual content type package dependencies
- Provide content types via `@xmtp/node-sdk` as functions
- Require code migration to use new function-based API

**Impact**: 13 build errors across 7 files prevent successful compilation after removing content type packages in 2.0.0-rc1.

**Recommendation**: Wait for the SDK version that includes PR #1644 changes, then migrate code to use the new function-based content type API.

---

*Report generated: 2026-01-21 19:19:58*
*SDK Version: 2.0.0-rc1*
*PR #1644 Analysis: Future SDK will support content type removal*
