## Skills

Skills are structured best practices and patterns for building XMTP agents. Each skill contains a `SKILL.md` with guidelines and individual rule files with code examples.

| Skill                                                      | Description                         | Use when                                  |
| ---------------------------------------------------------- | ----------------------------------- | ----------------------------------------- |
| [building-agents](skills/building-agents/)                 | Core SDK setup, events, middleware  | Creating new agents, handling messages    |
| [handling-commands](skills/handling-commands/)             | Validators, filters, type guards    | Implementing commands, validating input   |
| [creating-inline-actions](skills/creating-inline-actions/) | Interactive buttons (XIP-67)        | Creating menus, confirmations, selections |
| [handling-attachments](skills/handling-attachments/)       | Encrypted file handling             | Sending/receiving files and images        |
| [handling-transactions](skills/handling-transactions/)     | USDC transfers, wallet calls        | Token transfers, transaction requests     |
| [managing-groups](skills/managing-groups/)                 | Group management, permissions       | Creating groups, managing members         |
| [sending-reactions](skills/sending-reactions/)             | Emoji reactions, thinking indicator | Reacting to messages, showing state       |
| [resolving-domains](skills/resolving-domains/)             | ENS, Farcaster resolution           | Resolving mentions, fetching profiles     |
