# Foundation and Shared Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the shadcn registry project (Next.js app that is registry source, preview site, and JSON host) with all ten shared blocks installable via `npx shadcn add`, verified by an end-to-end install smoke test.

**Architecture:** One Next.js 16 app. Block source lives at `components/blocks/*.tsx` and is referenced by `registry.json`; `shadcn build` emits `public/r/*.json`. A `(site)` route group renders the gallery and block demos. Scripts validate registry integrity and install every built item into a throwaway Next.js app to prove the consumer flow. Templates (dashboard, chat, crm, agent) are separate follow-on plans that depend on the block interfaces fixed here.

**Tech Stack:** Next.js 16.3, React 19.2, Tailwind v4, shadcn CLI 4.x (Radix base), TanStack Table 9, dnd-kit (core 6, sortable 10), Recharts 3 via shadcn `chart`, next-themes, Vitest 5 + Testing Library + jsdom, tsx for scripts, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-05-shadcn-templates-registry-design.md`

## Global Constraints

- Package manager: pnpm. Node 22+.
- TypeScript `strict: true`. No `any` in block source.
- Registry source imports only via `@/components/ui/...`, `@/components/blocks/...`, `@/lib/utils`, `@/hooks/...`. Never relative imports that cross folders, never imports from a template folder.
- Blocks receive data via props. Blocks never import fixtures.
- Every block: one file `components/blocks/<name>.tsx`, one test `components/blocks/__tests__/<name>.test.tsx`, one demo `app/(site)/blocks/_demos/<name>-demo.tsx`, one `registry.json` item named `<name>`.
- Every block that uses React state, effects, or event handlers starts with `"use client"`.
- Radix primitives only (`-b radix`). Icon library: lucide-react.
- `public/r/` is build output and git-ignored.
- Commit after every task with a conventional-commit message.

**Deviation from spec, recorded here:** the spec put block source under `registry/blocks/`. The shadcn CLI rewrites imports by alias prefix, so source that lives at real alias paths (`components/blocks/`, `lib/`, `app/`) installs into the consumer at the same relative locations with zero import surprises. `registry/` is therefore not used; `registry.json` points at the real paths. Task 3 updates the spec.

---

## File Structure

```
shadcn-templates/
├── registry.json
├── components.json                       # written by shadcn init
├── components/
│   ├── ui/                               # shadcn primitives (CLI-managed)
│   └── blocks/
│       ├── page-header.tsx
│       ├── empty-state.tsx
│       ├── stat-card.tsx
│       ├── chart-card.tsx
│       ├── app-shell.tsx
│       ├── theme-provider.tsx
│       ├── data-table.tsx
│       ├── kanban-board.tsx
│       ├── message-list.tsx
│       ├── composer.tsx
│       ├── tool-call-card.tsx
│       └── __tests__/*.test.tsx
├── app/
│   ├── layout.tsx                        # root: fonts, ThemeProvider
│   ├── globals.css
│   └── (site)/
│       ├── layout.tsx                    # gallery chrome
│       ├── page.tsx                      # template cards + install command
│       └── blocks/
│           ├── page.tsx                  # lists every block demo
│           └── _demos/<name>-demo.tsx
├── lib/
│   ├── utils.ts                          # cn()
│   └── site.ts                           # registry namespace + host constants
├── scripts/
│   ├── check-registry.ts
│   ├── check-registry.test.ts
│   └── smoke-install.sh
├── vitest.config.ts
├── vitest.setup.ts
└── .github/workflows/ci.yml
```

---

### Task 1: Scaffold the Next.js + shadcn project

**Files:**
- Create: everything `npx shadcn init -t next` generates, merged into the existing repo
- Modify: `.gitignore`

**Interfaces:**
- Produces: `lib/utils.ts` exporting `cn(...inputs: ClassValue[]): string`; `components.json` with aliases `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils`.

- [ ] **Step 1: Generate the project in a sibling temp folder**

The repo already contains `.git` and `docs/`. The CLI creates a new directory, so generate beside it and merge.

```bash
cd /Users/jakeuren/dev/personal
npx shadcn@latest init -t next -b radix -y -n shadcn-templates-gen
```

If prompted for a preset, choose the default (Nova). If prompted for package manager, choose pnpm.

- [ ] **Step 2: Merge into the repo and remove the temp folder**

```bash
rsync -a --exclude .git shadcn-templates-gen/ shadcn-templates/
rm -rf shadcn-templates-gen
cd shadcn-templates
pnpm install
```

- [ ] **Step 3: Verify the generated config uses standard aliases**

Run: `cat components.json`
Expected: `aliases.components` is `@/components`, `aliases.ui` is `@/components/ui`, `aliases.utils` is `@/lib/utils`, `aliases.lib` is `@/lib`, `aliases.hooks` is `@/hooks`. If the CLI generated `src/` paths, re-run Step 1 answering "no" to a `src/` directory; this plan assumes no `src/`.

- [ ] **Step 4: Verify dev build works**

Run: `pnpm build`
Expected: succeeds, prints route table containing `/`.

- [ ] **Step 5: Ignore registry output**

Append to `.gitignore`:

```
# shadcn build output
/public/r/
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with shadcn (radix base)"
```

---

### Task 2: Test tooling (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `lib/__tests__/utils.test.ts`
- Modify: `package.json` (scripts, devDependencies)

**Interfaces:**
- Produces: `pnpm test` runs all `*.test.ts(x)` under jsdom with `@/` aliases resolved and `window.matchMedia` mocked.

- [ ] **Step 1: Install dev dependencies**

```bash
pnpm add -D vitest@^5 @vitejs/plugin-react@^6 jsdom@^30 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14 vite-tsconfig-paths@^5 tsx@^4
```

- [ ] **Step 2: Write the failing test**

`lib/__tests__/utils.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges tailwind classes and drops conflicts", () => {
    expect(cn("p-2", "p-4", false && "hidden")).toBe("p-4")
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run`
Expected: fails because no config exists (alias unresolved or "No test files found" / environment error).

- [ ] **Step 4: Add config and setup**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "public"],
  },
})
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// shadcn sidebar's useIsMobile and next-themes use matchMedia.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Recharts ResponsiveContainer reads ResizeObserver.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!("ResizeObserver" in window)) {
  Object.defineProperty(window, "ResizeObserver", { value: ResizeObserverMock })
}
```

Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: add vitest + testing-library setup"
```

---

### Task 3: Registry skeleton and integrity check

**Files:**
- Create: `registry.json`, `lib/site.ts`, `scripts/check-registry.ts`, `scripts/check-registry.test.ts`
- Modify: `package.json` (scripts), `docs/superpowers/specs/2026-09-05-shadcn-templates-registry-design.md`

**Interfaces:**
- Produces: `registry.json` root `{ $schema, name: "kit", homepage, items: [] }`; `checkRegistry(registry, opts): string[]` returning error strings (empty means valid); `pnpm registry:build` and `pnpm registry:check` scripts; `lib/site.ts` exporting `REGISTRY_NAMESPACE = "@kit"` and `REGISTRY_URL`.

- [ ] **Step 1: Create the empty registry and site constants**

`registry.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "kit",
  "homepage": "https://shadcn-templates.vercel.app",
  "items": []
}
```

`lib/site.ts`:

```ts
export const REGISTRY_NAMESPACE = "@kit"
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shadcn-templates.vercel.app"
export const REGISTRY_URL = `${SITE_URL}/r/{name}.json`

export function installCommand(itemName: string) {
  return `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${itemName}`
}
```

- [ ] **Step 2: Write the failing integrity test**

`scripts/check-registry.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { checkRegistry, type Registry } from "./check-registry"

const base: Registry = {
  name: "kit",
  homepage: "https://x",
  items: [],
}

const exists = (paths: string[]) => (p: string) => paths.includes(p)

describe("checkRegistry", () => {
  it("passes for an empty registry", () => {
    expect(checkRegistry(base, { fileExists: exists([]), readFile: () => "" })).toEqual([])
  })

  it("reports missing files", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "page-header",
          type: "registry:block",
          files: [{ path: "components/blocks/page-header.tsx", type: "registry:component" }],
        },
      ],
    }
    const errors = checkRegistry(reg, { fileExists: exists([]), readFile: () => "" })
    expect(errors).toContain("page-header: missing file components/blocks/page-header.tsx")
  })

  it("reports unresolved local registryDependencies", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "stat-card",
          type: "registry:block",
          registryDependencies: ["card", "@kit/sparkline"],
          files: [],
        },
      ],
    }
    const errors = checkRegistry(reg, { fileExists: exists([]), readFile: () => "" })
    expect(errors).toContain("stat-card: unresolved registryDependency @kit/sparkline")
  })

  it("accepts local registryDependencies that exist and built-in names", () => {
    const reg: Registry = {
      ...base,
      items: [
        { name: "a", type: "registry:block", files: [] },
        { name: "b", type: "registry:block", registryDependencies: ["card", "@kit/a"], files: [] },
      ],
    }
    expect(checkRegistry(reg, { fileExists: exists([]), readFile: () => "" })).toEqual([])
  })

  it("rejects block files importing from a template folder", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "app-shell",
          type: "registry:block",
          files: [{ path: "components/blocks/app-shell.tsx", type: "registry:component" }],
        },
      ],
    }
    const src = `import { x } from "@/components/dashboard/nav"`
    const errors = checkRegistry(reg, {
      fileExists: exists(["components/blocks/app-shell.tsx"]),
      readFile: () => src,
    })
    expect(errors).toContain(
      "app-shell: components/blocks/app-shell.tsx imports template code @/components/dashboard/nav",
    )
  })

  it("requires target on registry:page files", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "dashboard",
          type: "registry:block",
          files: [{ path: "app/(preview)/dashboard/page.tsx", type: "registry:page" }],
        },
      ],
    }
    const errors = checkRegistry(reg, {
      fileExists: exists(["app/(preview)/dashboard/page.tsx"]),
      readFile: () => "",
    })
    expect(errors).toContain("dashboard: app/(preview)/dashboard/page.tsx is registry:page without target")
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run scripts`
Expected: FAIL, cannot resolve `./check-registry`.

- [ ] **Step 4: Implement the checker**

`scripts/check-registry.ts`:

```ts
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

export type RegistryFile = {
  path: string
  type: string
  target?: string
}

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

export type Registry = {
  name: string
  homepage: string
  items: RegistryItem[]
}

type Io = {
  fileExists: (path: string) => boolean
  readFile: (path: string) => string
}

const TEMPLATE_FOLDERS = ["dashboard", "chat", "crm", "agent"]
const TEMPLATE_IMPORT = new RegExp(
  `from\\s+["'](@/(?:components|lib|app)/(?:${TEMPLATE_FOLDERS.join("|")})[^"']*)["']`,
  "g",
)

export function checkRegistry(registry: Registry, io: Io): string[] {
  const errors: string[] = []
  const names = new Set(registry.items.map((i) => i.name))

  for (const item of registry.items) {
    for (const dep of item.registryDependencies ?? []) {
      if (dep.startsWith("@kit/")) {
        const local = dep.slice("@kit/".length)
        if (!names.has(local)) {
          errors.push(`${item.name}: unresolved registryDependency ${dep}`)
        }
      }
    }

    for (const file of item.files) {
      if (!io.fileExists(file.path)) {
        errors.push(`${item.name}: missing file ${file.path}`)
        continue
      }
      if ((file.type === "registry:page" || file.type === "registry:file") && !file.target) {
        errors.push(`${item.name}: ${file.path} is ${file.type} without target`)
      }
      if (file.path.startsWith("components/blocks/")) {
        const src = io.readFile(file.path)
        for (const match of src.matchAll(TEMPLATE_IMPORT)) {
          errors.push(`${item.name}: ${file.path} imports template code ${match[1]}`)
        }
      }
    }
  }
  return errors
}

function main() {
  const root = process.cwd()
  const registry = JSON.parse(readFileSync(resolve(root, "registry.json"), "utf8")) as Registry
  const errors = checkRegistry(registry, {
    fileExists: (p) => existsSync(resolve(root, p)),
    readFile: (p) => readFileSync(resolve(root, p), "utf8"),
  })
  if (errors.length) {
    console.error(errors.join("\n"))
    process.exit(1)
  }
  console.log(`registry ok: ${registry.items.length} items`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}
```

- [ ] **Step 5: Run to verify tests pass**

Run: `pnpm vitest run scripts`
Expected: 6 passed.

- [ ] **Step 6: Add scripts and confirm `shadcn build` runs on the empty registry**

Add to `package.json` scripts:

```json
"registry:check": "tsx scripts/check-registry.ts",
"registry:build": "shadcn build",
"prebuild": "pnpm registry:check && pnpm registry:build"
```

Run: `pnpm registry:check && pnpm registry:build && ls public/r`
Expected: `registry ok: 0 items`, then `public/r/` exists (possibly containing only `registry.json`).

- [ ] **Step 7: Update the spec's repository shape**

In the spec, replace the `registry/` tree entries with:

```
├── components/
│   ├── ui/                    # shadcn primitives (CLI-managed)
│   └── blocks/                # shared composed pieces, one file per block
├── app/(preview)/<template>/  # template pages (registry:page sources)
├── components/<template>/     # template-specific components
├── lib/<template>/            # template fixtures (registry:lib sources)
```

and add one sentence under "Repository shape": "Registry source lives at real alias paths so the CLI's import rewriting maps 1:1 into the consumer project."

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: registry skeleton with integrity checker"
```

---

### Task 4: Install shadcn primitives used by blocks

**Files:**
- Create: `components/ui/*.tsx` via CLI
- Modify: `package.json` (deps added by CLI)

**Interfaces:**
- Produces: primitives `button card badge separator avatar input textarea label select checkbox switch tabs table sheet dialog dropdown-menu popover command tooltip skeleton scroll-area collapsible breadcrumb sidebar chart` under `@/components/ui/*`, plus `@/hooks/use-mobile`.

- [ ] **Step 1: Add primitives**

```bash
npx shadcn@latest add -y button card badge separator avatar input textarea label select checkbox switch tabs table sheet dialog dropdown-menu popover command tooltip skeleton scroll-area collapsible breadcrumb sidebar chart
```

- [ ] **Step 2: Verify types and build**

Run: `pnpm typecheck && pnpm build`
Expected: both succeed.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add shadcn primitives used by shared blocks"
```

---

### Task 5: Block `page-header`

**Files:**
- Create: `components/blocks/page-header.tsx`, `components/blocks/__tests__/page-header.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  type PageHeaderProps = { title: string; description?: string; actions?: React.ReactNode; className?: string }
  export function PageHeader(props: PageHeaderProps): JSX.Element
  ```

- [ ] **Step 1: Write the failing test**

`components/blocks/__tests__/page-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "@/components/blocks/page-header"

describe("PageHeader", () => {
  it("renders title, description and actions", () => {
    render(
      <PageHeader title="Customers" description="All accounts" actions={<button>New</button>} />,
    )
    expect(screen.getByRole("heading", { level: 1, name: "Customers" })).toBeInTheDocument()
    expect(screen.getByText("All accounts")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
  })

  it("omits description when not provided", () => {
    render(<PageHeader title="Orders" />)
    expect(screen.queryByTestId("page-header-description")).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/page-header.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`components/blocks/page-header.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p data-testid="page-header-description" className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/page-header.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Register the item**

Add to `registry.json` `items`:

```json
{
  "name": "page-header",
  "type": "registry:block",
  "title": "Page Header",
  "description": "Title, description and an actions slot for the top of a page.",
  "files": [{ "path": "components/blocks/page-header.tsx", "type": "registry:component", "target": "components/blocks/page-header.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 1 items`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(blocks): add page-header"
```

---

### Task 6: Block `empty-state`

**Files:**
- Create: `components/blocks/empty-state.tsx`, `components/blocks/__tests__/empty-state.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  type EmptyStateProps = { icon?: React.ComponentType<{ className?: string }>; title: string; description?: string; action?: React.ReactNode; className?: string }
  export function EmptyState(props: EmptyStateProps): JSX.Element
  ```

- [ ] **Step 1: Write the failing test**

`components/blocks/__tests__/empty-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import { describe, expect, it } from "vitest"
import { EmptyState } from "@/components/blocks/empty-state"

describe("EmptyState", () => {
  it("renders icon, title, description and action", () => {
    render(
      <EmptyState icon={Inbox} title="No messages" description="Start a conversation" action={<button>New</button>} />,
    )
    expect(screen.getByText("No messages")).toBeInTheDocument()
    expect(screen.getByText("Start a conversation")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
    expect(screen.getByTestId("empty-state-icon")).toBeInTheDocument()
  })

  it("renders without icon", () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByTestId("empty-state-icon")).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/empty-state.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`components/blocks/empty-state.tsx`:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <div data-testid="empty-state-icon" className="mb-4 rounded-full bg-muted p-3">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-base font-medium">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/empty-state.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Register the item**

Add to `registry.json` `items`:

```json
{
  "name": "empty-state",
  "type": "registry:block",
  "title": "Empty State",
  "description": "Icon, message and primary action for empty lists.",
  "dependencies": ["lucide-react"],
  "files": [{ "path": "components/blocks/empty-state.tsx", "type": "registry:component", "target": "components/blocks/empty-state.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 2 items`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(blocks): add empty-state"
```

---

### Task 7: Block `stat-card`

**Files:**
- Create: `components/blocks/stat-card.tsx`, `components/blocks/__tests__/stat-card.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  type StatCardProps = { label: string; value: string; delta?: number; deltaLabel?: string; sparkline?: number[]; className?: string }
  export function StatCard(props: StatCardProps): JSX.Element
  export function formatDelta(delta: number): string   // "+12.5%" | "-3.0%" | "0.0%"
  ```

- [ ] **Step 1: Write the failing test**

`components/blocks/__tests__/stat-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatCard, formatDelta } from "@/components/blocks/stat-card"

describe("formatDelta", () => {
  it("formats with sign and one decimal", () => {
    expect(formatDelta(12.49)).toBe("+12.5%")
    expect(formatDelta(-3)).toBe("-3.0%")
    expect(formatDelta(0)).toBe("0.0%")
  })
})

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Revenue" value="$12,340" />)
    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("$12,340")).toBeInTheDocument()
    expect(screen.queryByTestId("stat-card-delta")).toBeNull()
  })

  it("marks positive and negative deltas", () => {
    const { rerender } = render(<StatCard label="A" value="1" delta={4.2} deltaLabel="vs last month" />)
    expect(screen.getByTestId("stat-card-delta")).toHaveAttribute("data-trend", "up")
    expect(screen.getByText("vs last month")).toBeInTheDocument()
    rerender(<StatCard label="A" value="1" delta={-1} />)
    expect(screen.getByTestId("stat-card-delta")).toHaveAttribute("data-trend", "down")
  })

  it("renders a sparkline container when data given", () => {
    render(<StatCard label="A" value="1" sparkline={[1, 2, 3]} />)
    expect(screen.getByTestId("stat-card-sparkline")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/stat-card.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`components/blocks/stat-card.tsx`:

```tsx
"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Line, LineChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type StatCardProps = {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  sparkline?: number[]
  className?: string
}

export function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : ""
  return `${sign}${Math.abs(delta).toFixed(1)}%`
}

const sparkConfig = { v: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig

export function StatCard({ label, value, delta, deltaLabel, sparkline, className }: StatCardProps) {
  const trend = delta === undefined ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat"
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus

  return (
    <Card data-slot="stat-card" className={cn("gap-2", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          {trend ? (
            <div
              data-testid="stat-card-delta"
              data-trend={trend}
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                trend === "down" && "text-red-600 dark:text-red-400",
                trend === "flat" && "text-muted-foreground",
              )}
            >
              <TrendIcon className="size-3" />
              <span>{formatDelta(delta!)}</span>
              {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
            </div>
          ) : null}
        </div>
        {sparkline && sparkline.length > 1 ? (
          <div data-testid="stat-card-sparkline" className="h-10 w-24">
            <ChartContainer config={sparkConfig} className="h-full w-full aspect-auto">
              <LineChart data={sparkline.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                <Line type="monotone" dataKey="v" stroke="var(--color-v)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/stat-card.test.tsx`
Expected: 4 passed. If Recharts logs width/height warnings, that is fine.

- [ ] **Step 5: Register the item**

Add to `registry.json` `items`:

```json
{
  "name": "stat-card",
  "type": "registry:block",
  "title": "Stat Card",
  "description": "KPI card with value, delta and optional sparkline.",
  "dependencies": ["lucide-react", "recharts"],
  "registryDependencies": ["card", "chart"],
  "files": [{ "path": "components/blocks/stat-card.tsx", "type": "registry:component", "target": "components/blocks/stat-card.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 3 items`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(blocks): add stat-card"
```

---

### Task 8: Block `chart-card`

**Files:**
- Create: `components/blocks/chart-card.tsx`, `components/blocks/__tests__/chart-card.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  type ChartRange = { value: string; label: string }
  type ChartCardProps = { title: string; description?: string; ranges?: ChartRange[]; range?: string; onRangeChange?: (v: string) => void; config: ChartConfig; children: React.ReactElement; className?: string }
  export function ChartCard(props: ChartCardProps): JSX.Element
  ```
  `children` is a single Recharts chart element rendered inside `ChartContainer`.

- [ ] **Step 1: Write the failing test**

`components/blocks/__tests__/chart-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Bar, BarChart } from "recharts"
import { ChartCard } from "@/components/blocks/chart-card"

const config = { a: { label: "A", color: "var(--chart-1)" } }
const ranges = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
]

describe("ChartCard", () => {
  it("renders title, description and range tabs", async () => {
    const onRangeChange = vi.fn()
    render(
      <ChartCard title="Revenue" description="Gross" ranges={ranges} range="7d" onRangeChange={onRangeChange} config={config}>
        <BarChart data={[{ a: 1 }]}>
          <Bar dataKey="a" />
        </BarChart>
      </ChartCard>,
    )
    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("Gross")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "30 days" }))
    expect(onRangeChange).toHaveBeenCalledWith("30d")
  })

  it("renders without ranges", () => {
    render(
      <ChartCard title="Plain" config={config}>
        <BarChart data={[]}>
          <Bar dataKey="a" />
        </BarChart>
      </ChartCard>,
    )
    expect(screen.queryAllByRole("tab")).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/chart-card.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`components/blocks/chart-card.tsx`:

```tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ChartRange = { value: string; label: string }

export type ChartCardProps = {
  title: string
  description?: string
  ranges?: ChartRange[]
  range?: string
  onRangeChange?: (value: string) => void
  config: ChartConfig
  children: React.ReactElement
  className?: string
  chartClassName?: string
}

export function ChartCard({
  title,
  description,
  ranges,
  range,
  onRangeChange,
  config,
  children,
  className,
  chartClassName,
}: ChartCardProps) {
  return (
    <Card data-slot="chart-card" className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {ranges && ranges.length > 0 ? (
          <Tabs value={range ?? ranges[0]!.value} onValueChange={(v) => onRangeChange?.(v)}>
            <TabsList>
              {ranges.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={cn("aspect-[16/6] w-full", chartClassName)}>
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/chart-card.test.tsx`
Expected: 2 passed.

- [ ] **Step 5: Register the item**

```json
{
  "name": "chart-card",
  "type": "registry:block",
  "title": "Chart Card",
  "description": "Card wrapper around a Recharts chart with title and time-range tabs.",
  "dependencies": ["recharts"],
  "registryDependencies": ["card", "chart", "tabs"],
  "files": [{ "path": "components/blocks/chart-card.tsx", "type": "registry:component", "target": "components/blocks/chart-card.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 4 items`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(blocks): add chart-card"
```

---

### Task 9: Block `app-shell` (with `theme-provider`)

**Files:**
- Create: `components/blocks/theme-provider.tsx`, `components/blocks/app-shell.tsx`, `components/blocks/__tests__/app-shell.test.tsx`
- Modify: `registry.json`, `app/layout.tsx`, `package.json` (next-themes)

**Interfaces:**
- Produces:
  ```ts
  export function ThemeProvider(props: React.ComponentProps<typeof NextThemesProvider>): JSX.Element
  export type NavItem = { title: string; href: string; icon?: React.ComponentType<{ className?: string }>; badge?: string }
  export type NavGroup = { label?: string; items: NavItem[] }
  export type AppShellProps = {
    brand: { name: string; href: string; icon?: React.ComponentType<{ className?: string }> }
    nav: NavGroup[]
    user: { name: string; email: string; initials: string }
    breadcrumbs?: { label: string; href?: string }[]
    currentPath?: string
    onSearch?: () => void
    children: React.ReactNode
  }
  export function AppShell(props: AppShellProps): JSX.Element
  export function ThemeToggle(): JSX.Element
  ```
  `currentPath` marks the active nav item; templates pass `usePathname()`.

- [ ] **Step 1: Install next-themes and wrap the root layout**

```bash
pnpm add next-themes
```

`components/blocks/theme-provider.tsx`:

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
}
```

In `app/layout.tsx`, add `suppressHydrationWarning` to `<html>` and wrap `{children}` in `<ThemeProvider>` imported from `@/components/blocks/theme-provider`.

- [ ] **Step 2: Write the failing test**

`components/blocks/__tests__/app-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { Home, Users } from "lucide-react"
import { describe, expect, it } from "vitest"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"
import { ThemeProvider } from "@/components/blocks/theme-provider"

const nav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: Home },
      { title: "Customers", href: "/dashboard/customers", icon: Users, badge: "12" },
    ],
  },
]

function renderShell(currentPath = "/dashboard/customers") {
  return render(
    <ThemeProvider>
      <AppShell
        brand={{ name: "Acme", href: "/" }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers" }]}
        currentPath={currentPath}
      >
        <p>content</p>
      </AppShell>
    </ThemeProvider>,
  )
}

describe("AppShell", () => {
  it("renders nav items, brand, breadcrumbs and children", () => {
    renderShell()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Overview/ })).toHaveAttribute("href", "/dashboard")
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("content")).toBeInTheDocument()
    expect(screen.getByText("Customers", { selector: "span[aria-current], span" })).toBeInTheDocument()
  })

  it("marks the current nav item active", () => {
    renderShell("/dashboard/customers")
    const active = screen.getByRole("link", { name: /Customers/ })
    expect(active.closest("[data-active]")).toHaveAttribute("data-active", "true")
    const inactive = screen.getByRole("link", { name: /Overview/ })
    expect(inactive.closest("[data-active]")).toHaveAttribute("data-active", "false")
  })

  it("renders the theme toggle and user menu trigger", () => {
    renderShell()
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Jane Doe/ })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/app-shell.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

`components/blocks/app-shell.tsx`:

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronsUpDown, LogOut, Moon, Search, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

export type NavGroup = { label?: string; items: NavItem[] }

export type AppShellProps = {
  brand: { name: string; href: string; icon?: React.ComponentType<{ className?: string }> }
  nav: NavGroup[]
  user: { name: string; email: string; initials: string }
  breadcrumbs?: { label: string; href?: string }[]
  currentPath?: string
  onSearch?: () => void
  children: React.ReactNode
}

function isActive(current: string | undefined, href: string) {
  if (!current) return false
  if (current === href) return true
  // Treat nested routes as active for non-root hrefs, e.g. /crm/deals/123 under /crm/deals.
  return href.split("/").filter(Boolean).length > 1 && current.startsWith(`${href}/`)
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}

export function AppShell({ brand, nav, user, breadcrumbs, currentPath, onSearch, children }: AppShellProps) {
  const BrandIcon = brand.icon
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href={brand.href}>
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    {BrandIcon ? <BrandIcon className="size-4" /> : <span className="text-sm font-bold">{brand.name[0]}</span>}
                  </div>
                  <span className="font-semibold">{brand.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {nav.map((group, gi) => (
            <SidebarGroup key={group.label ?? gi}>
              {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(currentPath, item.href)} tooltip={item.title}>
                          <Link href={item.href}>
                            {Icon ? <Icon className="size-4" /> : null}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" aria-label={user.name}>
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => {
                  const last = i === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={`${crumb.label}-${i}`}>
                      <BreadcrumbItem>
                        {last || !crumb.href ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {last ? null : <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            {onSearch ? (
              <Button variant="ghost" size="icon" aria-label="Search" onClick={onSearch}>
                <Search className="size-4" />
              </Button>
            ) : null}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { Badge as NavBadge }
```

Remove the final `export { Badge as NavBadge }` line and the `Badge` import if unused after implementation; they exist only so the import list above compiles if you keep it. Prefer removing both.

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/app-shell.test.tsx`
Expected: 3 passed. If the active-state assertion fails, inspect the rendered `SidebarMenuButton`: shadcn renders `data-active="true|false"` on the button, and `asChild` moves it onto the `<a>`. Adjust the test to `expect(active).toHaveAttribute("data-active", "true")` if the attribute lands on the link itself.

- [ ] **Step 6: Register items**

Add both items to `registry.json`:

```json
{
  "name": "theme-provider",
  "type": "registry:block",
  "title": "Theme Provider",
  "description": "next-themes provider preconfigured for class-based dark mode.",
  "dependencies": ["next-themes"],
  "files": [{ "path": "components/blocks/theme-provider.tsx", "type": "registry:component", "target": "components/blocks/theme-provider.tsx" }]
},
{
  "name": "app-shell",
  "type": "registry:block",
  "title": "App Shell",
  "description": "Collapsible sidebar, header with breadcrumbs, user menu and theme toggle. Pass a nav config.",
  "dependencies": ["lucide-react", "next-themes"],
  "registryDependencies": ["sidebar", "breadcrumb", "button", "dropdown-menu", "avatar", "separator", "badge", "@kit/theme-provider"],
  "files": [{ "path": "components/blocks/app-shell.tsx", "type": "registry:component", "target": "components/blocks/app-shell.tsx" }]
}
```

Run: `pnpm registry:check && pnpm typecheck`
Expected: `registry ok: 6 items`, typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add app-shell and theme-provider"
```

---

### Task 10: Block `data-table` (TanStack Table v9)

**Files:**
- Create: `components/blocks/data-table.tsx`, `components/blocks/__tests__/data-table.test.tsx`
- Modify: `registry.json`, `package.json`

**Interfaces:**
- Produces:
  ```ts
  export const dataTableFeatures  // tableFeatures({...}) with sorting, pagination, row selection, column visibility
  export type DataTableColumnDef<TData> = ColumnDef<typeof dataTableFeatures, TData, unknown>
  export function createDataTableColumnHelper<TData>()
  export type DataTableProps<TData> = {
    columns: DataTableColumnDef<TData>[]
    data: TData[]
    pageSize?: number            // default 10
    toolbar?: React.ReactNode    // rendered left of the column-visibility menu
    emptyMessage?: string        // default "No results."
    onSelectionChange?: (rows: TData[]) => void
    getRowId?: (row: TData) => string
    className?: string
  }
  export function DataTable<TData>(props: DataTableProps<TData>): JSX.Element
  export function DataTableSelectColumn<TData>(): DataTableColumnDef<TData>
  ```
  Column headers that should sort use `header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />`.

- [ ] **Step 1: Install**

```bash
pnpm add @tanstack/react-table@^9
```

- [ ] **Step 2: Write the failing test**

`components/blocks/__tests__/data-table.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"

type Person = { id: string; name: string; age: number }

const people: Person[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Person ${String(i + 1).padStart(2, "0")}`,
  age: 20 + ((i * 7) % 30),
}))

const helper = createDataTableColumnHelper<Person>()
const columns = [
  DataTableSelectColumn<Person>(),
  helper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  }),
  helper.accessor("age", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
  }),
]

function bodyRows() {
  const table = screen.getByRole("table")
  const [, body] = within(table).getAllByRole("rowgroup")
  return within(body!).getAllByRole("row")
}

describe("DataTable", () => {
  it("paginates at pageSize and navigates", async () => {
    render(<DataTable columns={columns} data={people} pageSize={5} getRowId={(p) => p.id} />)
    expect(bodyRows()).toHaveLength(5)
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /next page/i }))
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
  })

  it("sorts by a column when its header is clicked", async () => {
    render(<DataTable columns={columns} data={people} pageSize={12} getRowId={(p) => p.id} />)
    await userEvent.click(screen.getByRole("button", { name: /^Age/ }))
    const ages = bodyRows().map((r) => Number(within(r).getAllByRole("cell")[2]!.textContent))
    expect(ages).toEqual([...ages].sort((a, b) => a - b))
    await userEvent.click(screen.getByRole("button", { name: /^Age/ }))
    const desc = bodyRows().map((r) => Number(within(r).getAllByRole("cell")[2]!.textContent))
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it("reports selected rows", async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable columns={columns} data={people} pageSize={5} getRowId={(p) => p.id} onSelectionChange={onSelectionChange} />,
    )
    const firstRow = bodyRows()[0]!
    await userEvent.click(within(firstRow).getByRole("checkbox"))
    expect(onSelectionChange).toHaveBeenLastCalledWith([people[0]])
  })

  it("hides a column via the view menu", async () => {
    render(<DataTable columns={columns} data={people} getRowId={(p) => p.id} />)
    await userEvent.click(screen.getByRole("button", { name: /view/i }))
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: /age/i }))
    expect(screen.queryByRole("button", { name: /^Age/ })).toBeNull()
  })

  it("shows empty message", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing" />)
    expect(screen.getByText("Nothing")).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/data-table.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

`components/blocks/data-table.tsx`:

```tsx
"use client"

import * as React from "react"
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text },
})

export type DataTableFeatures = typeof dataTableFeatures
export type DataTableColumnDef<TData> = ColumnDef<DataTableFeatures, TData, unknown>

export function createDataTableColumnHelper<TData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export function DataTableSelectColumn<TData>(): DataTableColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
    ),
    enableSorting: false,
    enableHiding: false,
  } as DataTableColumnDef<TData>
}

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: {
  column: Column<DataTableFeatures, TData, unknown>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" ? <ArrowUp className="size-3.5" /> : sorted === "desc" ? <ArrowDown className="size-3.5" /> : <ChevronsUpDown className="size-3.5 opacity-50" />}
    </Button>
  )
}

export type DataTableProps<TData> = {
  columns: DataTableColumnDef<TData>[]
  data: TData[]
  pageSize?: number
  toolbar?: React.ReactNode
  emptyMessage?: string
  onSelectionChange?: (rows: TData[]) => void
  getRowId?: (row: TData) => string
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  toolbar,
  emptyMessage = "No results.",
  onSelectionChange,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  React.useEffect(() => {
    onSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const hideable = table.getAllColumns().filter((c) => c.getCanHide())
  const pageIndex = table.state.pagination.pageIndex
  const pageCount = Math.max(table.getPageCount(), 1)
  const selectedCount = Object.keys(rowSelection).length

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        {toolbar}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="size-4" /> View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideable.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getAllCells().filter((c) => c.column.getIsVisible()).map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : `${data.length} rows`}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button variant="outline" size="icon" className="size-8" aria-label="First page" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label="Last page" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

If the v9 export names differ (`rowSelectionFeature`, `columnVisibilityFeature`, `sortFn_basic`), confirm with:

```bash
grep -o "export { [^}]*Feature[^}]*}" node_modules/@tanstack/table-core/dist/esm/index.js | head
grep -o "sortFn_[a-zA-Z]*" node_modules/@tanstack/table-core/dist/esm/index.js | sort -u
```

and adjust the import list. Do not fall back to `useLegacyTable`.

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/data-table.test.tsx && pnpm typecheck`
Expected: 5 passed, typecheck clean. If `row.getAllCells().filter(visible)` double-filters, use `row.getVisibleCells()` instead.

- [ ] **Step 6: Register the item**

```json
{
  "name": "data-table",
  "type": "registry:block",
  "title": "Data Table",
  "description": "TanStack Table v9 wrapper with sorting, pagination, row selection, column visibility and a toolbar slot.",
  "dependencies": ["@tanstack/react-table", "lucide-react"],
  "registryDependencies": ["table", "button", "checkbox", "dropdown-menu"],
  "files": [{ "path": "components/blocks/data-table.tsx", "type": "registry:component", "target": "components/blocks/data-table.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 7 items`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add data-table on TanStack Table v9"
```

---

### Task 11: Block `kanban-board`

**Files:**
- Create: `components/blocks/kanban-board.tsx`, `components/blocks/__tests__/kanban-board.test.tsx`
- Modify: `registry.json`, `package.json`

**Interfaces:**
- Produces:
  ```ts
  export type KanbanCard = { id: string; columnId: string; title: string; subtitle?: string; meta?: React.ReactNode }
  export type KanbanColumn = { id: string; title: string }
  export type KanbanBoardProps = {
    columns: KanbanColumn[]
    cards: KanbanCard[]
    onCardsChange: (cards: KanbanCard[]) => void
    renderCard?: (card: KanbanCard) => React.ReactNode
    onCardClick?: (card: KanbanCard) => void
    className?: string
  }
  export function KanbanBoard(props: KanbanBoardProps): JSX.Element
  export function moveCard(cards: KanbanCard[], cardId: string, toColumnId: string, toIndex: number): KanbanCard[]
  ```
  `moveCard` is pure and is what drag-end calls; the test covers it directly since jsdom cannot drive pointer drags reliably.

- [ ] **Step 1: Install**

```bash
pnpm add @dnd-kit/core@^6 @dnd-kit/sortable@^10 @dnd-kit/utilities@^3
```

- [ ] **Step 2: Write the failing test**

`components/blocks/__tests__/kanban-board.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KanbanBoard, moveCard, type KanbanCard } from "@/components/blocks/kanban-board"

const columns = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
]
const cards: KanbanCard[] = [
  { id: "a", columnId: "todo", title: "A" },
  { id: "b", columnId: "todo", title: "B" },
  { id: "c", columnId: "doing", title: "C" },
]

describe("moveCard", () => {
  it("moves a card to another column at an index", () => {
    const next = moveCard(cards, "a", "doing", 1)
    expect(next.filter((c) => c.columnId === "todo").map((c) => c.id)).toEqual(["b"])
    expect(next.filter((c) => c.columnId === "doing").map((c) => c.id)).toEqual(["c", "a"])
  })

  it("reorders within the same column", () => {
    const next = moveCard(cards, "b", "todo", 0)
    expect(next.filter((c) => c.columnId === "todo").map((c) => c.id)).toEqual(["b", "a"])
  })

  it("returns the same array when card is unknown", () => {
    expect(moveCard(cards, "zzz", "done", 0)).toBe(cards)
  })
})

describe("KanbanBoard", () => {
  it("renders columns with their cards and counts", () => {
    render(<KanbanBoard columns={columns} cards={cards} onCardsChange={() => {}} />)
    const todo = screen.getByTestId("kanban-column-todo")
    expect(within(todo).getByText("To do")).toBeInTheDocument()
    expect(within(todo).getByText("2")).toBeInTheDocument()
    expect(within(todo).getByText("A")).toBeInTheDocument()
    expect(within(screen.getByTestId("kanban-column-done")).getByText("0")).toBeInTheDocument()
  })

  it("calls onCardClick", async () => {
    const onCardClick = vi.fn()
    render(<KanbanBoard columns={columns} cards={cards} onCardsChange={() => {}} onCardClick={onCardClick} />)
    screen.getByText("C").click()
    expect(onCardClick).toHaveBeenCalledWith(cards[2])
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/kanban-board.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

`components/blocks/kanban-board.tsx`:

```tsx
"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type KanbanCard = {
  id: string
  columnId: string
  title: string
  subtitle?: string
  meta?: React.ReactNode
}

export type KanbanColumn = { id: string; title: string }

export type KanbanBoardProps = {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  onCardsChange: (cards: KanbanCard[]) => void
  renderCard?: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
  className?: string
}

export function moveCard(cards: KanbanCard[], cardId: string, toColumnId: string, toIndex: number): KanbanCard[] {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return cards
  const without = cards.filter((c) => c.id !== cardId)
  const moved = { ...card, columnId: toColumnId }
  const target = without.filter((c) => c.columnId === toColumnId)
  const others = without.filter((c) => c.columnId !== toColumnId)
  const idx = Math.max(0, Math.min(toIndex, target.length))
  target.splice(idx, 0, moved)
  // Preserve original relative ordering of other columns.
  return [...others, ...target].sort((a, b) => {
    const ca = a.columnId === toColumnId ? target.indexOf(a) : without.indexOf(a)
    const cb = b.columnId === toColumnId ? target.indexOf(b) : without.indexOf(b)
    if (a.columnId !== b.columnId) return 0
    return ca - cb
  })
}

function DefaultCard({ card }: { card: KanbanCard }) {
  return (
    <>
      <div className="text-sm font-medium">{card.title}</div>
      {card.subtitle ? <div className="text-xs text-muted-foreground">{card.subtitle}</div> : null}
      {card.meta ? <div className="mt-2">{card.meta}</div> : null}
    </>
  )
}

function SortableCard({
  card,
  render,
  onClick,
}: {
  card: KanbanCard
  render: (card: KanbanCard) => React.ReactNode
  onClick?: (card: KanbanCard) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
  })
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("cursor-grab py-0 active:cursor-grabbing", isDragging && "opacity-50")}
      onClick={() => onClick?.(card)}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">{render(card)}</CardContent>
    </Card>
  )
}

function Column({
  column,
  cards,
  render,
  onCardClick,
}: {
  column: KanbanColumn
  cards: KanbanCard[]
  render: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } })
  return (
    <div
      data-testid={`kanban-column-${column.id}`}
      className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">{column.title}</span>
        <Badge variant="secondary">{cards.length}</Badge>
      </div>
      <SortableContext id={column.id} items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={cn("flex min-h-24 flex-1 flex-col gap-2 p-2", isOver && "bg-muted")}>
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} render={render} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ columns, cards, onCardsChange, renderCard, onCardClick, className }: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const render = renderCard ?? ((c: KanbanCard) => <DefaultCard card={c} />)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findColumnId = (id: string) => {
    if (columns.some((c) => c.id === id)) return id
    return cards.find((c) => c.id === id)?.columnId
  }

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const handleDragOver = (e: DragOverEvent) => {
    const over = e.over
    if (!over) return
    const activeCardId = String(e.active.id)
    const fromColumn = findColumnId(activeCardId)
    const toColumn = findColumnId(String(over.id))
    if (!fromColumn || !toColumn || fromColumn === toColumn) return
    const targetCards = cards.filter((c) => c.columnId === toColumn)
    const overIndex = targetCards.findIndex((c) => c.id === String(over.id))
    onCardsChange(moveCard(cards, activeCardId, toColumn, overIndex === -1 ? targetCards.length : overIndex))
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    const over = e.over
    if (!over) return
    const activeCardId = String(e.active.id)
    const toColumn = findColumnId(String(over.id))
    if (!toColumn) return
    const targetCards = cards.filter((c) => c.columnId === toColumn)
    const overIndex = targetCards.findIndex((c) => c.id === String(over.id))
    onCardsChange(moveCard(cards, activeCardId, toColumn, overIndex === -1 ? targetCards.length : overIndex))
  }

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : undefined

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div data-slot="kanban-board" className={cn("flex gap-4 overflow-x-auto pb-2", className)}>
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={cards.filter((c) => c.columnId === col.id)}
            render={render}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <Card className="w-72 py-0 shadow-lg">
            <CardContent className="p-3">{render(activeCard)}</CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/kanban-board.test.tsx && pnpm typecheck`
Expected: 5 passed. If `moveCard` ordering assertions fail, simplify the return to `[...others, ...target]` (other columns keep their relative order because `filter` is stable) and remove the sort. That simpler form is the intended implementation; the sort is defensive only.

- [ ] **Step 6: Register the item**

```json
{
  "name": "kanban-board",
  "type": "registry:block",
  "title": "Kanban Board",
  "description": "Columns and draggable cards using dnd-kit. Controlled via cards + onCardsChange.",
  "dependencies": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
  "registryDependencies": ["card", "badge"],
  "files": [{ "path": "components/blocks/kanban-board.tsx", "type": "registry:component", "target": "components/blocks/kanban-board.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 8 items`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add kanban-board"
```

---

### Task 12: Blocks `message-list` and `composer`

**Files:**
- Create: `components/blocks/message-list.tsx`, `components/blocks/composer.tsx`, `components/blocks/__tests__/message-list.test.tsx`, `components/blocks/__tests__/composer.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  export type MessageAuthor = { id: string; name: string; initials: string }
  export type Message = {
    id: string
    author: MessageAuthor
    body?: string                  // plain text; newlines preserved
    createdAt: Date
    status?: "sent" | "delivered" | "read"
    attachments?: React.ReactNode  // rendered below body (tool-call-card uses this)
  }
  export type MessageListProps = { messages: Message[]; currentUserId: string; groupWindowMs?: number; className?: string; emptyState?: React.ReactNode }
  export function MessageList(props: MessageListProps): JSX.Element
  export function groupMessages(messages: Message[], windowMs: number): Message[][]  // consecutive same-author within window

  export type ComposerProps = { onSend: (text: string) => void; placeholder?: string; disabled?: boolean; leftSlot?: React.ReactNode; rightSlot?: React.ReactNode; className?: string }
  export function Composer(props: ComposerProps): JSX.Element   // Enter sends, Shift+Enter newline, trims, ignores empty
  ```

- [ ] **Step 1: Write the failing tests**

`components/blocks/__tests__/message-list.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MessageList, groupMessages, type Message } from "@/components/blocks/message-list"

const me = { id: "me", name: "Me", initials: "ME" }
const you = { id: "you", name: "You", initials: "YO" }
const t = (s: number) => new Date(2026, 0, 1, 12, 0, s)

const messages: Message[] = [
  { id: "1", author: you, body: "hi", createdAt: t(0) },
  { id: "2", author: you, body: "there", createdAt: t(30) },
  { id: "3", author: me, body: "hello", createdAt: t(60), status: "read" },
  { id: "4", author: you, body: "late", createdAt: t(60 * 20) },
]

describe("groupMessages", () => {
  it("groups consecutive same-author messages within the window", () => {
    const groups = groupMessages(messages, 5 * 60 * 1000)
    expect(groups.map((g) => g.map((m) => m.id))).toEqual([["1", "2"], ["3"], ["4"]])
  })
})

describe("MessageList", () => {
  it("renders bodies, aligns own messages, shows status on own messages", () => {
    render(<MessageList messages={messages} currentUserId="me" />)
    expect(screen.getByText("hello").closest("[data-own]")).toHaveAttribute("data-own", "true")
    expect(screen.getByText("hi").closest("[data-own]")).toHaveAttribute("data-own", "false")
    expect(screen.getByText(/read/i)).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(<MessageList messages={[]} currentUserId="me" emptyState={<p>No messages yet</p>} />)
    expect(screen.getByText("No messages yet")).toBeInTheDocument()
  })
})
```

`components/blocks/__tests__/composer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Composer } from "@/components/blocks/composer"

describe("Composer", () => {
  it("sends trimmed text on Enter and clears", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "  hello  {Enter}")
    expect(onSend).toHaveBeenCalledWith("hello")
    expect(box).toHaveValue("")
  })

  it("inserts newline on Shift+Enter and does not send", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "a{Shift>}{Enter}{/Shift}b")
    expect(onSend).not.toHaveBeenCalled()
    expect(box).toHaveValue("a\nb")
  })

  it("ignores empty submissions and disables send button", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const send = screen.getByRole("button", { name: /send/i })
    expect(send).toBeDisabled()
    await userEvent.click(send)
    expect(onSend).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `pnpm vitest run components/blocks/__tests__/message-list.test.tsx components/blocks/__tests__/composer.test.tsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `message-list`**

`components/blocks/message-list.tsx`:

```tsx
import * as React from "react"
import { Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type MessageAuthor = { id: string; name: string; initials: string }

export type Message = {
  id: string
  author: MessageAuthor
  body?: string
  createdAt: Date
  status?: "sent" | "delivered" | "read"
  attachments?: React.ReactNode
}

export type MessageListProps = {
  messages: Message[]
  currentUserId: string
  groupWindowMs?: number
  className?: string
  emptyState?: React.ReactNode
}

export function groupMessages(messages: Message[], windowMs: number): Message[][] {
  const groups: Message[][] = []
  for (const m of messages) {
    const last = groups[groups.length - 1]
    const prev = last?.[last.length - 1]
    if (prev && prev.author.id === m.author.id && m.createdAt.getTime() - prev.createdAt.getTime() <= windowMs) {
      last!.push(m)
    } else {
      groups.push([m])
    }
  }
  return groups
}

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })

function Status({ status }: { status: Message["status"] }) {
  if (!status) return null
  const Icon = status === "sent" ? Check : CheckCheck
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px]", status === "read" ? "text-primary" : "text-muted-foreground")}>
      <Icon className="size-3" />
      <span className="capitalize">{status}</span>
    </span>
  )
}

export function MessageList({ messages, currentUserId, groupWindowMs = 5 * 60 * 1000, className, emptyState }: MessageListProps) {
  if (messages.length === 0) {
    return <div className={cn("flex flex-1 items-center justify-center p-8", className)}>{emptyState}</div>
  }
  const groups = groupMessages(messages, groupWindowMs)
  return (
    <div data-slot="message-list" className={cn("flex flex-col gap-4 p-4", className)}>
      {groups.map((group) => {
        const first = group[0]!
        const own = first.author.id === currentUserId
        return (
          <div key={first.id} data-own={own} className={cn("flex gap-2", own ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="size-8 shrink-0">
              <AvatarFallback>{first.author.initials}</AvatarFallback>
            </Avatar>
            <div className={cn("flex max-w-[75%] flex-col gap-1", own ? "items-end" : "items-start")}>
              <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
                {!own ? <span className="font-medium text-foreground">{first.author.name}</span> : null}
                <time dateTime={first.createdAt.toISOString()}>{timeFmt.format(first.createdAt)}</time>
              </div>
              {group.map((m, i) => (
                <div key={m.id} className={cn("flex flex-col gap-1", own ? "items-end" : "items-start")}>
                  {m.body ? (
                    <div
                      className={cn(
                        "whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                        own ? "bg-primary text-primary-foreground" : "bg-muted",
                        i === 0 && (own ? "rounded-tr-md" : "rounded-tl-md"),
                      )}
                    >
                      {m.body}
                    </div>
                  ) : null}
                  {m.attachments ? <div className="w-full">{m.attachments}</div> : null}
                  {own && i === group.length - 1 ? <Status status={m.status} /> : null}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Implement `composer`**

`components/blocks/composer.tsx`:

```tsx
"use client"

import * as React from "react"
import { Paperclip, SendHorizonal, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ComposerProps = {
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
}

export function Composer({ onSend, placeholder = "Write a message…", disabled, leftSlot, rightSlot, className }: ComposerProps) {
  const [value, setValue] = React.useState("")
  const canSend = value.trim().length > 0 && !disabled

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  return (
    <div data-slot="composer" className={cn("flex items-end gap-2 border-t p-3", className)}>
      <div className="flex items-center gap-1">
        {leftSlot ?? (
          <>
            <Button variant="ghost" size="icon" aria-label="Attach file" disabled={disabled}>
              <Paperclip className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Insert emoji" disabled={disabled}>
              <Smile className="size-4" />
            </Button>
          </>
        )}
      </div>
      <Textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-9 max-h-40 flex-1 resize-none"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      {rightSlot}
      <Button size="icon" aria-label="Send" disabled={!canSend} onClick={submit}>
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `pnpm vitest run components/blocks/__tests__/message-list.test.tsx components/blocks/__tests__/composer.test.tsx`
Expected: 6 passed.

- [ ] **Step 6: Register both items**

```json
{
  "name": "message-list",
  "type": "registry:block",
  "title": "Message List",
  "description": "Grouped chat bubbles with timestamps, read receipts and an attachments slot.",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["avatar"],
  "files": [{ "path": "components/blocks/message-list.tsx", "type": "registry:component", "target": "components/blocks/message-list.tsx" }]
},
{
  "name": "composer",
  "type": "registry:block",
  "title": "Composer",
  "description": "Chat input with Enter-to-send, attachment and emoji triggers, and slots.",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["button", "textarea"],
  "files": [{ "path": "components/blocks/composer.tsx", "type": "registry:component", "target": "components/blocks/composer.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 10 items`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blocks): add message-list and composer"
```

---

### Task 13: Block `tool-call-card`

**Files:**
- Create: `components/blocks/tool-call-card.tsx`, `components/blocks/__tests__/tool-call-card.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces:
  ```ts
  export type ToolCallStatus = "pending" | "running" | "success" | "error"
  export type ToolCallCardProps = { name: string; status: ToolCallStatus; input?: unknown; output?: unknown; durationMs?: number; defaultOpen?: boolean; className?: string }
  export function ToolCallCard(props: ToolCallCardProps): JSX.Element
  export function formatJson(value: unknown): string   // pretty JSON, strings passed through
  ```

- [ ] **Step 1: Write the failing test**

`components/blocks/__tests__/tool-call-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ToolCallCard, formatJson } from "@/components/blocks/tool-call-card"

describe("formatJson", () => {
  it("pretty prints objects and passes strings through", () => {
    expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}')
    expect(formatJson("plain")).toBe("plain")
  })
})

describe("ToolCallCard", () => {
  it("shows name, status and duration, collapsed by default", () => {
    render(<ToolCallCard name="search_web" status="success" durationMs={1234} input={{ q: "x" }} output="ok" />)
    expect(screen.getByText("search_web")).toBeInTheDocument()
    expect(screen.getByTestId("tool-call-status")).toHaveAttribute("data-status", "success")
    expect(screen.getByText("1.2s")).toBeInTheDocument()
    expect(screen.queryByText(/"q": "x"/)).toBeNull()
  })

  it("expands to show input and output", async () => {
    render(<ToolCallCard name="search_web" status="error" input={{ q: "x" }} output={{ error: "boom" }} />)
    await userEvent.click(screen.getByRole("button", { name: /search_web/ }))
    expect(screen.getByText(/"q": "x"/)).toBeInTheDocument()
    expect(screen.getByText(/"error": "boom"/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/blocks/__tests__/tool-call-card.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`components/blocks/tool-call-card.tsx`:

```tsx
"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Circle, Loader2, Wrench } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type ToolCallStatus = "pending" | "running" | "success" | "error"

export type ToolCallCardProps = {
  name: string
  status: ToolCallStatus
  input?: unknown
  output?: unknown
  durationMs?: number
  defaultOpen?: boolean
  className?: string
}

export function formatJson(value: unknown): string {
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

const statusIcon: Record<ToolCallStatus, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  running: Loader2,
  success: CheckCircle2,
  error: AlertCircle,
}

export function ToolCallCard({ name, status, input, output, durationMs, defaultOpen = false, className }: ToolCallCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const Icon = statusIcon[status]
  return (
    <Collapsible open={open} onOpenChange={setOpen} data-slot="tool-call-card" className={cn("rounded-lg border bg-card text-sm", className)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left">
        <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
        <Wrench className="size-4 text-muted-foreground" />
        <span className="font-mono text-xs font-medium">{name}</span>
        <span
          data-testid="tool-call-status"
          data-status={status}
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-xs",
            status === "success" && "text-emerald-600 dark:text-emerald-400",
            status === "error" && "text-red-600 dark:text-red-400",
            status === "running" && "text-primary",
            status === "pending" && "text-muted-foreground",
          )}
        >
          <Icon className={cn("size-3.5", status === "running" && "animate-spin")} />
          <span className="capitalize">{status}</span>
        </span>
        {durationMs !== undefined ? <span className="text-xs text-muted-foreground">{formatDuration(durationMs)}</span> : null}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-3 border-t px-3 py-2">
          {input !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Input</div>
              <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">{formatJson(input)}</pre>
            </div>
          ) : null}
          {output !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Output</div>
              <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">{formatJson(output)}</pre>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/blocks/__tests__/tool-call-card.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Register the item**

```json
{
  "name": "tool-call-card",
  "type": "registry:block",
  "title": "Tool Call Card",
  "description": "Collapsible card showing an agent tool call's status, input and output.",
  "dependencies": ["lucide-react"],
  "registryDependencies": ["collapsible"],
  "files": [{ "path": "components/blocks/tool-call-card.tsx", "type": "registry:component", "target": "components/blocks/tool-call-card.tsx" }]
}
```

Run: `pnpm registry:check`
Expected: `registry ok: 11 items`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(blocks): add tool-call-card"
```

---

### Task 14: Gallery site with block demos

**Files:**
- Create: `app/(site)/layout.tsx`, `app/(site)/page.tsx`, `app/(site)/blocks/page.tsx`, `app/(site)/blocks/_demos/*.tsx` (one per block), `components/site/install-command.tsx`, `components/site/__tests__/install-command.test.tsx`
- Modify or delete: the scaffolded `app/page.tsx` (move content to `(site)/page.tsx`)

**Interfaces:**
- Consumes: every block from Tasks 5 to 13; `installCommand()` from `lib/site.ts`.
- Produces: routes `/` and `/blocks`.

- [ ] **Step 1: Write the failing test for the install command widget**

`components/site/__tests__/install-command.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { InstallCommand } from "@/components/site/install-command"

describe("InstallCommand", () => {
  it("renders the command and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<InstallCommand item="app-shell" />)
    expect(screen.getByText("npx shadcn@latest add @kit/app-shell")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith("npx shadcn@latest add @kit/app-shell")
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/site`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the widget**

`components/site/install-command.tsx`:

```tsx
"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { installCommand } from "@/lib/site"

export function InstallCommand({ item }: { item: string }) {
  const [copied, setCopied] = React.useState(false)
  const cmd = installCommand(item)
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
      <code className="flex-1 truncate">{cmd}</code>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Copy install command"
        onClick={async () => {
          await navigator.clipboard.writeText(cmd)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/site`
Expected: 1 passed.

- [ ] **Step 5: Build the site layout and home page**

Delete the scaffolded `app/page.tsx`. Create:

`app/(site)/layout.tsx`:

```tsx
import Link from "next/link"
import { ThemeToggle } from "@/components/blocks/app-shell"
import { REGISTRY_NAMESPACE, REGISTRY_URL } from "@/lib/site"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="font-semibold">
            Kit
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/">Templates</Link>
            <Link href="/blocks">Blocks</Link>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          Add to <code>components.json</code>: <code>{`"registries": { "${REGISTRY_NAMESPACE}": "${REGISTRY_URL}" }`}</code>
        </div>
      </footer>
    </div>
  )
}
```

`app/(site)/page.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InstallCommand } from "@/components/site/install-command"

const templates = [
  { name: "dashboard", title: "Admin Dashboard", description: "Stats, charts, tables and settings.", status: "coming soon" },
  { name: "chat", title: "Chat App", description: "Conversations, threads and contacts.", status: "coming soon" },
  { name: "crm", title: "CRM", description: "Contacts, companies, deals pipeline and tasks.", status: "coming soon" },
  { name: "agent", title: "AI Agent Platform", description: "Agent workspace, builder, runs and usage.", status: "coming soon" },
] as const

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Application templates for shadcn/ui</h1>
        <p className="max-w-2xl text-muted-foreground">
          Full app skeletons and reusable blocks you install with the shadcn CLI. Add the registry once, then pull in a
          template or a single block.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.title}</CardTitle>
                <Badge variant="secondary">{t.status}</Badge>
              </div>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <InstallCommand item={t.name} />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
```

- [ ] **Step 6: Build the blocks page with one demo per block**

`app/(site)/blocks/page.tsx`:

```tsx
import { InstallCommand } from "@/components/site/install-command"
import { PageHeaderDemo } from "./_demos/page-header-demo"
import { EmptyStateDemo } from "./_demos/empty-state-demo"
import { StatCardDemo } from "./_demos/stat-card-demo"
import { ChartCardDemo } from "./_demos/chart-card-demo"
import { AppShellDemo } from "./_demos/app-shell-demo"
import { DataTableDemo } from "./_demos/data-table-demo"
import { KanbanBoardDemo } from "./_demos/kanban-board-demo"
import { MessageListDemo } from "./_demos/message-list-demo"
import { ComposerDemo } from "./_demos/composer-demo"
import { ToolCallCardDemo } from "./_demos/tool-call-card-demo"

const demos = [
  { name: "page-header", title: "Page Header", Demo: PageHeaderDemo },
  { name: "empty-state", title: "Empty State", Demo: EmptyStateDemo },
  { name: "stat-card", title: "Stat Card", Demo: StatCardDemo },
  { name: "chart-card", title: "Chart Card", Demo: ChartCardDemo },
  { name: "app-shell", title: "App Shell", Demo: AppShellDemo },
  { name: "data-table", title: "Data Table", Demo: DataTableDemo },
  { name: "kanban-board", title: "Kanban Board", Demo: KanbanBoardDemo },
  { name: "message-list", title: "Message List", Demo: MessageListDemo },
  { name: "composer", title: "Composer", Demo: ComposerDemo },
  { name: "tool-call-card", title: "Tool Call Card", Demo: ToolCallCardDemo },
]

export default function BlocksPage() {
  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-semibold tracking-tight">Blocks</h1>
      {demos.map(({ name, title, Demo }) => (
        <section key={name} id={name} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-medium">{title}</h2>
            <div className="sm:w-96">
              <InstallCommand item={name} />
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <Demo />
          </div>
        </section>
      ))}
    </div>
  )
}
```

Demo files, all under `app/(site)/blocks/_demos/`:

`page-header-demo.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"

export function PageHeaderDemo() {
  return <PageHeader title="Customers" description="Manage your customer accounts." actions={<Button>Add customer</Button>} />
}
```

`empty-state-demo.tsx`:

```tsx
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/blocks/empty-state"

export function EmptyStateDemo() {
  return <EmptyState icon={Inbox} title="No messages" description="Start a conversation to see it here." action={<Button>New message</Button>} />
}
```

`stat-card-demo.tsx`:

```tsx
import { StatCard } from "@/components/blocks/stat-card"

export function StatCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Revenue" value="$48,210" delta={12.4} deltaLabel="vs last month" sparkline={[4, 6, 5, 8, 9, 12, 11]} />
      <StatCard label="Active users" value="2,318" delta={-3.1} deltaLabel="vs last month" sparkline={[9, 8, 8, 7, 7, 6, 6]} />
      <StatCard label="Churn" value="1.8%" delta={0} />
    </div>
  )
}
```

`chart-card-demo.tsx`:

```tsx
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"

const data = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 1900 },
  { month: "Mar", revenue: 1600 },
  { month: "Apr", revenue: 2400 },
  { month: "May", revenue: 2100 },
  { month: "Jun", revenue: 2800 },
]
const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } }

export function ChartCardDemo() {
  const [range, setRange] = React.useState("6m")
  return (
    <ChartCard title="Revenue" description="Monthly gross revenue" ranges={[{ value: "6m", label: "6 months" }, { value: "12m", label: "12 months" }]} range={range} onRangeChange={setRange} config={config}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartCard>
  )
}
```

`app-shell-demo.tsx`:

```tsx
"use client"

import { Home, Settings, Users } from "lucide-react"
import { AppShell } from "@/components/blocks/app-shell"

export function AppShellDemo() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border">
      <AppShell
        brand={{ name: "Acme", href: "#" }}
        nav={[
          { label: "Main", items: [{ title: "Overview", href: "#overview", icon: Home }, { title: "Customers", href: "#customers", icon: Users, badge: "12" }] },
          { items: [{ title: "Settings", href: "#settings", icon: Settings }] },
        ]}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={[{ label: "Acme", href: "#" }, { label: "Overview" }]}
        currentPath="#overview"
      >
        <p className="text-sm text-muted-foreground">Page content renders here.</p>
      </AppShell>
    </div>
  )
}
```

`data-table-demo.tsx`:

```tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTable, DataTableColumnHeader, DataTableSelectColumn, createDataTableColumnHelper } from "@/components/blocks/data-table"

type Invoice = { id: string; customer: string; status: "paid" | "open" | "overdue"; amount: number }

const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  customer: ["Acme", "Globex", "Initech", "Umbrella", "Hooli"][i % 5]!,
  status: (["paid", "open", "overdue"] as const)[i % 3]!,
  amount: 120 + i * 37,
}))

const h = createDataTableColumnHelper<Invoice>()
const columns = [
  DataTableSelectColumn<Invoice>(),
  h.accessor("id", { header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" /> }),
  h.accessor("customer", { header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> }),
  h.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <Badge variant={getValue() === "overdue" ? "destructive" : "secondary"}>{getValue()}</Badge>,
  }),
  h.accessor("amount", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ getValue }) => `$${getValue().toLocaleString()}`,
  }),
]

export function DataTableDemo() {
  return <DataTable columns={columns} data={invoices} getRowId={(r) => r.id} toolbar={<Input placeholder="Filter…" className="h-8 w-56" />} />
}
```

`kanban-board-demo.tsx`:

```tsx
"use client"

import * as React from "react"
import { KanbanBoard, type KanbanCard } from "@/components/blocks/kanban-board"

const columns = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal" },
  { id: "won", title: "Won" },
]
const initial: KanbanCard[] = [
  { id: "1", columnId: "lead", title: "Acme renewal", subtitle: "$12,000" },
  { id: "2", columnId: "lead", title: "Globex pilot", subtitle: "$4,500" },
  { id: "3", columnId: "qualified", title: "Initech expansion", subtitle: "$28,000" },
  { id: "4", columnId: "proposal", title: "Hooli platform", subtitle: "$90,000" },
]

export function KanbanBoardDemo() {
  const [cards, setCards] = React.useState(initial)
  return <KanbanBoard columns={columns} cards={cards} onCardsChange={setCards} />
}
```

`message-list-demo.tsx`:

```tsx
import { MessageList, type Message } from "@/components/blocks/message-list"

const me = { id: "me", name: "You", initials: "YO" }
const sam = { id: "sam", name: "Sam Rivera", initials: "SR" }
const at = (m: number) => new Date(2026, 8, 5, 9, m)
const messages: Message[] = [
  { id: "1", author: sam, body: "Morning! Did the deploy go out?", createdAt: at(0) },
  { id: "2", author: sam, body: "Dashboard looks a bit off on mobile.", createdAt: at(1) },
  { id: "3", author: me, body: "Yes, shipped at 8:40.\nLooking at the mobile issue now.", createdAt: at(3), status: "read" },
  { id: "4", author: sam, body: "Great, thanks!", createdAt: at(15) },
]

export function MessageListDemo() {
  return <MessageList messages={messages} currentUserId="me" className="rounded-md border" />
}
```

`composer-demo.tsx`:

```tsx
"use client"

import * as React from "react"
import { Composer } from "@/components/blocks/composer"

export function ComposerDemo() {
  const [sent, setSent] = React.useState<string[]>([])
  return (
    <div className="space-y-3">
      <Composer onSend={(t) => setSent((s) => [...s, t])} />
      {sent.length ? <ul className="text-sm text-muted-foreground">{sent.map((s, i) => <li key={i}>Sent: {s}</li>)}</ul> : null}
    </div>
  )
}
```

`tool-call-card-demo.tsx`:

```tsx
import { ToolCallCard } from "@/components/blocks/tool-call-card"

export function ToolCallCardDemo() {
  return (
    <div className="space-y-2">
      <ToolCallCard name="search_web" status="success" durationMs={1240} input={{ query: "shadcn registry" }} output={{ results: 3 }} />
      <ToolCallCard name="read_file" status="running" input={{ path: "README.md" }} />
      <ToolCallCard name="send_email" status="error" durationMs={310} input={{ to: "ops@acme.com" }} output={{ error: "SMTP timeout" }} defaultOpen />
    </div>
  )
}
```

- [ ] **Step 7: Verify build and take a look**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: all pass, route table lists `/` and `/blocks`.

Run: `pnpm dev` and open `http://localhost:3000/blocks`. Every section renders; theme toggle switches dark mode; kanban cards drag between columns. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(site): gallery home and block demos"
```

---

### Task 15: Install smoke test script

**Files:**
- Create: `scripts/smoke-install.sh`
- Modify: `package.json` (script `smoke`)

**Interfaces:**
- Consumes: `public/r/*.json` from `pnpm registry:build`.
- Produces: `pnpm smoke` exits 0 only if a fresh Next.js app can install every registry item from the local build and pass `next build` and `tsc`.

- [ ] **Step 1: Write the script**

`scripts/smoke-install.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${SMOKE_DIR:-$(mktemp -d)}"
APP="$WORK/consumer"

echo "▶ building registry"
(cd "$ROOT" && pnpm registry:check && pnpm registry:build)

echo "▶ scaffolding consumer app in $APP"
mkdir -p "$WORK"
(cd "$WORK" && npx shadcn@latest init -t next -b radix -y -n consumer)

echo "▶ installing every registry item from local build"
ITEMS=$(node -e "console.log(require('$ROOT/registry.json').items.map(i=>i.name).join(' '))")
for name in $ITEMS; do
  echo "  + $name"
  (cd "$APP" && npx shadcn@latest add -y "$ROOT/public/r/$name.json")
done

echo "▶ typecheck + build consumer"
(cd "$APP" && npx tsc --noEmit && npm run build)

echo "✔ smoke install passed for: $ITEMS"
if [ -z "${SMOKE_DIR:-}" ]; then rm -rf "$WORK"; fi
```

```bash
chmod +x scripts/smoke-install.sh
```

Add to `package.json` scripts:

```json
"smoke": "bash scripts/smoke-install.sh"
```

- [ ] **Step 2: Run it**

Run: `SMOKE_DIR=/private/tmp/claude-501/-Users-jakeuren-dev-personal/44a0ff6d-cc8f-42c9-9b52-d0de677087cf/scratchpad/smoke pnpm smoke`
Expected: ends with `✔ smoke install passed for: page-header empty-state ... tool-call-card`.

Likely failures and the fix for each:
- **Import not rewritten** (`Cannot find module '@/components/blocks/...'`): the consumer's alias differs. Confirm the consumer `components.json` has `"components": "@/components"`. If the CLI installed files under a different path than the `target`, remove `target` from that item's file entry and re-run; if it installed at the target but imports still point elsewhere, the source import must match the target path exactly.
- **Missing dependency** (`Cannot find module 'recharts'`): the item's `dependencies` array is missing that package. Add it in `registry.json`.
- **Missing primitive** (`@/components/ui/collapsible`): add the primitive name to `registryDependencies`.
- **`@kit/theme-provider` unresolved**: the consumer has no `@kit` namespace configured. Change that dependency to the built URL form is not possible locally, so instead add the file path form: `"./theme-provider.json"` is resolved relative to the item file. Use `"registryDependencies": [..., "./theme-provider.json"]` in `registry.json` for `app-shell`, and update `checkRegistry` to accept `./<name>.json` as a local reference (same validation as `@kit/<name>`), with a new test case mirroring the `@kit/` ones.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add registry install smoke test"
```

---

### Task 16: CI workflow and README

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`

- [ ] **Step 1: CI**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm registry:check
      - run: pnpm build
      - run: pnpm smoke
```

- [ ] **Step 2: README**

`README.md`:

```markdown
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

1. `components/blocks/<name>.tsx` with `"use client"` if it has state or handlers.
2. Test in `components/blocks/__tests__/<name>.test.tsx`.
3. Demo in `app/(site)/blocks/_demos/<name>-demo.tsx`, registered in `app/(site)/blocks/page.tsx`.
4. Item in `registry.json` with `dependencies` (npm) and `registryDependencies` (shadcn names or `@kit/<name>`).
5. `pnpm registry:check && pnpm smoke`.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add workflow; docs: add README"
```

---

## Self-review against the spec

- **Repository shape**: Tasks 1, 3, 14. Deviation (`components/blocks/` instead of `registry/blocks/`) recorded and spec updated in Task 3.
- **Registry item graph and consumer flow**: Tasks 3, 5 to 13 (items), 16 (README namespace instructions). Templates as items are in the follow-on plans.
- **Shared blocks table**: all ten blocks covered: page-header (5), empty-state (6), stat-card (7), chart-card (8), app-shell (9), data-table (10), kanban-board (11), message-list and composer (12), tool-call-card (13). `theme-provider` added as a small supporting item because `app-shell` needs it.
- **Block rules**: no template imports enforced by `checkRegistry` (Task 3); props-only data by construction; demos on the gallery blocks page (Task 14).
- **Templates and screens, mock data conventions**: out of scope for this plan by design; each template gets its own plan once these interfaces are in place.
- **Testing**: unit tests per block (5 to 13), integrity script (3), install smoke test (15), preview build and lint in CI (16).
- **Type consistency**: `DataTableColumnHeader` is exported in Task 10 and used in the Task 14 demo; `KanbanCard`, `Message`, `NavGroup` names match across tasks; `installCommand` from `lib/site.ts` (Task 3) is used in Task 14.
