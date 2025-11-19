# NFT Marketplace

Full-stack Solana NFT marketplace template that combines a Next.js 15 frontend, a Gill-based client stack, and an Anchor
program that manages escrowed token-for-token trades. The repository ships with wallet-ready UI components, Codama SDK
generation, and local test-ledger snapshots so you can iterate quickly before deploying to Devnet or Mainnet.

## Features

- **Modern web stack** – Next.js 15, React 19, Tailwind, and the Wallet UI component library with Gill bindings.
- **Anchor 0.32 program** – `anchor/programs/nftmarketplace` implements offer creation, SOL/token swaps, and refunds.
- **Generated client code** – Codama scripts keep the TypeScript client in sync with the on-chain interface.
- **Local validator assets** – `test-ledger/` snapshots plus Anchor LiteSVM helpers for rapid integration tests.
- **Developer tooling** – ESLint, Prettier, Vitest config, and convenient npm scripts for every workflow.

## Repository Layout

| Path | Description |
| --- | --- |
| `src/` | Next.js application, UI components, React Query providers, and feature modules. |
| `anchor/` | Anchor workspace containing the Rust program, tests, Codama config, and validator helpers. |
| `anchor/programs/nftmarketplace/` | On-chain program logic, handlers, accounts, and integration helpers. |
| `anchor/tests/` | Typescript integration tests targeting the deployed Anchor program. |
| `test-ledger/` | Local validator state, snapshots, and keypairs (ignored from git). |
| `public/` | Static assets for the web client. |
| `package.json` | Workspace-level scripts for both the web and Anchor projects. |

## Prerequisites

- Node.js ≥ 18 and npm (or your preferred package manager).
- Rust toolchain (`rustup`), the Solana CLI (2.x), and the Anchor CLI (0.32.x).
- Git and a modern shell (bash/zsh) for the provided scripts.

## Quick Start

```bash
git clone https://github.com/<your-account>/NFT-Marketplace.git
cd NFT-Marketplace
npm install
```

Copy any required environment variables (RPC URLs, API keys, etc.) into a `.env.local` file before running the apps.

## Anchor Program Workflow

| Command | Description |
| --- | --- |
| `npm run setup` | Generates a new program keypair, syncs `declare_id!`, builds the program, and refreshes the Codama client. |
| `npm run anchor-build` | Builds the Anchor program and IDL inside the `anchor` directory. |
| `npm run anchor-test` | Runs the Rust tests (optionally gated by `ANCHOR_FEATURES=integration-tests`). |
| `npm run anchor-localnet` | Boots a local validator with the program deployed for manual testing. |
| `npm run anchor deploy --provider.cluster devnet` | Deploys the program to Devnet. |

All commands run from the repo root and simply wrap the underlying `anchor` CLI invocation.

## Web App Workflow

```bash
npm run dev          # Start Next.js with Turbopack
npm run build        # Create a production bundle
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

The UI exposes wallet controls, cluster selection, and marketplace actions that talk to the Anchor program via the Gill
client and Codama-generated bindings. Update `src/features` modules if you want to extend the UX.

## Generated Client Code

Whenever you touch the Anchor accounts or instructions, regenerate the TypeScript SDK so the web app stays in sync:

```bash
npm run codama:js
```

This script reads `anchor/codama.js` and writes fresh exports into `anchor/src/nftmarketplace-exports.ts` and the web
client package.

## Local Validator Data

The `test-ledger/` directory (both at the workspace root and inside `anchor/`) stores RocksDB state, snapshots, and
keypairs that should never be committed. These files enable reproducible local clusters and LiteSVM-based integration
tests. If you need a clean slate, remove the directory and re-run `anchor localnet` or `anchor test`.

## Troubleshooting

- Ensure the Solana CLI, Anchor CLI, and Rust toolchain versions listed above are installed — version mismatches are the
	most common source of build failures.
- When running integration tests, set `ANCHOR_FEATURES=integration-tests` so the helper modules are compiled.
- Run `cargo install --git https://github.com/anza-xyz/agave.git anchor-cli --locked` if you need to reinstall Anchor
	for the Agave toolchain.

## License

This project started from the Solana Foundation Gill template. Customize it freely for your own marketplace deployments.
