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

Every block ships with a skeleton, passes axe at AA, and works at 390px.

| Name | What it is |
|---|---|
| `tokens` | Semantic `success` / `warning` / `info` colour tokens (theme item) |
| `app-shell` | Sidebar with nested groups, header slots, breadcrumbs, user menu, theme toggle |
| `command-palette` | ⌘K dialog with grouped commands, keywords, shortcuts |
| `notifications` | Bell with unread indicator, All/Unread tabs, mark as read |
| `workspace-switcher` | Team/workspace dropdown for the sidebar header |
| `theme-customizer` | Colour presets, radius and mode; persisted per browser |
| `page-header` | Title, description, actions slot |
| `empty-state` | Icon, message, primary action |
| `stat-card` | KPI with icon, delta, line or bar sparkline |
| `chart-card` | Recharts wrapper with range toggle and actions slot |
| `donut-chart` | Donut with centre total and legend |
| `progress-list` | Ranked list with proportional bars and deltas |
| `highlight-card` | Hero card for a headline metric |
| `rating-breakdown` | Average stars with per-star distribution |
| `data-table` | TanStack Table v9: search, faceted filters, sort menu, row actions, bulk bar, CSV export, page size |
| `kanban-board` | dnd-kit columns: WIP limits, add card, column actions, touch and keyboard drag, announcements |
| `message-list` | Composable `Message*` primitives plus a grouped list with hover actions |
| `composer` | Chat input with status-aware submit/stop, attachments, auto-resize |
| `tool-call-card` | Collapsible tool call; accepts AI SDK tool states |
| `auth-layout`, `auth-forms`, `auth-pages` | Two-column auth shell; login, signup, forgot password; ready routes |
| `error-page` | 404 / 500 / maintenance state |

## Templates

| Name | Pages | Install |
|---|---|---|
| `dashboard` | Overview, Analytics, Customers, Orders, Settings | `npx shadcn@latest add @kit/dashboard` |
| `crm` | Overview, Contacts (+detail), Companies (+detail), Deals board/list, Tasks | `npx shadcn@latest add @kit/crm` |
| `chat` | Three-pane chat, new conversation/group dialogs, Contacts, Settings | `npx shadcn@latest add @kit/chat` |
| `agent` | Agent workspace with tool calls, Agents (+builder), Runs (+trace), Usage, API keys | `npx shadcn@latest add @kit/agent` |

Templates install pages under `app/<template>/`, components under
`components/<template>/`, and typed mock data under `lib/<template>/`. Replace
the functions in `lib/<template>/queries.ts` with real data access and the UI
keeps working. All templates are responsive (sidebar becomes a sheet on
phones, tables scroll inside their cards, boards support touch drag) and
support dark mode.

## Develop

    pnpm install
    pnpm dev              # gallery + block demos at http://localhost:3000
    pnpm test             # unit tests
    pnpm registry:check   # validate registry.json against the filesystem
    pnpm registry:build   # emit public/r/*.json
    pnpm smoke            # install every item into a throwaway Next.js app and build it
    pnpm qa               # axe (AA) + horizontal-overflow check on every route at 1400px and 390px
    pnpm qa:shots         # same, plus regenerate public/screenshots/*.png for the gallery

`pnpm qa` needs a running server (`pnpm dev` or `pnpm start`) and Chromium
(`pnpm playwright:install` once). CI runs it against a production build.

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
