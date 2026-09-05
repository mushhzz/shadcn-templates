import { activity, customers, invoices, monthly, orders, products, team } from "./fixtures"
import { initialsOf } from "./format"
import type {
  Activity,
  CustomerRow,
  Invoice,
  MonthlyMetric,
  OrderRow,
  Product,
  TeamMember,
} from "./types"

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
  const cur = monthly[monthly.length - 1] as MonthlyMetric
  const prev = monthly[monthly.length - 2] as MonthlyMetric
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
      total: o.items.reduce(
        (sum, i) => sum + (productById.get(i.productId)?.price ?? 0) * i.quantity,
        0,
      ),
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
    .flatMap(([id, v]) => {
      const product = productById.get(id)
      return product ? [{ product, ...v }] : []
    })
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
