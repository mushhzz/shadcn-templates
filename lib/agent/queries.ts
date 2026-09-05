import { MODELS, agents, apiKeys, conversations, knowledge, messages, runs, tools, usage, usageByAgent } from "./fixtures"
import type { AgentMessage, AgentRow, ApiKeyRow, ConversationRow, KnowledgeSource, ModelId, RunRow, Tool } from "./types"

const agentById = new Map(agents.map((a) => [a.id, a]))
const toolById = new Map(tools.map((t) => [t.id, t]))

function ago(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60000)
}

export function getModels() {
  return MODELS
}

export function modelName(id: ModelId): string {
  return MODELS.find((m) => m.id === id)?.name ?? id
}

export function getTools(): Tool[] {
  return tools
}

export function getKnowledge(): KnowledgeSource[] {
  return knowledge
}

export function getAgents(now: Date = new Date()): AgentRow[] {
  return agents.map<AgentRow>(({ createdMinutesAgo, ...a }) => ({
    ...a,
    createdAt: ago(now, createdMinutesAgo),
    toolNames: a.tools.map((t) => toolById.get(t)?.name ?? t),
  }))
}

export function getAgentById(id: string, now: Date = new Date()): AgentRow | undefined {
  return getAgents(now).find((a) => a.id === id)
}

export function getConversations(now: Date = new Date()): ConversationRow[] {
  return conversations
    .map<ConversationRow>((c) => ({
      ...c,
      lastAt: ago(now, c.lastMinutesAgo),
      agentName: agentById.get(c.agentId)?.name ?? "Agent",
    }))
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
}

export function getMessages(conversationId: string, now: Date = new Date()): (AgentMessage & { at: Date })[] {
  return messages
    .filter((m) => m.conversationId === conversationId)
    .map((m) => ({ ...m, at: ago(now, m.minutesAgo) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())
}

export function getRuns(now: Date = new Date()): RunRow[] {
  return runs
    .map<RunRow>(({ startedMinutesAgo, ...r }) => ({
      ...r,
      startedAt: ago(now, startedMinutesAgo),
      agentName: agentById.get(r.agentId)?.name ?? "Agent",
    }))
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
}

export function getRunById(id: string, now: Date = new Date()): RunRow | undefined {
  return getRuns(now).find((r) => r.id === id)
}

export function getRunStats() {
  const total = runs.length
  const failed = runs.filter((r) => r.status === "failed").length
  const finished = runs.filter((r) => r.status !== "running")
  const avgLatency = finished.reduce((s, r) => s + r.durationMs, 0) / Math.max(finished.length, 1)
  return {
    total,
    running: runs.filter((r) => r.status === "running").length,
    failureRate: total === 0 ? 0 : (failed / total) * 100,
    avgLatencyMs: avgLatency,
    tokens: runs.reduce((s, r) => s + r.tokensIn + r.tokensOut, 0),
    costUsd: runs.reduce((s, r) => s + r.costUsd, 0),
  }
}

export function getUsageDaily() {
  return usage
}

export function getUsageTotals() {
  return {
    tokens: usage.reduce((s, d) => s + d.tokens, 0),
    costUsd: usage.reduce((s, d) => s + d.costUsd, 0),
    runs: usage.reduce((s, d) => s + d.runs, 0),
    avgLatencyMs: usage.reduce((s, d) => s + d.latencyMs, 0) / usage.length,
    tokensSpark: usage.map((d) => d.tokens),
    costSpark: usage.map((d) => d.costUsd),
  }
}

export function getUsageByAgent() {
  return usageByAgent
    .map((u) => ({ ...u, agentName: agentById.get(u.agentId)?.name ?? u.agentId, model: agentById.get(u.agentId)?.model }))
    .sort((a, b) => b.costUsd - a.costUsd)
}

export function getUsageByModel(): { model: string; tokens: number; costUsd: number }[] {
  const agg = new Map<string, { tokens: number; costUsd: number }>()
  for (const u of usageByAgent) {
    const model = agentById.get(u.agentId)?.model
    if (!model) continue
    const cur = agg.get(model) ?? { tokens: 0, costUsd: 0 }
    agg.set(model, { tokens: cur.tokens + u.tokens, costUsd: cur.costUsd + u.costUsd })
  }
  return [...agg.entries()].map(([model, v]) => ({ model: modelName(model as ModelId), ...v })).sort((a, b) => b.costUsd - a.costUsd)
}

export function getApiKeys(now: Date = new Date()): ApiKeyRow[] {
  return apiKeys.map<ApiKeyRow>(({ createdMinutesAgo, lastUsedMinutesAgo, ...k }) => ({
    ...k,
    createdAt: ago(now, createdMinutesAgo),
    lastUsedAt: lastUsedMinutesAgo === undefined ? undefined : ago(now, lastUsedMinutesAgo),
  }))
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`
  return String(n)
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 3 : 2 }).format(n)
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "—"
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

export function formatRelative(d: Date, now: Date = new Date()): string {
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
