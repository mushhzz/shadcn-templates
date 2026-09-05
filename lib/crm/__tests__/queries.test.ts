import { describe, expect, it } from "vitest"
import { formatCompactCurrency, formatRelative } from "@/lib/crm/format"
import {
  STAGES,
  bucketTask,
  getCompanies,
  getContactById,
  getContacts,
  getDeals,
  getDealsByStage,
  getPipelineStats,
  getTasksGrouped,
  getTimeline,
} from "@/lib/crm/queries"

const now = new Date("2026-09-05T12:00:00Z")

describe("crm format", () => {
  it("formats compact currency and signed relative time", () => {
    expect(formatCompactCurrency(210000)).toBe("$210K")
    expect(formatRelative(new Date("2026-09-05T09:00:00Z"), now)).toBe("3h ago")
    expect(formatRelative(new Date("2026-09-07T12:00:00Z"), now)).toBe("in 2d")
  })
})

describe("crm queries", () => {
  it("joins deals to companies and contacts, sorted by value desc", () => {
    const list = getDeals(now)
    expect(list.length).toBeGreaterThanOrEqual(18)
    expect(list[0]!.companyName).not.toBe("Unknown")
    for (let i = 1; i < list.length; i++) expect(list[i - 1]!.value).toBeGreaterThanOrEqual(list[i]!.value)
  })

  it("pipeline stats only count open stages", () => {
    const s = getPipelineStats()
    expect(s.openCount).toBe(getDeals(now).filter((d) => !["won", "lost"].includes(d.stage)).length)
    expect(s.winRate).toBeGreaterThan(0)
    expect(s.winRate).toBeLessThanOrEqual(100)
  })

  it("deals by stage covers every stage", () => {
    expect(getDealsByStage().map((d) => d.stage)).toEqual(STAGES.map((s) => s.title))
  })

  it("contacts include company name and open deal counts", () => {
    const olivia = getContacts(now).find((c) => c.id === "ct_01")!
    expect(olivia.companyName).toBe("Northwind")
    expect(olivia.openDeals).toBe(1)
    expect(getContactById("ct_01", now)?.initials).toBe("OB")
  })

  it("companies aggregate contacts and open value", () => {
    const northwind = getCompanies().find((c) => c.id === "co_01")!
    expect(northwind.contactCount).toBe(2)
    expect(northwind.openDealValue).toBe(84000 + 18500)
  })

  it("timeline filters by contact and by company", () => {
    expect(getTimeline({ contactId: "ct_01" }, now).every((e) => e.contactId === "ct_01")).toBe(true)
    const byCompany = getTimeline({ companyId: "co_01" }, now)
    expect(byCompany.length).toBeGreaterThanOrEqual(2)
  })

  it("buckets tasks by due date", () => {
    const groups = getTasksGrouped(now)
    const names = groups.map((g) => g.bucket)
    expect(names[0]).toBe("Overdue")
    expect(names).toContain("Done")
    const overdue = groups.find((g) => g.bucket === "Overdue")!.tasks
    expect(overdue.every((t) => bucketTask(t, now) === "Overdue")).toBe(true)
  })
})
