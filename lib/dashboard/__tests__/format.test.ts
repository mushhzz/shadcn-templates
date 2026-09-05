import { describe, expect, it } from "vitest"
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelative,
  initialsOf,
} from "@/lib/dashboard/format"

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
