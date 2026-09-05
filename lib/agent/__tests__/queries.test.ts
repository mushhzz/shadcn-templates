import { describe, expect, it } from "vitest"
import {
  formatDuration,
  formatTokens,
  formatUsd,
  getAgentById,
  getAgents,
  getMessages,
  getRunById,
  getRunStats,
  getRuns,
  getUsageByModel,
  getUsageTotals,
} from "@/lib/agent/queries"

const now = new Date("2026-09-05T12:00:00Z")

describe("agent formatters", () => {
  it("formats tokens, cost and duration", () => {
    expect(formatTokens(412)).toBe("412")
    expect(formatTokens(45_200)).toBe("45.2k")
    expect(formatTokens(3_900_000)).toBe("3.9M")
    expect(formatUsd(0.031)).toBe("$0.031")
    expect(formatUsd(168.2)).toBe("$168.20")
    expect(formatDuration(0)).toBe("—")
    expect(formatDuration(1320)).toBe("1.3s")
  })
})

describe("agent queries", () => {
  it("agents resolve tool names", () => {
    const support = getAgentById("ag_support", now)!
    expect(support.toolNames).toContain("Web search")
    expect(getAgents(now).length).toBeGreaterThanOrEqual(5)
  })

  it("runs are newest first and join agent names", () => {
    const list = getRuns(now)
    expect(list[0]!.agentName).not.toBe("Agent")
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1]!.startedAt.getTime()).toBeGreaterThanOrEqual(list[i]!.startedAt.getTime())
    }
    expect(getRunById("run_9019", now)?.status).toBe("failed")
  })

  it("run stats compute failure rate and totals", () => {
    const s = getRunStats()
    expect(s.total).toBe(getRuns(now).length)
    expect(s.failureRate).toBeGreaterThan(0)
    expect(s.costUsd).toBeGreaterThan(0)
  })

  it("messages carry tool-call parts in order", () => {
    const thread = getMessages("cv_01", now)
    expect(thread[0]!.role).toBe("user")
    const toolCalls = thread.flatMap((m) => m.parts.filter((p) => p.type === "tool_call"))
    expect(toolCalls.length).toBeGreaterThanOrEqual(2)
  })

  it("usage totals and per-model aggregation", () => {
    expect(getUsageTotals().tokensSpark).toHaveLength(14)
    const byModel = getUsageByModel()
    expect(byModel.length).toBeGreaterThan(1)
    for (let i = 1; i < byModel.length; i++) expect(byModel[i - 1]!.costUsd).toBeGreaterThanOrEqual(byModel[i]!.costUsd)
  })
})
