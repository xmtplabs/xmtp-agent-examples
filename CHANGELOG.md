# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Update agent SDK to 2.0.0-rc3 (2026-01-23)
- Centralize agent-sdk version across all example packages
- Fix EncryptedAttachment API usage (payload instead of content.payload)
- Update group creation to use agent.createGroupWithAddresses
- Fix Reaction API to use ReactionSchema enum
- Fix ActionStyle imports to use SDK enum

### Fixed
- Fix build errors in xmtp-attachments, xmtp-gated-group, xmtp-thinking-reaction, xmtp-generalstore
- Fix type incompatibilities with SDK 2.0.0-rc3
- Prevent reaction middleware from looping on read receipts / non-text messages
- Remove unsafe `any` casts in examples and inline actions helpers

## [0.0.4] - 2026-01-21

### Changed
- Update agent SDK to 2.0.0-rc1
- Remove content type packages and test SDK compatibility
- Update imports to use SDK instead of separate content type packages

### Added
- Add SDK 2.0.0-rc1 test report
- Add content types removal error documentation

## [2025-12-19]

### Changed
- Update readme + cursor rules (#351)

## [2025-12-13]

### Added
- Add @xmtp/cli to dependencies

### Changed
- Set hoisting limit to workspaces
- Update agent-sdk version
- Update remote attachment pkg

## [2025-11-24]

### Changed
- Refactor scripts to use cli utils (#345)
- Update key generation command
- Add .env file in workflow
- Refactor to support unknown types
- Update agent-sdk version
- Update key generation script
- Rename cli to debug mode

### Added
- General Store Bot (#343)

## [2025-11-22]

### Changed
- Remove unused imports
- Add fs and path imports
- Remove unused fs import
- Added fs module import
- Refactor dbPath function
- Update dbPath in Agent config
- Refactor main function to top level
- Enhance env var parsing & validation

### Added
- Add token transfer functionality
- Refactor token and network config
- Refactor USDC transaction utils
- Refactor USDC handler to functions
- Update agent-sdk version
- Remove unused packages
- Update XMTP Agent SDK version

## [2025-11-21]

### Changed
- Update hackathon prize info
- Update README example link
- Refactor prize info markdown
- Add markdown support to agent
- Add navigation options
- Add new products to store
- Update comment in index.ts
- Add comment to loadEnvFile
- Simplify text message handling
- Remove dbPath from Agent setup
- Remove duplicate sendActions call
- Refactor xmtp agent imports
- Refactor product browsing code

### Added
- Add hackathon info message
- Add General Store Bot feature

## [2025-11-10]

### Added
- Add Coinbase Wallet compatibility (#342)
