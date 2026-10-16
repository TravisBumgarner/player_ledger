# Player Ledger

A desktop companion for a D&D character: session notes, character development, inventory, combat (modifiers and custom spells), NPCs, and homebrew tracking for tree grafting and potion brewing. Everything is stored locally in SQLite, with backup and restore.

## Develop

Node 24.

```bash
npm install
npm run dev
```

Opens the Electron app with hot reload, using its own dev database.

## Build

```bash
npm run dist:desktop
```

Outputs `packages/desktop/release/mac-arm64/Player Ledger.app`.
