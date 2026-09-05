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
      expect(orders[i - 1]!.createdAt.getTime()).toBeGreaterThanOrEqual(
        orders[i]!.createdAt.getTime(),
      )
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
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1]!.revenue).toBeGreaterThanOrEqual(top[i]!.revenue)
    }
  })
})
