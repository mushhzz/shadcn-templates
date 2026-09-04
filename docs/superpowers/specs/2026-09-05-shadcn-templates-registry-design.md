# shadcn Templates Registry — Design

Date: 2026-09-05
Status: approved

## Goal

Build our own equivalent of shadcnuikit.com's templates: full application
skeletons (admin dashboard, chat app, CRM, AI agent platform) built on
shadcn/ui, distributed as a **shadcn registry** so a new or existing Next.js
project can install one with a single `npx shadcn add` command.

## Non-goals (v1)

- No authentication, database, or real API wiring. Fixtures only.
- No paid/licensed tiers, no accounts on the gallery site.
- No Base UI variant; Radix primitives only.
- No Storybook.
- No eject/copy script; distribution is the registry.

## Repository shape

One Next.js 16 / React 19 / Tailwind v4 app, TypeScript strict, shadcn
`new-york` style, `neutral` base colour, standard shadcn aliases
(`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Deployed to Vercel.
It plays three roles: registry source, live preview of every template, and
static host for the built registry JSON.

```
shadcn-templates/
├── registry.json              # source of truth for every registry item
├── registry/
│   ├── blocks/                # shared composed pieces (one folder per block)
│   ├── dashboard/             # template: pages/, components/, data/
│   ├── chat/
│   ├── crm/
│   └── agent/
├── components/ui/             # shadcn primitives (CLI-managed), used by preview
├── app/
│   ├── (site)/                # gallery: template cards, install command, block demos
│   └── (preview)/             # mounts each template's pages for live demo
├── lib/                       # utils, preview-only helpers
├── scripts/                   # registry integrity check, install smoke test
└── public/r/                  # `shadcn build` output
```

Registry source files must import via the standard aliases
(`@/components/ui/...`, `@/registry/...`, `@/lib/utils`) so the shadcn CLI
can rewrite them to the consumer's configured aliases on install.

## Registry item graph

- **Blocks** are `registry:block` items containing `registry:component`
  files (and `registry:hook` / `registry:lib` where needed). They depend on
  built-in shadcn primitives by name (`"button"`, `"sidebar"`) and on each
  other by URL.
- **Templates** are `registry:block` items containing `registry:page` files
  (with `target` under `app/<template>/...`), template-specific
  `registry:component` files, and `registry:lib` fixture files. They depend on
  primitives by name and on blocks by URL.
- The registry exposes a namespace: consumers add
  `"registries": { "@kit": "https://<host>/r/{name}.json" }` to
  `components.json`.

### Consumer flow

Fresh project:

```bash
npx shadcn@latest init -t next
# add the @kit registry to components.json
npx shadcn@latest add @kit/chat
```

Existing project: skip `init`. Individual blocks install the same way
(`npx shadcn add @kit/app-shell`).

## Shared blocks

Rules: a block never imports from a template folder; blocks receive data via
props and never read fixtures; every block has a demo on the gallery's
blocks page that doubles as usage docs.

| Block | Contents | Used by |
|---|---|---|
| `app-shell` | Collapsible sidebar (shadcn `sidebar`), header with breadcrumbs, search trigger, user menu, theme toggle. Takes a nav config array. | all |
| `page-header` | Title, description, actions slot. | all |
| `stat-card` | Label, value, delta with up/down colouring, optional sparkline. | dashboard, crm, agent |
| `chart-card` | Card around shadcn `chart` (Recharts): title, time-range tabs, legend. | dashboard, crm, agent |
| `data-table` | TanStack Table wrapper: sorting, pagination, column visibility, row selection, toolbar slot. | dashboard, crm, agent |
| `empty-state` | Icon, message, primary action. | all |
| `kanban-board` | Columns + draggable cards (dnd-kit). | crm |
| `message-list` | Grouped bubbles, timestamps, read receipts. | chat, agent |
| `composer` | Textarea with attachment and emoji triggers, submit. | chat, agent |
| `tool-call-card` | Collapsible tool input/output card with status; renders inside `message-list`. | agent |

## Templates and screens

Each template ships a `layout.tsx` mounting `app-shell` with its own nav
config. Pages are server components where they only render fixtures; client
components only where there is interaction.

### Dashboard — `app/dashboard/`
- Overview: 4 stat cards, revenue chart, recent orders table, activity feed.
- Analytics: multiple chart cards with time-range tabs.
- Customers, Orders: data tables with filters and a detail sheet.
- Settings: profile, team, notifications, billing tabs (forms).

### Chat — `app/chat/`
- Conversations: three-pane layout (conversation list, thread, contact panel
  that collapses on narrow widths).
- New conversation and group creation dialogs.
- Contacts: search and status.
- Settings: profile and notifications.

### CRM — `app/crm/`
- Overview: pipeline value stats, deals-by-stage chart, recent activity.
- Contacts, Companies: data tables with detail pages (timeline, notes, linked deals).
- Deals: kanban pipeline with list-view toggle and deal detail sheet.
- Tasks: table grouped by due date.

### Agent — `app/agent/`
- Workspace: conversation sidebar, thread rendering text, tool-call cards
  (collapsible input/output) and step status, composer with model picker.
- Agents: list page and builder form (name, system prompt, model, tools
  multi-select, knowledge sources).
- Runs: table of runs; run detail with step timeline, token counts, latency,
  log viewer.
- Usage: charts for tokens, cost, latency per agent and per model; API keys
  page with create/revoke dialogs.

## Mock data conventions

- Lives in `registry/<template>/data/`, shipped as `registry:lib` files
  (install into consumer `lib/`).
- Per template: `types.ts` (domain types), one fixture file per entity
  exporting a typed array, `queries.ts` exposing functions
  (`getDeals()`, `getRunById(id)`). Pages call query functions only.
- Hand-written, deterministic fixtures committed to the repo. No runtime
  faker. Enough rows for pagination; enough variety to show every state.
- Timestamps stored relative to a fixed anchor and shifted to "now" at read
  time so relative labels stay sensible.
- Avatars are inline SVG initials via a shared helper. No external URLs.

## Testing and verification

- **Unit (Vitest + Testing Library)** on blocks: render with props, empty
  states, data-table sort/pagination, kanban reorder logic.
- **Registry integrity script**: every file in `registry.json` exists, every
  `registryDependencies` entry resolves, no block imports a template folder.
- **Install smoke test (CI)**: `shadcn build`, scaffold a throwaway Next.js
  app, install all templates and blocks from the built JSON, run
  `next build` and `tsc --noEmit`.
- **Preview app**: `next build` and lint as normal CI steps.

## Open decisions deferred to implementation

- Hostname for the registry (Vercel default domain until a custom one is chosen).
- Whether `public/r/` is committed or generated on deploy (default: generated
  in the Vercel build step, ignored in git).
