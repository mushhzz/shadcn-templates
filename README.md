# shadcn-templates

Application templates and reusable blocks for shadcn/ui, distributed as a
shadcn registry. One Next.js app is the registry source, the live preview,
and the static host for the built JSON.

## Use in a project

Fresh project:

    npx shadcn@latest init -t next

Add the registry to `components.json`:

    "registries": { "@kit": "https://shadcn-templates.vercel.app/r/{name}.json" }

Install a block or a template:

    npx shadcn@latest add @kit/app-shell
    npx shadcn@latest add @kit/dashboard

## Blocks

| Name | What it is |
|---|---|
| `page-header` | Title, description, actions slot |
| `empty-state` | Icon, message, primary action |
| `stat-card` | KPI with delta and sparkline |
| `chart-card` | Recharts wrapper with time-range tabs |
| `app-shell` | Sidebar + header + breadcrumbs + user menu + theme toggle |
| `theme-provider` | next-themes provider with a toggle hotkey |
| `data-table` | TanStack Table v9: sort, paginate, select, hide columns |
| `kanban-board` | dnd-kit columns and draggable cards |
| `message-list` | Grouped chat bubbles with read receipts |
| `composer` | Chat input, Enter to send |
| `tool-call-card` | Collapsible agent tool call with input/output |

Templates (`dashboard`, `chat`, `crm`, `agent`) are in progress.

## Develop

    pnpm install
    pnpm dev              # gallery + block demos at http://localhost:3000
    pnpm test             # unit tests
    pnpm registry:check   # validate registry.json against the filesystem
    pnpm registry:build   # emit public/r/*.json
    pnpm smoke            # install every item into a throwaway Next.js app and build it

## Layout

- `registry.json` — every installable item
- `components/blocks/` — shared block source (one file per block)
- `components/ui/` — shadcn primitives, CLI-managed
- `app/(site)/` — gallery and block demos
- `scripts/` — registry checker and smoke test

## Adding a block

1. `components/blocks/<name>.tsx`, with `"use client"` if it has state or handlers.
2. Test in `components/blocks/__tests__/<name>.test.tsx`.
3. Demo in `app/(site)/blocks/_demos/<name>-demo.tsx`, registered in `app/(site)/blocks/page.tsx`.
4. Item in `registry.json` with `dependencies` (npm) and `registryDependencies` (shadcn names or `@kit/<name>`).
5. `pnpm registry:check && pnpm smoke`.
