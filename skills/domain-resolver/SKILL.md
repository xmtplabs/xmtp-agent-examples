---
name: domain-resolver
description: ENS and Web3 identity resolution for XMTP agents. Use when resolving domain names, extracting mentions, or fetching Farcaster profiles. Triggers on ENS resolution, Farcaster lookup, or mention extraction.
license: MIT
metadata:
  author: xmtp
  version: "1.0.0"
---

# XMTP domain resolver

Resolve Web3 identities including ENS, Farcaster, Basenames, and Lens Protocol.

## When to apply

Reference these guidelines when:
- Resolving ENS names to addresses
- Extracting @mentions from messages
- Fetching Farcaster profiles
- Working with shortened addresses in groups

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Resolve | HIGH | `resolve-` |
| 2 | Extract | HIGH | `extract-` |
| 3 | Profiles | MEDIUM | `profiles-` |

## Quick reference

### Resolve (HIGH)
- `resolve-address` - Resolve domain names to addresses
- `resolve-mentions` - Resolve all mentions in a message

### Extract (HIGH)
- `extract-mentions` - Extract @mentions from text

### Profiles (MEDIUM)
- `profiles-farcaster` - Fetch Farcaster profile data

## Supported platforms

- **ENS** - `vitalik.eth`
- **Farcaster** - `dwr.eth`, `username.farcaster.eth`
- **Basenames** - `tony.base.eth`
- **Lens Protocol** - `stani.lens`

## Quick start

```typescript
import { createNameResolver } from "@xmtp/agent-sdk/user";
import { resolveMentionsInMessage, fetchFarcasterProfile } from "../../utils/resolver";

// Resolve a single name
const resolver = createNameResolver(process.env.WEB3_BIO_API_KEY || "");
const address = await resolver("vitalik.eth");

// Resolve all mentions in a message
const resolved = await resolveMentionsInMessage(
  ctx.message.content,
  await ctx.conversation.members()
);
// Returns: { "bankr.eth": "0x...", "@fabri": "0x..." }

// Get Farcaster profile
const profile = await fetchFarcasterProfile("dwr.eth");
console.log(profile.username, profile.fid);
```

## How to use

Read individual rule files for detailed explanations:

```
rules/resolve-address.md
rules/extract-mentions.md
rules/profiles-farcaster.md
```

## Related examples

- [xmtp-domain-resolver](../../examples/xmtp-domain-resolver/) - Full domain resolution example
