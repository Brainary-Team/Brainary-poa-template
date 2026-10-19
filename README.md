# Brainary PoA Template

This repository is a TypeScript-first starter for Brainary PoA projects. It also accepts a
JavaScript entry point when `src/main.ts` is replaced with `src/main.js`. It produces a JavaScript
entry point and a `.poa` package without requiring the Brainary binary during development.

## Requirements

- Node.js 22 or newer
- pnpm 12

## Workflow

```bash
pnpm install
pnpm test
pnpm package
```

`pnpm package` builds `src/main.ts`, validates `manifest.toml`, collects the optional
`input_schema.json` and `mcp/` files, and writes `dist/my-poa.poa`.

The package manifest uses the current PoA contract:

```toml
runtime = "codex-v8"
poa_api_version = 1
entry = "main.js"
```

The PoA identity (`namespace`, `name`, and `version`) belongs to the project author. Runtime and
API version values are fixed by the template and checked by the packaging script.

## Project layout

```text
src/main.ts           PoA entry point
input_schema.json     optional hand-written input schema
agents/               agent implementations
prompts/              prompt resources
memory/               reserved runtime memory adapter directory
tools/                tool adapters
mcp/                  optional stdio MCP files shipped in the package
tests/                Vitest tests
scripts/package.mjs   fflate-based .poa packager
dist/                 generated build and package output
```

The `mcp/` directory is optional. If a project needs an MCP server, add the server using the MCP
SDK and declare its command in `manifest.toml`. The first version supports `stdio` MCP servers.

## Commands

```bash
pnpm lint       # Biome checks
pnpm format     # Biome formatting
pnpm typecheck  # TypeScript checks
pnpm test       # Vitest
pnpm build      # dist/main.js
pnpm package    # dist/my-poa.poa
```
