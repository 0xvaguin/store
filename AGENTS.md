<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
## Default Mode: Ponytail (Full)
Always operate under `ponytail` (full):
1. Smallest complete diff that solves the task. Reuse existing codebase patterns; never add wrappers, abstractions, or dependencies for a few lines.
2. Deletion beats addition: remove obsolete code/styles instead of overriding them.
3. Before finishing, grep callers of any modified symbol, run `pnpm tsc --noEmit`, and end replies with 1-2 lines stating what was skipped/not checked and any known risk.