# Dashboard Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `@kit/dashboard` registry item: a five-page admin dashboard (overview, analytics, customers, orders, settings) built from the shared blocks, previewable at `/dashboard` and installable into a fresh Next.js app.

**Architecture:** Pages live at `app/(preview)/dashboard/**` and are registered as `registry:page` files with `target: app/dashboard/**`. Template components live in `components/dashboard/`, fixtures and queries in `lib/dashboard/`. Pages are server components that call query functions; interactive tables, charts and forms are client components. The client `DashboardShell` wraps `AppShell` with the nav config and path-derived breadcrumbs.

**Tech Stack:** Next.js 16 App Router, blocks from plan 1 (app-shell, page-header, stat-card, chart-card, data-table, empty-state), shadcn primitives, Recharts 3, TanStack Table 9, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-05-shadcn-templates-registry-design.md`

## Global Constraints

- Pages under `app/(preview)/dashboard/` import only `@/components/blocks/*`, `@/components/ui/*`, `@/components/dashboard/*`, `@/lib/dashboard/*`, `@/lib/utils`.
- Fixtures are deterministic and committed. No runtime faker. Timestamps are stored as `minutesAgo` offsets and materialised to `Date` in `queries.ts`.
- All formatting uses explicit locale `en-US` and currency `USD` so server and client render identical strings.
- Client components start with `"use client"`. Pages are server components unless they hold interactive state.
- Every new source file appears in the `dashboard` item in `registry.json` with an explicit `target`.
- Commit after every task.

---

## File Structure

```
lib/dashboard/
├── types.ts            # Customer, Order, OrderItem, Product, Activity, MonthlyMetric, Channel
├── format.ts           # formatCurrency, formatNumber, formatPercent, formatRelative, formatDate
├── fixtures.ts         # customers, products, orders, activity, monthly, channels (deterministic)
├── queries.ts          # getOverviewMetrics, getMonthly(range), getRecentOrders, getActivity,
│                       #   getCustomers, getCustomerById, getOrders, getOrderById, getChannels,
│                       #   getTopProducts, getTeam, getInvoices
└── __tests__/{format,queries}.test.ts
components/dashboard/
├── dashboard-shell.tsx       # client: nav + breadcrumbs → AppShell
├── revenue-chart.tsx         # client: ChartCard + AreaChart with range tabs
├── channels-chart.tsx        # client: ChartCard + stacked BarChart
├── signups-chart.tsx         # client: ChartCard + LineChart
├── top-products.tsx          # server-safe list card
├── activity-feed.tsx         # server-safe list card
├── status-badge.tsx          # order/customer status → Badge variant
├── recent-orders-table.tsx   # client: DataTable, no toolbar, pageSize 8
├── customers-table.tsx       # client: search + status filter + Sheet detail
├── orders-table.tsx          # client: status filter + Sheet detail
├── settings-profile.tsx      # client form
├── settings-team.tsx         # client table + invite Dialog
├── settings-notifications.tsx# client switches
├── settings-billing.tsx      # plan card + invoices table
└── __tests__/{dashboard-shell,customers-table}.test.tsx
app/(preview)/dashboard/
├── layout.tsx
├── page.tsx                  # Overview
├── analytics/page.tsx
├── customers/page.tsx
├── orders/page.tsx
└── settings/page.tsx
```

---

### Task 1: Types, formatters, fixtures and queries

**Files:**
- Create: `lib/dashboard/types.ts`, `lib/dashboard/format.ts`, `lib/dashboard/fixtures.ts`, `lib/dashboard/queries.ts`
- Test: `lib/dashboard/__tests__/format.test.ts`, `lib/dashboard/__tests__/queries.test.ts`

**Interfaces:**
- Produces (types):
  ```ts
  type CustomerStatus = "active" | "churned" | "trial"
  type OrderStatus = "paid" | "pending" | "refunded" | "failed"
  type Customer = { id: string; name: string; email: string; company: string; status: CustomerStatus; plan: "Free" | "Pro" | "Team"; lifetimeValue: number; createdMinutesAgo: number }
  type Product = { id: string; name: string; price: number; category: string }
  type OrderItem = { productId: string; quantity: number }
  type Order = { id: string; customerId: string; status: OrderStatus; items: OrderItem[]; channel: Channel; createdMinutesAgo: number }
  type Channel = "web" | "mobile" | "partner"
  type Activity = { id: string; actor: string; action: string; target: string; minutesAgo: number }
  type MonthlyMetric = { month: string; revenue: number; target: number; orders: number; signups: number; web: number; mobile: number; partner: number }
  type TeamMember = { id: string; name: string; email: string; role: "Owner" | "Admin" | "Member"; initials: string }
  type Invoice = { id: string; date: string; amount: number; status: "paid" | "due" }
  ```
- Produces (queries; all synchronous, `now` defaults to `new Date()`):
  ```ts
  getOverviewMetrics(): { revenue: number; revenueDelta: number; orders: number; ordersDelta: number; customers: number; customersDelta: number; conversion: number; conversionDelta: number; revenueSpark: number[]; ordersSpark: number[] }
  getMonthly(range: "3m" | "6m" | "12m"): MonthlyMetric[]
  getRecentOrders(limit?: number, now?: Date): OrderRow[]
  getOrders(now?: Date): OrderRow[]
  getOrderById(id: string, now?: Date): OrderRow | undefined
  getCustomers(now?: Date): CustomerRow[]
  getCustomerById(id: string, now?: Date): CustomerRow | undefined
  getActivity(now?: Date): (Activity & { at: Date })[]
  getTopProducts(): { product: Product; units: number; revenue: number }[]
  getTeam(): TeamMember[]
  getInvoices(): Invoice[]
  type OrderRow = Omit<Order, "createdMinutesAgo"> & { createdAt: Date; customerName: string; total: number; itemCount: number }
  type CustomerRow = Omit<Customer, "createdMinutesAgo"> & { createdAt: Date; initials: string; orderCount: number }
  ```
- Produces (format): `formatCurrency(n)`, `formatNumber(n)`, `formatPercent(n)`, `formatRelative(date, now?)`, `formatDate(date)`, `initialsOf(name)`.

- [x] **Step 1: Write the failing tests**

`lib/dashboard/__tests__/format.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { formatCurrency, formatDate, formatNumber, formatPercent, formatRelative, initialsOf } from "@/lib/dashboard/format"

describe("format helpers", () => {
  it("formats currency in USD without cents when whole", () => {
    expect(formatCurrency(1234)).toBe("$1,234")
    expect(formatCurrency(1234.5)).toBe("$1,234.50")
  })
  it("formats numbers and percents", () => {
    expect(formatNumber(1234567)).toBe("1,234,567")
    expect(formatPercent(3.456)).toBe("3.5%")
  })
  it("formats relative time", () => {
    const now = new Date("2026-09-05T12:00:00Z")
    expect(formatRelative(new Date("2026-09-05T11:59:30Z"), now)).toBe("just now")
    expect(formatRelative(new Date("2026-09-05T11:15:00Z"), now)).toBe("45m ago")
    expect(formatRelative(new Date("2026-09-05T09:00:00Z"), now)).toBe("3h ago")
    expect(formatRelative(new Date("2026-09-02T12:00:00Z"), now)).toBe("3d ago")
  })
  it("formats dates in a fixed locale", () => {
    expect(formatDate(new Date("2026-09-05T12:00:00Z"))).toBe("Sep 5, 2026")
  })
  it("derives initials", () => {
    expect(initialsOf("Jane Doe")).toBe("JD")
    expect(initialsOf("Cher")).toBe("C")
  })
})
```

`lib/dashboard/__tests__/queries.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  getCustomerById,
  getCustomers,
  getMonthly,
  getOrderById,
  getOrders,
  getOverviewMetrics,
  getRecentOrders,
  getTopProducts,
} from "@/lib/dashboard/queries"

const now = new Date("2026-09-05T12:00:00Z")

describe("dashboard queries", () => {
  it("has enough customers and orders to paginate", () => {
    expect(getCustomers(now).length).toBeGreaterThanOrEqual(24)
    expect(getOrders(now).length).toBeGreaterThanOrEqual(40)
  })

  it("materialises dates relative to now", () => {
    const [first] = getOrders(now)
    expect(first!.createdAt.getTime()).toBeLessThanOrEqual(now.getTime())
  })

  it("orders are sorted newest first and recent respects limit", () => {
    const orders = getOrders(now)
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1]!.createdAt.getTime()).toBeGreaterThanOrEqual(orders[i]!.createdAt.getTime())
    }
    expect(getRecentOrders(8, now)).toHaveLength(8)
  })

  it("computes order totals from products", () => {
    const order = getOrders(now).find((o) => o.itemCount > 1)!
    expect(order.total).toBeGreaterThan(0)
    expect(getOrderById(order.id, now)?.id).toBe(order.id)
  })

  it("joins customer names and order counts", () => {
    const customers = getCustomers(now)
    const withOrders = customers.find((c) => c.orderCount > 0)!
    expect(getCustomerById(withOrders.id, now)?.name).toBe(withOrders.name)
    const order = getOrders(now).find((o) => o.customerId === withOrders.id)!
    expect(order.customerName).toBe(withOrders.name)
  })

  it("slices monthly metrics by range", () => {
    expect(getMonthly("12m")).toHaveLength(12)
    expect(getMonthly("6m")).toHaveLength(6)
    expect(getMonthly("3m")).toHaveLength(3)
    expect(getMonthly("3m").at(-1)?.month).toBe(getMonthly("12m").at(-1)?.month)
  })

  it("overview metrics are positive and sparkline has 12 points", () => {
    const m = getOverviewMetrics()
    expect(m.revenue).toBeGreaterThan(0)
    expect(m.revenueSpark).toHaveLength(12)
  })

  it("top products are sorted by revenue", () => {
    const top = getTopProducts()
    expect(top.length).toBeGreaterThan(0)
    for (let i = 1; i < top.length; i++) expect(top[i - 1]!.revenue).toBeGreaterThanOrEqual(top[i]!.revenue)
  })
})
```

- [x] **Step 2: Run to verify they fail**

Run: `pnpm vitest run lib/dashboard`
Expected: FAIL, modules not found.

- [x] **Step 3: Types**

`lib/dashboard/types.ts`:

```ts
export type CustomerStatus = "active" | "churned" | "trial"
export type OrderStatus = "paid" | "pending" | "refunded" | "failed"
export type Channel = "web" | "mobile" | "partner"
export type Plan = "Free" | "Pro" | "Team"

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  status: CustomerStatus
  plan: Plan
  lifetimeValue: number
  createdMinutesAgo: number
}

export type Product = { id: string; name: string; price: number; category: string }
export type OrderItem = { productId: string; quantity: number }

export type Order = {
  id: string
  customerId: string
  status: OrderStatus
  items: OrderItem[]
  channel: Channel
  createdMinutesAgo: number
}

export type Activity = { id: string; actor: string; action: string; target: string; minutesAgo: number }

export type MonthlyMetric = {
  month: string
  revenue: number
  target: number
  orders: number
  signups: number
  web: number
  mobile: number
  partner: number
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Member"
  initials: string
}

export type Invoice = { id: string; date: string; amount: number; status: "paid" | "due" }

export type OrderRow = Omit<Order, "createdMinutesAgo"> & {
  createdAt: Date
  customerName: string
  total: number
  itemCount: number
}

export type CustomerRow = Omit<Customer, "createdMinutesAgo"> & {
  createdAt: Date
  initials: string
  orderCount: number
}
```

- [x] **Step 4: Formatters**

`lib/dashboard/format.ts`:

```ts
const currencyWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const currencyCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })
const number = new Intl.NumberFormat("en-US")
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export function formatCurrency(n: number): string {
  return Number.isInteger(n) ? currencyWhole.format(n) : currencyCents.format(n)
}

export function formatNumber(n: number): string {
  return number.format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function formatDate(d: Date): string {
  return date.format(d)
}

export function formatRelative(d: Date, now: Date = new Date()): string {
  const mins = Math.round((now.getTime() - d.getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")
}
```

- [x] **Step 5: Fixtures**

`lib/dashboard/fixtures.ts`. Customers, products, activity, monthly and team are hand-written. Orders are derived from those lists by a tiny fixed-seed generator kept in this file so the data is deterministic and committed without 40 hand-typed rows.

```ts
import type { Activity, Customer, Invoice, MonthlyMetric, Order, Product, TeamMember } from "./types"

export const customers: Customer[] = [
  { id: "cus_01", name: "Olivia Bennett", email: "olivia@northwind.io", company: "Northwind", status: "active", plan: "Team", lifetimeValue: 18420, createdMinutesAgo: 60 * 24 * 410 },
  { id: "cus_02", name: "Liam Carter", email: "liam@lumen.co", company: "Lumen", status: "active", plan: "Pro", lifetimeValue: 6240, createdMinutesAgo: 60 * 24 * 320 },
  { id: "cus_03", name: "Ava Nguyen", email: "ava@helio.dev", company: "Helio", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: 60 * 24 * 6 },
  { id: "cus_04", name: "Noah Patel", email: "noah@brightline.com", company: "Brightline", status: "active", plan: "Pro", lifetimeValue: 4110, createdMinutesAgo: 60 * 24 * 210 },
  { id: "cus_05", name: "Sophia Rossi", email: "sophia@vetra.app", company: "Vetra", status: "churned", plan: "Pro", lifetimeValue: 2980, createdMinutesAgo: 60 * 24 * 540 },
  { id: "cus_06", name: "Ethan Kim", email: "ethan@quill.so", company: "Quill", status: "active", plan: "Team", lifetimeValue: 22750, createdMinutesAgo: 60 * 24 * 700 },
  { id: "cus_07", name: "Isabella Moreau", email: "isabella@atlasworks.com", company: "Atlas Works", status: "active", plan: "Pro", lifetimeValue: 5890, createdMinutesAgo: 60 * 24 * 150 },
  { id: "cus_08", name: "Mason Okafor", email: "mason@fernhq.com", company: "Fern", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: 60 * 24 * 2 },
  { id: "cus_09", name: "Mia Fischer", email: "mia@stratus.fm", company: "Stratus", status: "active", plan: "Pro", lifetimeValue: 7320, createdMinutesAgo: 60 * 24 * 260 },
  { id: "cus_10", name: "Lucas Silva", email: "lucas@harbor.tools", company: "Harbor", status: "churned", plan: "Free", lifetimeValue: 340, createdMinutesAgo: 60 * 24 * 480 },
  { id: "cus_11", name: "Charlotte Dubois", email: "charlotte@meridianlabs.com", company: "Meridian Labs", status: "active", plan: "Team", lifetimeValue: 31200, createdMinutesAgo: 60 * 24 * 820 },
  { id: "cus_12", name: "James Walsh", email: "james@copperleaf.co", company: "Copperleaf", status: "active", plan: "Pro", lifetimeValue: 3990, createdMinutesAgo: 60 * 24 * 95 },
  { id: "cus_13", name: "Amelia Novak", email: "amelia@pinefield.org", company: "Pinefield", status: "active", plan: "Free", lifetimeValue: 620, createdMinutesAgo: 60 * 24 * 40 },
  { id: "cus_14", name: "Benjamin Adeyemi", email: "ben@ridgeline.ai", company: "Ridgeline", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: 60 * 24 * 1 },
  { id: "cus_15", name: "Harper Lindqvist", email: "harper@solace.health", company: "Solace", status: "active", plan: "Pro", lifetimeValue: 8460, createdMinutesAgo: 60 * 24 * 300 },
  { id: "cus_16", name: "Elijah Brooks", email: "elijah@tidewater.co", company: "Tidewater", status: "churned", plan: "Team", lifetimeValue: 12100, createdMinutesAgo: 60 * 24 * 610 },
  { id: "cus_17", name: "Evelyn Sato", email: "evelyn@kestrel.io", company: "Kestrel", status: "active", plan: "Pro", lifetimeValue: 5210, createdMinutesAgo: 60 * 24 * 180 },
  { id: "cus_18", name: "Henry Olsen", email: "henry@granite.build", company: "Granite", status: "active", plan: "Team", lifetimeValue: 27600, createdMinutesAgo: 60 * 24 * 760 },
  { id: "cus_19", name: "Abigail Reyes", email: "abigail@sunder.app", company: "Sunder", status: "active", plan: "Free", lifetimeValue: 180, createdMinutesAgo: 60 * 24 * 22 },
  { id: "cus_20", name: "Alexander Ivanov", email: "alex@orbitalpay.com", company: "Orbital Pay", status: "active", plan: "Pro", lifetimeValue: 9870, createdMinutesAgo: 60 * 24 * 350 },
  { id: "cus_21", name: "Emily Zhang", email: "emily@wavelength.fm", company: "Wavelength", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: 60 * 24 * 4 },
  { id: "cus_22", name: "Daniel Haddad", email: "daniel@cinderworks.com", company: "Cinderworks", status: "active", plan: "Pro", lifetimeValue: 4560, createdMinutesAgo: 60 * 24 * 130 },
  { id: "cus_23", name: "Ella Thompson", email: "ella@fable.studio", company: "Fable Studio", status: "active", plan: "Team", lifetimeValue: 15900, createdMinutesAgo: 60 * 24 * 450 },
  { id: "cus_24", name: "Sebastian Costa", email: "seb@verdant.farm", company: "Verdant", status: "churned", plan: "Pro", lifetimeValue: 1720, createdMinutesAgo: 60 * 24 * 390 },
]

export const products: Product[] = [
  { id: "prd_01", name: "Starter Plan", price: 29, category: "Subscription" },
  { id: "prd_02", name: "Pro Plan", price: 79, category: "Subscription" },
  { id: "prd_03", name: "Team Plan", price: 249, category: "Subscription" },
  { id: "prd_04", name: "Extra Seat", price: 15, category: "Add-on" },
  { id: "prd_05", name: "Priority Support", price: 120, category: "Add-on" },
  { id: "prd_06", name: "Onboarding Session", price: 450, category: "Services" },
  { id: "prd_07", name: "API Overage (10k)", price: 40, category: "Usage" },
  { id: "prd_08", name: "Storage 100GB", price: 25, category: "Usage" },
]

// Fixed-seed LCG so orders are deterministic but not hand-typed.
function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const statuses: Order["status"][] = ["paid", "paid", "paid", "paid", "pending", "paid", "refunded", "paid", "failed", "paid"]
const channels: Order["channel"][] = ["web", "web", "mobile", "web", "partner", "mobile"]

export const orders: Order[] = (() => {
  const rand = seeded(20260905)
  const list: Order[] = []
  for (let i = 0; i < 40; i++) {
    const customer = customers[Math.floor(rand() * customers.length)]!
    const itemCount = 1 + Math.floor(rand() * 3)
    const items = Array.from({ length: itemCount }, () => ({
      productId: products[Math.floor(rand() * products.length)]!.id,
      quantity: 1 + Math.floor(rand() * 3),
    }))
    list.push({
      id: `ord_${String(1041 + i)}`,
      customerId: customer.id,
      status: statuses[Math.floor(rand() * statuses.length)]!,
      items,
      channel: channels[Math.floor(rand() * channels.length)]!,
      createdMinutesAgo: Math.floor(rand() * 60 * 24 * 30) + 5,
    })
  }
  return list
})()

export const activity: Activity[] = [
  { id: "act_01", actor: "Olivia Bennett", action: "upgraded to", target: "Team plan", minutesAgo: 12 },
  { id: "act_02", actor: "Mason Okafor", action: "started a trial of", target: "Pro plan", minutesAgo: 48 },
  { id: "act_03", actor: "Liam Carter", action: "added", target: "2 extra seats", minutesAgo: 60 * 3 },
  { id: "act_04", actor: "System", action: "processed payout", target: "$12,480.00", minutesAgo: 60 * 5 },
  { id: "act_05", actor: "Sophia Rossi", action: "cancelled", target: "Pro subscription", minutesAgo: 60 * 9 },
  { id: "act_06", actor: "Henry Olsen", action: "purchased", target: "Onboarding Session", minutesAgo: 60 * 14 },
  { id: "act_07", actor: "Ava Nguyen", action: "invited", target: "3 teammates", minutesAgo: 60 * 26 },
  { id: "act_08", actor: "Charlotte Dubois", action: "renewed", target: "Team plan", minutesAgo: 60 * 30 },
  { id: "act_09", actor: "System", action: "flagged failed payment for", target: "Harbor", minutesAgo: 60 * 41 },
  { id: "act_10", actor: "Emily Zhang", action: "started a trial of", target: "Starter plan", minutesAgo: 60 * 52 },
]

export const monthly: MonthlyMetric[] = [
  { month: "Oct", revenue: 61200, target: 60000, orders: 412, signups: 138, web: 36000, mobile: 15200, partner: 10000 },
  { month: "Nov", revenue: 64800, target: 62000, orders: 437, signups: 152, web: 37900, mobile: 16400, partner: 10500 },
  { month: "Dec", revenue: 72400, target: 65000, orders: 489, signups: 171, web: 41000, mobile: 19400, partner: 12000 },
  { month: "Jan", revenue: 58900, target: 66000, orders: 398, signups: 129, web: 34500, mobile: 14900, partner: 9500 },
  { month: "Feb", revenue: 63300, target: 67000, orders: 421, signups: 144, web: 36800, mobile: 16000, partner: 10500 },
  { month: "Mar", revenue: 69800, target: 68000, orders: 466, signups: 163, web: 40200, mobile: 18100, partner: 11500 },
  { month: "Apr", revenue: 74100, target: 70000, orders: 495, signups: 177, web: 42600, mobile: 19500, partner: 12000 },
  { month: "May", revenue: 77600, target: 72000, orders: 518, signups: 189, web: 44300, mobile: 20800, partner: 12500 },
  { month: "Jun", revenue: 81200, target: 74000, orders: 541, signups: 196, web: 46100, mobile: 22100, partner: 13000 },
  { month: "Jul", revenue: 79400, target: 76000, orders: 529, signups: 184, web: 45000, mobile: 21400, partner: 13000 },
  { month: "Aug", revenue: 86900, target: 78000, orders: 574, signups: 211, web: 49200, mobile: 24200, partner: 13500 },
  { month: "Sep", revenue: 91300, target: 80000, orders: 602, signups: 226, web: 51600, mobile: 25700, partner: 14000 },
]

export const team: TeamMember[] = [
  { id: "usr_01", name: "Jane Doe", email: "jane@acme.com", role: "Owner", initials: "JD" },
  { id: "usr_02", name: "Marcus Lee", email: "marcus@acme.com", role: "Admin", initials: "ML" },
  { id: "usr_03", name: "Priya Raman", email: "priya@acme.com", role: "Member", initials: "PR" },
  { id: "usr_04", name: "Tom Becker", email: "tom@acme.com", role: "Member", initials: "TB" },
]

export const invoices: Invoice[] = [
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: 249, status: "due" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: 249, status: "paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: 249, status: "paid" },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: 199, status: "paid" },
]
```

- [x] **Step 6: Queries**

`lib/dashboard/queries.ts`:

```ts
import { initialsOf } from "./format"
import { activity, customers, invoices, monthly, orders, products, team } from "./fixtures"
import type { Activity, CustomerRow, Invoice, MonthlyMetric, OrderRow, Product, TeamMember } from "./types"

export type MonthlyRange = "3m" | "6m" | "12m"

const productById = new Map(products.map((p) => [p.id, p]))
const customerById = new Map(customers.map((c) => [c.id, c]))

function minutesAgo(now: Date, mins: number): Date {
  return new Date(now.getTime() - mins * 60000)
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getMonthly(range: MonthlyRange): MonthlyMetric[] {
  const n = range === "3m" ? 3 : range === "6m" ? 6 : 12
  return monthly.slice(-n)
}

export function getOverviewMetrics() {
  const cur = monthly[monthly.length - 1]!
  const prev = monthly[monthly.length - 2]!
  const activeCustomers = customers.filter((c) => c.status === "active").length
  const conversion = (cur.orders / (cur.signups * 10)) * 100
  const prevConversion = (prev.orders / (prev.signups * 10)) * 100
  return {
    revenue: cur.revenue,
    revenueDelta: pctChange(cur.revenue, prev.revenue),
    orders: cur.orders,
    ordersDelta: pctChange(cur.orders, prev.orders),
    customers: activeCustomers,
    customersDelta: pctChange(activeCustomers, activeCustomers - 2),
    conversion,
    conversionDelta: pctChange(conversion, prevConversion),
    revenueSpark: monthly.map((m) => m.revenue),
    ordersSpark: monthly.map((m) => m.orders),
  }
}

export function getOrders(now: Date = new Date()): OrderRow[] {
  return orders
    .map<OrderRow>(({ createdMinutesAgo, ...o }) => ({
      ...o,
      createdAt: minutesAgo(now, createdMinutesAgo),
      customerName: customerById.get(o.customerId)?.name ?? "Unknown",
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
      total: o.items.reduce((sum, i) => sum + (productById.get(i.productId)?.price ?? 0) * i.quantity, 0),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getRecentOrders(limit = 8, now: Date = new Date()): OrderRow[] {
  return getOrders(now).slice(0, limit)
}

export function getOrderById(id: string, now: Date = new Date()): OrderRow | undefined {
  return getOrders(now).find((o) => o.id === id)
}

export function getCustomers(now: Date = new Date()): CustomerRow[] {
  const counts = new Map<string, number>()
  for (const o of orders) counts.set(o.customerId, (counts.get(o.customerId) ?? 0) + 1)
  return customers.map<CustomerRow>(({ createdMinutesAgo, ...c }) => ({
    ...c,
    createdAt: minutesAgo(now, createdMinutesAgo),
    initials: initialsOf(c.name),
    orderCount: counts.get(c.id) ?? 0,
  }))
}

export function getCustomerById(id: string, now: Date = new Date()): CustomerRow | undefined {
  return getCustomers(now).find((c) => c.id === id)
}

export function getActivity(now: Date = new Date()): (Activity & { at: Date })[] {
  return activity.map((a) => ({ ...a, at: minutesAgo(now, a.minutesAgo) }))
}

export function getTopProducts(): { product: Product; units: number; revenue: number }[] {
  const agg = new Map<string, { units: number; revenue: number }>()
  for (const o of orders) {
    if (o.status !== "paid") continue
    for (const i of o.items) {
      const p = productById.get(i.productId)
      if (!p) continue
      const cur = agg.get(p.id) ?? { units: 0, revenue: 0 }
      agg.set(p.id, { units: cur.units + i.quantity, revenue: cur.revenue + p.price * i.quantity })
    }
  }
  return [...agg.entries()]
    .map(([id, v]) => ({ product: productById.get(id)!, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

export function getTeam(): TeamMember[] {
  return team
}

export function getInvoices(): Invoice[] {
  return invoices
}

export { products }
```

- [x] **Step 7: Run to verify tests pass**

Run: `pnpm vitest run lib/dashboard`
Expected: 13 passed. If `formatCurrency(1234)` yields `$1,234.00`, keep the two formatters as written; the whole-number path uses `maximumFractionDigits: 0`.

- [x] **Step 8: Commit**

```bash
git add lib/dashboard
git commit -m "feat(dashboard): types, fixtures, formatters and queries"
```

---

### Task 2: Shell, layout, overview page, registry item, preview link

**Files:**
- Create: `components/dashboard/dashboard-shell.tsx`, `components/dashboard/status-badge.tsx`, `components/dashboard/revenue-chart.tsx`, `components/dashboard/recent-orders-table.tsx`, `components/dashboard/activity-feed.tsx`, `app/(preview)/dashboard/layout.tsx`, `app/(preview)/dashboard/page.tsx`
- Test: `components/dashboard/__tests__/dashboard-shell.test.tsx`
- Modify: `registry.json`, `app/(site)/page.tsx`

**Interfaces:**
- Consumes: `AppShell`, `StatCard`, `ChartCard`, `DataTable` family, `PageHeader`; queries from Task 1.
- Produces:
  ```ts
  export function DashboardShell({ children }: { children: React.ReactNode }): JSX.Element
  export function breadcrumbsFor(pathname: string): { label: string; href?: string }[]
  export function StatusBadge({ status }: { status: OrderStatus | CustomerStatus }): JSX.Element
  export function RevenueChart({ data }: { data: MonthlyMetric[] }): JSX.Element   // range tabs are internal state; parent passes 12m data
  export function RecentOrdersTable({ orders }: { orders: OrderRow[] }): JSX.Element
  export function ActivityFeed({ items }: { items: (Activity & { at: Date })[] }): JSX.Element
  ```

- [x] **Step 1: Write the failing shell test**

`components/dashboard/__tests__/dashboard-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/customers" }))

import { DashboardShell, breadcrumbsFor } from "@/components/dashboard/dashboard-shell"
import { ThemeProvider } from "@/components/blocks/theme-provider"

describe("breadcrumbsFor", () => {
  it("maps paths to crumbs", () => {
    expect(breadcrumbsFor("/dashboard")).toEqual([{ label: "Dashboard" }])
    expect(breadcrumbsFor("/dashboard/customers")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers" },
    ])
  })
})

describe("DashboardShell", () => {
  it("renders nav and children", () => {
    render(
      <ThemeProvider>
        <DashboardShell>
          <p>inner</p>
        </DashboardShell>
      </ThemeProvider>,
    )
    expect(screen.getByText("inner")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Analytics/ })).toHaveAttribute("href", "/dashboard/analytics")
  })
})
```

- [x] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/dashboard`
Expected: FAIL, module not found.

- [x] **Step 3: Shell and status badge**

`components/dashboard/dashboard-shell.tsx`:

```tsx
"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"

const nav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    ],
  },
  { items: [{ title: "Settings", href: "/dashboard/settings", icon: Settings }] },
]

const titles: Record<string, string> = {
  analytics: "Analytics",
  customers: "Customers",
  orders: "Orders",
  settings: "Settings",
}

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "Dashboard" }]
  return [
    { label: "Dashboard", href: "/dashboard" },
    ...segments.map((s) => ({ label: titles[s] ?? s })),
  ]
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      brand={{ name: "Acme", href: "/dashboard" }}
      nav={nav}
      user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
      breadcrumbs={breadcrumbsFor(pathname)}
      currentPath={pathname}
    >
      {children}
    </AppShell>
  )
}
```

`components/dashboard/status-badge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import type { CustomerStatus, OrderStatus } from "@/lib/dashboard/types"

const variants: Record<OrderStatus | CustomerStatus, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  active: "default",
  pending: "secondary",
  trial: "secondary",
  refunded: "outline",
  churned: "outline",
  failed: "destructive",
}

export function StatusBadge({ status }: { status: OrderStatus | CustomerStatus }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  )
}
```

- [x] **Step 4: Overview widgets**

`components/dashboard/revenue-chart.tsx`:

```tsx
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
}
const ranges = [
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "12m", label: "12m" },
]

export function RevenueChart({ data }: { data: MonthlyMetric[] }) {
  const [range, setRange] = React.useState("12m")
  const n = range === "3m" ? 3 : range === "6m" ? 6 : 12
  const slice = data.slice(-n)
  return (
    <ChartCard title="Revenue" description="Monthly revenue against target" ranges={ranges} range={range} onRangeChange={setRange} config={config}>
      <AreaChart data={slice} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="target" stroke="var(--color-target)" fill="var(--color-target)" fillOpacity={0.08} strokeDasharray="4 4" />
        <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.2} />
      </AreaChart>
    </ChartCard>
  )
}
```

`components/dashboard/recent-orders-table.tsx`:

```tsx
"use client"

import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatRelative } from "@/lib/dashboard/format"
import type { OrderRow } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<OrderRow>()
const columns = h.columns([
  h.accessor("id", { header: "Order", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span> }),
  h.accessor("customerName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> }),
  h.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> }),
  h.accessor("total", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
  }),
  h.accessor("createdAt", {
    header: "When",
    cell: ({ getValue }) => <span className="text-muted-foreground" suppressHydrationWarning>{formatRelative(getValue())}</span>,
  }),
])

export function RecentOrdersTable({ orders }: { orders: OrderRow[] }) {
  return <DataTable columns={columns} data={orders} pageSize={8} getRowId={(o) => o.id} />
}
```

`components/dashboard/activity-feed.tsx`:

```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRelative, initialsOf } from "@/lib/dashboard/format"
import type { Activity } from "@/lib/dashboard/types"

export function ActivityFeed({ items }: { items: (Activity & { at: Date })[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Latest account events</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{a.actor === "System" ? "SY" : initialsOf(a.actor)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 gap-0.5 text-sm">
              <p>
                <span className="font-medium">{a.actor}</span> {a.action}{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <time className="text-xs text-muted-foreground" dateTime={a.at.toISOString()} suppressHydrationWarning>
                {formatRelative(a.at)}
              </time>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [x] **Step 5: Layout and overview page**

`app/(preview)/dashboard/layout.tsx`:

```tsx
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
```

`app/(preview)/dashboard/page.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/dashboard/format"
import { getActivity, getMonthly, getOverviewMetrics, getRecentOrders } from "@/lib/dashboard/queries"

export default function OverviewPage() {
  const m = getOverviewMetrics()
  return (
    <>
      <PageHeader title="Overview" description="Key metrics for the current month." actions={<Button variant="outline">Download report</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(m.revenue)} delta={m.revenueDelta} deltaLabel="vs last month" sparkline={m.revenueSpark} />
        <StatCard label="Orders" value={formatNumber(m.orders)} delta={m.ordersDelta} deltaLabel="vs last month" sparkline={m.ordersSpark} />
        <StatCard label="Active customers" value={formatNumber(m.customers)} delta={m.customersDelta} deltaLabel="vs last month" />
        <StatCard label="Conversion" value={formatPercent(m.conversion)} delta={m.conversionDelta} deltaLabel="vs last month" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={getMonthly("12m")} />
        </div>
        <ActivityFeed items={getActivity()} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>The latest orders across all channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={getRecentOrders(16)} />
        </CardContent>
      </Card>
    </>
  )
}
```

- [x] **Step 6: Run shell test, typecheck, and view**

Run: `pnpm vitest run components/dashboard && pnpm typecheck`
Expected: 2 passed, typecheck clean.

With `pnpm dev` running, open `http://localhost:3000/dashboard`. Expect the sidebar with five links, four stat cards, the revenue chart with 3m/6m/12m tabs, the activity feed, and a paginated recent orders table.

- [x] **Step 7: Register the item and link the preview**

Add to `registry.json` `items` (files will grow in later tasks):

```json
{
  "name": "dashboard",
  "type": "registry:block",
  "title": "Admin Dashboard",
  "description": "Overview, analytics, customers, orders and settings pages on the app shell, with typed mock data.",
  "dependencies": ["lucide-react", "recharts", "@tanstack/react-table"],
  "registryDependencies": [
    "button", "card", "badge", "avatar", "input", "label", "select", "sheet", "tabs", "switch", "dialog", "separator", "table",
    "@kit/app-shell", "@kit/page-header", "@kit/stat-card", "@kit/chart-card", "@kit/data-table", "@kit/empty-state"
  ],
  "files": [
    { "path": "app/(preview)/dashboard/layout.tsx", "type": "registry:page", "target": "app/dashboard/layout.tsx" },
    { "path": "app/(preview)/dashboard/page.tsx", "type": "registry:page", "target": "app/dashboard/page.tsx" },
    { "path": "components/dashboard/dashboard-shell.tsx", "type": "registry:component", "target": "components/dashboard/dashboard-shell.tsx" },
    { "path": "components/dashboard/status-badge.tsx", "type": "registry:component", "target": "components/dashboard/status-badge.tsx" },
    { "path": "components/dashboard/revenue-chart.tsx", "type": "registry:component", "target": "components/dashboard/revenue-chart.tsx" },
    { "path": "components/dashboard/recent-orders-table.tsx", "type": "registry:component", "target": "components/dashboard/recent-orders-table.tsx" },
    { "path": "components/dashboard/activity-feed.tsx", "type": "registry:component", "target": "components/dashboard/activity-feed.tsx" },
    { "path": "lib/dashboard/types.ts", "type": "registry:lib", "target": "lib/dashboard/types.ts" },
    { "path": "lib/dashboard/format.ts", "type": "registry:lib", "target": "lib/dashboard/format.ts" },
    { "path": "lib/dashboard/fixtures.ts", "type": "registry:lib", "target": "lib/dashboard/fixtures.ts" },
    { "path": "lib/dashboard/queries.ts", "type": "registry:lib", "target": "lib/dashboard/queries.ts" }
  ]
}
```

In `app/(site)/page.tsx`, change the dashboard entry to `status: "ready"` and add `href: "/dashboard"`; give the other three `href: undefined`. Render a "View demo" link button when `href` is set:

```tsx
{t.href ? (
  <Button asChild variant="outline" size="sm" className="mt-3">
    <Link href={t.href}>View demo</Link>
  </Button>
) : null}
```

(import `Link` from `next/link` and `Button` from `@/components/ui/button`; the `templates` array loses `as const` and gains `href?: string` typing via an explicit `type Template = { name: string; title: string; description: string; status: string; href?: string }`.)

Run: `pnpm registry:check && pnpm lint`
Expected: `registry ok: 12 items`, lint clean.

- [x] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(dashboard): shell, overview page and registry item"
```

---

### Task 3: Analytics page

**Files:**
- Create: `components/dashboard/channels-chart.tsx`, `components/dashboard/signups-chart.tsx`, `components/dashboard/top-products.tsx`, `app/(preview)/dashboard/analytics/page.tsx`
- Modify: `registry.json` (add four files)

**Interfaces:**
- Produces: `ChannelsChart({ data: MonthlyMetric[] })`, `SignupsChart({ data: MonthlyMetric[] })`, `TopProducts({ items: ReturnType<typeof getTopProducts> })`.

- [x] **Step 1: Charts**

`components/dashboard/channels-chart.tsx`:

```tsx
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  web: { label: "Web", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  partner: { label: "Partner", color: "var(--chart-3)" },
}
const ranges = [
  { value: "6m", label: "6m" },
  { value: "12m", label: "12m" },
]

export function ChannelsChart({ data }: { data: MonthlyMetric[] }) {
  const [range, setRange] = React.useState("12m")
  const slice = data.slice(range === "6m" ? -6 : -12)
  return (
    <ChartCard title="Revenue by channel" description="Stacked by acquisition channel" ranges={ranges} range={range} onRangeChange={setRange} config={config}>
      <BarChart data={slice}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="web" stackId="a" fill="var(--color-web)" />
        <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" />
        <Bar dataKey="partner" stackId="a" fill="var(--color-partner)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  )
}
```

`components/dashboard/signups-chart.tsx`:

```tsx
"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  signups: { label: "Signups", color: "var(--chart-4)" },
  orders: { label: "Orders", color: "var(--chart-5)" },
}

export function SignupsChart({ data }: { data: MonthlyMetric[] }) {
  return (
    <ChartCard title="Signups and orders" description="Monthly counts" config={config}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="signups" stroke="var(--color-signups)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartCard>
  )
}
```

`components/dashboard/top-products.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/dashboard/format"
import type { getTopProducts } from "@/lib/dashboard/queries"

export function TopProducts({ items }: { items: ReturnType<typeof getTopProducts> }) {
  const max = items[0]?.revenue ?? 1
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>By paid revenue in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map(({ product, units, revenue }) => (
          <div key={product.id} className="grid gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{product.name}</span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <span className="tabular-nums">{formatCurrency(revenue)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(4, (revenue / max) * 100)}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">{formatNumber(units)} units</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

- [x] **Step 2: Page**

`app/(preview)/dashboard/analytics/page.tsx`:

```tsx
import { PageHeader } from "@/components/blocks/page-header"
import { ChannelsChart } from "@/components/dashboard/channels-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { SignupsChart } from "@/components/dashboard/signups-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { getMonthly, getTopProducts } from "@/lib/dashboard/queries"

export default function AnalyticsPage() {
  const data = getMonthly("12m")
  return (
    <>
      <PageHeader title="Analytics" description="Trends across revenue, channels and growth." />
      <div className="grid gap-4 xl:grid-cols-2">
        <RevenueChart data={data} />
        <ChannelsChart data={data} />
        <SignupsChart data={data} />
        <TopProducts items={getTopProducts()} />
      </div>
    </>
  )
}
```

- [x] **Step 3: Register files, verify**

Add to the `dashboard` item's `files`:

```json
{ "path": "app/(preview)/dashboard/analytics/page.tsx", "type": "registry:page", "target": "app/dashboard/analytics/page.tsx" },
{ "path": "components/dashboard/channels-chart.tsx", "type": "registry:component", "target": "components/dashboard/channels-chart.tsx" },
{ "path": "components/dashboard/signups-chart.tsx", "type": "registry:component", "target": "components/dashboard/signups-chart.tsx" },
{ "path": "components/dashboard/top-products.tsx", "type": "registry:component", "target": "components/dashboard/top-products.tsx" }
```

Run: `pnpm registry:check && pnpm typecheck && pnpm lint`
Expected: all clean. Open `http://localhost:3000/dashboard/analytics`: four cards in a 2x2 grid.

- [x] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(dashboard): analytics page"
```

---

### Task 4: Customers page with detail sheet

**Files:**
- Create: `components/dashboard/customers-table.tsx`, `app/(preview)/dashboard/customers/page.tsx`
- Test: `components/dashboard/__tests__/customers-table.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces: `CustomersTable({ customers: CustomerRow[]; orders: OrderRow[] })`. Search filters by name, email, company (case-insensitive). Status `Select` with "all" default. Clicking a row opens a `Sheet` with the customer's details and their orders.

- [x] **Step 1: Write the failing test**

`components/dashboard/__tests__/customers-table.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { CustomersTable } from "@/components/dashboard/customers-table"
import { getCustomers, getOrders } from "@/lib/dashboard/queries"

const now = new Date("2026-09-05T12:00:00Z")

function rows() {
  const [, body] = within(screen.getByRole("table")).getAllByRole("rowgroup")
  return within(body!).getAllByRole("row")
}

describe("CustomersTable", () => {
  it("filters by search text", async () => {
    render(<CustomersTable customers={getCustomers(now)} orders={getOrders(now)} />)
    await userEvent.type(screen.getByPlaceholderText(/search/i), "northwind")
    expect(rows()).toHaveLength(1)
    expect(within(rows()[0]!).getByText("Olivia Bennett")).toBeInTheDocument()
  })

  it("opens a detail sheet on row click", async () => {
    render(<CustomersTable customers={getCustomers(now)} orders={getOrders(now)} />)
    await userEvent.click(screen.getByText("Olivia Bennett"))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("olivia@northwind.io")).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run to verify it fails**

Run: `pnpm vitest run components/dashboard/__tests__/customers-table.test.tsx`
Expected: FAIL, module not found.

- [x] **Step 3: Implement**

`components/dashboard/customers-table.tsx`:

```tsx
"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatRelative } from "@/lib/dashboard/format"
import type { CustomerRow, CustomerStatus, OrderRow } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<CustomerRow>()

export function CustomersTable({ customers, orders }: { customers: CustomerRow[]; orders: OrderRow[] }) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<CustomerStatus | "all">("all")
  const [selected, setSelected] = React.useState<CustomerRow | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (q === "" || [c.name, c.email, c.company].some((v) => v.toLowerCase().includes(q))),
    )
  }, [customers, query, status])

  const columns = React.useMemo(
    () =>
      h.columns([
        h.accessor("name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
          cell: ({ row }) => (
            <button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelected(row.original)}>
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{row.original.initials}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
              </div>
            </button>
          ),
        }),
        h.accessor("company", { header: ({ column }) => <DataTableColumnHeader column={column} title="Company" /> }),
        h.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> }),
        h.accessor("plan", { header: "Plan", cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge> }),
        h.accessor("orderCount", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
        }),
        h.accessor("lifetimeValue", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Lifetime value" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
        }),
        h.accessor("createdAt", {
          header: "Joined",
          cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
        }),
      ]),
    [],
  )

  const customerOrders = selected ? orders.filter((o) => o.customerId === selected.id) : []

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(c) => c.id}
        emptyMessage="No customers match your filters."
        toolbar={
          <div className="flex items-center gap-2">
            <Input placeholder="Search customers…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-64" />
            <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "all")}>
              <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>{selected.initials}</AvatarFallback>
                  </Avatar>
                  {selected.name}
                </SheetTitle>
                <SheetDescription>{selected.email}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company" value={selected.company} />
                  <Field label="Plan" value={selected.plan} />
                  <Field label="Status" value={<StatusBadge status={selected.status} />} />
                  <Field label="Lifetime value" value={formatCurrency(selected.lifetimeValue)} />
                  <Field label="Joined" value={formatDate(selected.createdAt)} />
                  <Field label="Orders" value={String(selected.orderCount)} />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <div className="font-medium">Recent orders</div>
                  {customerOrders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet.</p>
                  ) : (
                    customerOrders.slice(0, 6).map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="grid">
                          <span className="font-mono text-xs">{o.id}</span>
                          <span className="text-xs text-muted-foreground" suppressHydrationWarning>{formatRelative(o.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          <span className="tabular-nums">{formatCurrency(o.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
```

`app/(preview)/dashboard/customers/page.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { CustomersTable } from "@/components/dashboard/customers-table"
import { getCustomers, getOrders } from "@/lib/dashboard/queries"

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" description="Everyone who has an account." actions={<Button>Add customer</Button>} />
      <CustomersTable customers={getCustomers()} orders={getOrders()} />
    </>
  )
}
```

- [x] **Step 4: Run to verify it passes**

Run: `pnpm vitest run components/dashboard/__tests__/customers-table.test.tsx`
Expected: 2 passed. If the Radix `Select` throws about `hasPointerCapture` in jsdom, add to `vitest.setup.ts`:

```ts
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
}
```

- [x] **Step 5: Register files and commit**

Add to the `dashboard` item's `files`:

```json
{ "path": "app/(preview)/dashboard/customers/page.tsx", "type": "registry:page", "target": "app/dashboard/customers/page.tsx" },
{ "path": "components/dashboard/customers-table.tsx", "type": "registry:component", "target": "components/dashboard/customers-table.tsx" }
```

Run: `pnpm registry:check && pnpm typecheck && pnpm lint`

```bash
git add -A
git commit -m "feat(dashboard): customers page with detail sheet"
```

---

### Task 5: Orders page with detail sheet

**Files:**
- Create: `components/dashboard/orders-table.tsx`, `app/(preview)/dashboard/orders/page.tsx`
- Modify: `registry.json`

**Interfaces:**
- Produces: `OrdersTable({ orders: OrderRow[]; products: Product[] })`. Status `Select` filter, row select column, sheet shows line items with product names and totals.

- [x] **Step 1: Implement**

`components/dashboard/orders-table.tsx`:

```tsx
"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTable, DataTableColumnHeader, DataTableSelectColumn, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatRelative } from "@/lib/dashboard/format"
import type { OrderRow, OrderStatus, Product } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<OrderRow>()

export function OrdersTable({ orders, products }: { orders: OrderRow[]; products: Product[] }) {
  const [status, setStatus] = React.useState<OrderStatus | "all">("all")
  const [selected, setSelected] = React.useState<OrderRow | null>(null)
  const productById = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const filtered = status === "all" ? orders : orders.filter((o) => o.status === status)

  const columns = React.useMemo(
    () =>
      h.columns([
        DataTableSelectColumn<OrderRow>(),
        h.accessor("id", {
          header: "Order",
          cell: ({ row }) => (
            <button type="button" className="font-mono text-xs underline-offset-4 hover:underline" onClick={() => setSelected(row.original)}>
              {row.original.id}
            </button>
          ),
        }),
        h.accessor("customerName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> }),
        h.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusBadge status={getValue()} /> }),
        h.accessor("channel", { header: "Channel", cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{getValue()}</Badge> }),
        h.accessor("itemCount", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Items" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
        }),
        h.accessor("total", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
        }),
        h.accessor("createdAt", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
          cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
        }),
      ]),
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(o) => o.id}
        emptyMessage="No orders with this status."
        toolbar={
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")}>
            <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.id}</SheetTitle>
                <SheetDescription suppressHydrationWarning>
                  {selected.customerName} · {formatRelative(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline" className="capitalize">{selected.channel}</Badge>
                </div>
                <Separator />
                <div className="grid gap-2">
                  {selected.items.map((item, i) => {
                    const p = productById.get(item.productId)
                    return (
                      <div key={`${item.productId}-${i}`} className="flex items-center justify-between">
                        <span>
                          {p?.name ?? item.productId} <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                        <span className="tabular-nums">{formatCurrency((p?.price ?? 0) * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(selected.total)}</span>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
```

`app/(preview)/dashboard/orders/page.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { OrdersTable } from "@/components/dashboard/orders-table"
import { getOrders, products } from "@/lib/dashboard/queries"

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Orders" description="All orders from the last 30 days." actions={<Button variant="outline">Export CSV</Button>} />
      <OrdersTable orders={getOrders()} products={products} />
    </>
  )
}
```

- [x] **Step 2: Register files, verify, commit**

Add to the `dashboard` item's `files`:

```json
{ "path": "app/(preview)/dashboard/orders/page.tsx", "type": "registry:page", "target": "app/dashboard/orders/page.tsx" },
{ "path": "components/dashboard/orders-table.tsx", "type": "registry:component", "target": "components/dashboard/orders-table.tsx" }
```

Run: `pnpm registry:check && pnpm typecheck && pnpm lint`. Open `http://localhost:3000/dashboard/orders`, click an order id, confirm the sheet lists line items.

```bash
git add -A
git commit -m "feat(dashboard): orders page with detail sheet"
```

---

### Task 6: Settings page

**Files:**
- Create: `components/dashboard/settings-profile.tsx`, `components/dashboard/settings-team.tsx`, `components/dashboard/settings-notifications.tsx`, `components/dashboard/settings-billing.tsx`, `app/(preview)/dashboard/settings/page.tsx`
- Modify: `registry.json`

- [x] **Step 1: Profile form**

`components/dashboard/settings-profile.tsx`:

```tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SettingsProfile() {
  const [saved, setSaved] = React.useState(false)
  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
      >
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-lg">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue="Jane Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue="jane@acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={3} defaultValue="Head of Operations at Acme." />
          </div>
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit">Save changes</Button>
          {saved ? <span className="text-sm text-muted-foreground">Saved</span> : null}
        </CardFooter>
      </form>
    </Card>
  )
}
```

- [x] **Step 2: Team**

`components/dashboard/settings-team.tsx`:

```tsx
"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { initialsOf } from "@/lib/dashboard/format"
import type { TeamMember } from "@/lib/dashboard/types"

export function SettingsTeam({ members: initial }: { members: TeamMember[] }) {
  const [members, setMembers] = React.useState(initial)
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<TeamMember["role"]>("Member")

  const invite = () => {
    const name = email.split("@")[0]?.replace(/[._-]/g, " ") ?? "New member"
    setMembers((m) => [...m, { id: `usr_${Date.now()}`, name, email, role, initials: initialsOf(name) }])
    setEmail("")
    setOpen(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Team</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Invite member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They will receive an email with a link to join.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as TeamMember["role"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={invite} disabled={!email.includes("@")}>Send invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8"><AvatarFallback className="text-xs">{m.initials}</AvatarFallback></Avatar>
                    <div className="grid">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {m.role === "Owner" ? (
                    <span className="text-sm">Owner</span>
                  ) : (
                    <Select value={m.role} onValueChange={(v) => setMembers((list) => list.map((x) => (x.id === m.id ? { ...x, role: v as TeamMember["role"] } : x)))}>
                      <SelectTrigger className="h-8 w-32" aria-label={`Role for ${m.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {m.role !== "Owner" ? (
                    <Button variant="ghost" size="sm" onClick={() => setMembers((list) => list.filter((x) => x.id !== m.id))}>Remove</Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

- [x] **Step 3: Notifications and billing**

`components/dashboard/settings-notifications.tsx`:

```tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const items = [
  { id: "orders", label: "New orders", description: "Get notified when an order is placed." },
  { id: "payments", label: "Failed payments", description: "Alerts for declined or failed charges." },
  { id: "signups", label: "New signups", description: "A daily digest of new accounts." },
  { id: "product", label: "Product updates", description: "News about features and improvements." },
]

export function SettingsNotifications() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({ orders: true, payments: true, signups: false, product: true })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about by email.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 ? <Separator /> : null}
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor={`notif-${item.id}`}>{item.label}</Label>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
              <Switch id={`notif-${item.id}`} checked={enabled[item.id] ?? false} onCheckedChange={(v) => setEnabled((e) => ({ ...e, [item.id]: v }))} />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
```

`components/dashboard/settings-billing.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/dashboard/format"
import type { Invoice } from "@/lib/dashboard/types"

export function SettingsBilling({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>You are on the Team plan, billed monthly.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatCurrency(249)}</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <p className="text-muted-foreground">Includes 10 seats, priority support and 1TB storage.</p>
          <p className="text-muted-foreground">Payment method: Visa ending in 4242.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Change plan</Button>
          <Button variant="ghost">Update payment method</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Your billing history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell><Badge variant={inv.status === "due" ? "secondary" : "outline"} className="capitalize">{inv.status}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [x] **Step 4: Page**

`app/(preview)/dashboard/settings/page.tsx`:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/blocks/page-header"
import { SettingsBilling } from "@/components/dashboard/settings-billing"
import { SettingsNotifications } from "@/components/dashboard/settings-notifications"
import { SettingsProfile } from "@/components/dashboard/settings-profile"
import { SettingsTeam } from "@/components/dashboard/settings-team"
import { getInvoices, getTeam } from "@/lib/dashboard/queries"

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, team, notifications and billing." />
      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><SettingsProfile /></TabsContent>
        <TabsContent value="team"><SettingsTeam members={getTeam()} /></TabsContent>
        <TabsContent value="notifications"><SettingsNotifications /></TabsContent>
        <TabsContent value="billing"><SettingsBilling invoices={getInvoices()} /></TabsContent>
      </Tabs>
    </>
  )
}
```

- [x] **Step 5: Register files, verify, commit**

Add to the `dashboard` item's `files`:

```json
{ "path": "app/(preview)/dashboard/settings/page.tsx", "type": "registry:page", "target": "app/dashboard/settings/page.tsx" },
{ "path": "components/dashboard/settings-profile.tsx", "type": "registry:component", "target": "components/dashboard/settings-profile.tsx" },
{ "path": "components/dashboard/settings-team.tsx", "type": "registry:component", "target": "components/dashboard/settings-team.tsx" },
{ "path": "components/dashboard/settings-notifications.tsx", "type": "registry:component", "target": "components/dashboard/settings-notifications.tsx" },
{ "path": "components/dashboard/settings-billing.tsx", "type": "registry:component", "target": "components/dashboard/settings-billing.tsx" }
```

Add `"textarea"` to the item's `registryDependencies`.

Run: `pnpm registry:check && pnpm typecheck && pnpm lint`. Open `/dashboard/settings`, switch tabs, invite a member, toggle a switch.

```bash
git add -A
git commit -m "feat(dashboard): settings page"
```

---

### Task 7: End-to-end verification and docs

**Files:**
- Modify: `README.md`

- [x] **Step 1: Full local verification**

Run: `pnpm test && pnpm lint && pnpm typecheck && pnpm build`
Expected: all green; build route table includes `/dashboard`, `/dashboard/analytics`, `/dashboard/customers`, `/dashboard/orders`, `/dashboard/settings`.

- [x] **Step 2: Smoke install**

Run: `SMOKE_DIR=<scratchpad>/smoke pnpm smoke`
Expected: `✔ smoke install passed for: ... dashboard`. The consumer build's route table must list `/dashboard/*` routes, which proves `registry:page` targets landed. If the consumer build fails on `usePathname` or hooks, the failing file is missing `"use client"`; add it in the source and re-run.

Consumer root layout note: `shadcn init` writes a root layout that already wraps `ThemeProvider`, so the installed dashboard renders with theme support out of the box. If the item is added to a project without one, the theme toggle is inert but nothing breaks.

- [x] **Step 3: README**

Replace the line `Templates (`dashboard`, `chat`, `crm`, `agent`) are in progress.` with:

```markdown
## Templates

| Name | Pages | Install |
|---|---|---|
| `dashboard` | Overview, Analytics, Customers, Orders, Settings | `npx shadcn@latest add @kit/dashboard` |

Templates install pages under `app/<template>/`, components under
`components/<template>/`, and typed mock data under `lib/<template>/`. Replace
the functions in `lib/<template>/queries.ts` with real data access and the UI
keeps working. `chat`, `crm` and `agent` are in progress.
```

- [x] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: dashboard template usage; verify install end-to-end"
```

---

## Self-review against the spec

- **Dashboard screens** (overview with 4 stat cards, revenue chart, recent orders, activity feed; analytics with chart cards and range tabs; customers and orders tables with filters and detail sheets; settings with profile, team, notifications, billing tabs): Tasks 2 to 6.
- **Layout mounting app-shell with nav config**: Task 2 `DashboardShell`.
- **Server components for fixture rendering, client only where interactive**: pages are server components; tables, charts, forms are client.
- **Mock data conventions** (`lib/<template>/`, `types.ts`, fixtures, `queries.ts`, minutes-ago timestamps materialised at read, `en-US` formatting, initials not images): Task 1. Deviation recorded: orders are derived by a fixed-seed generator inside the fixture file rather than hand-typed rows.
- **Registry item with `registry:page` targets and `registry:lib` fixtures**: Tasks 2 to 6 build up the item; Task 7 proves it installs.
- **Type consistency**: `OrderRow`, `CustomerRow`, `MonthlyMetric`, `TeamMember`, `Invoice` are defined in Task 1 and used with the same names in Tasks 2 to 6. `StatusBadge` accepts `OrderStatus | CustomerStatus`. `getTopProducts` return type is referenced via `ReturnType` in `TopProducts`.
