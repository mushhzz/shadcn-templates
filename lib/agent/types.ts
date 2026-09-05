export type ModelId = "claude-fable-5-1" | "claude-opus-5" | "claude-sonnet-5" | "claude-haiku-4-5"
export type AgentStatus = "active" | "draft" | "paused"
export type RunStatus = "running" | "succeeded" | "failed" | "cancelled"
export type StepStatus = "pending" | "running" | "success" | "error"
export type ToolId =
  | "web_search"
  | "read_file"
  | "write_file"
  | "run_sql"
  | "send_email"
  | "http_request"
  | "calendar"
  | "code_interpreter"

export type Tool = { id: ToolId; name: string; description: string }

export type KnowledgeSource = { id: string; name: string; kind: "docs" | "database" | "url" | "files"; items: number }

export type Agent = {
  id: string
  name: string
  description: string
  model: ModelId
  systemPrompt: string
  tools: ToolId[]
  knowledge: string[]
  status: AgentStatus
  temperature: number
  createdMinutesAgo: number
  runsLast7d: number
  successRate: number
}

export type ToolCallPart = {
  type: "tool_call"
  id: string
  name: ToolId
  status: StepStatus
  input: unknown
  output?: unknown
  durationMs?: number
}

export type TextPart = { type: "text"; text: string }
export type MessagePart = TextPart | ToolCallPart

export type AgentMessage = {
  id: string
  conversationId: string
  role: "user" | "assistant"
  parts: MessagePart[]
  minutesAgo: number
  model?: ModelId
  tokensIn?: number
  tokensOut?: number
}

export type AgentConversation = {
  id: string
  agentId: string
  title: string
  lastMinutesAgo: number
}

export type RunStep = {
  id: string
  type: "llm" | "tool"
  name: string
  status: StepStatus
  durationMs: number
  tokensIn?: number
  tokensOut?: number
  input?: unknown
  output?: unknown
  log?: string[]
}

export type Run = {
  id: string
  agentId: string
  trigger: "chat" | "api" | "schedule"
  status: RunStatus
  startedMinutesAgo: number
  durationMs: number
  tokensIn: number
  tokensOut: number
  costUsd: number
  steps: RunStep[]
}

export type UsageDay = {
  day: string
  tokens: number
  costUsd: number
  latencyMs: number
  runs: number
}

export type ApiKey = {
  id: string
  name: string
  prefix: string
  scopes: string[]
  createdMinutesAgo: number
  lastUsedMinutesAgo?: number
}

export type AgentRow = Omit<Agent, "createdMinutesAgo"> & { createdAt: Date; toolNames: string[] }
export type RunRow = Omit<Run, "startedMinutesAgo"> & { startedAt: Date; agentName: string }
export type ApiKeyRow = Omit<ApiKey, "createdMinutesAgo" | "lastUsedMinutesAgo"> & { createdAt: Date; lastUsedAt?: Date }
export type ConversationRow = AgentConversation & { lastAt: Date; agentName: string }
