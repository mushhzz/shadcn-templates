import type {
  Agent,
  AgentConversation,
  AgentMessage,
  ApiKey,
  KnowledgeSource,
  ModelId,
  Run,
  Tool,
  UsageDay,
} from "./types"

const H = 60
const D = 60 * 24

export const MODELS: { id: ModelId; name: string; note: string }[] = [
  { id: "claude-fable-5-1", name: "Claude Fable 5.1", note: "Most capable" },
  { id: "claude-opus-5", name: "Claude Opus 5", note: "Deep reasoning" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", note: "Balanced" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", note: "Fast and cheap" },
]

export const tools: Tool[] = [
  { id: "web_search", name: "Web search", description: "Search the web and return ranked results." },
  { id: "read_file", name: "Read file", description: "Read a file from the connected workspace." },
  { id: "write_file", name: "Write file", description: "Create or overwrite a workspace file." },
  { id: "run_sql", name: "Run SQL", description: "Execute a read-only query against the analytics warehouse." },
  { id: "send_email", name: "Send email", description: "Send an email from the shared support inbox." },
  { id: "http_request", name: "HTTP request", description: "Call an allow-listed HTTP endpoint." },
  { id: "calendar", name: "Calendar", description: "Read and create calendar events." },
  { id: "code_interpreter", name: "Code interpreter", description: "Run Python in a sandbox." },
]

export const knowledge: KnowledgeSource[] = [
  { id: "kb_docs", name: "Product docs", kind: "docs", items: 412 },
  { id: "kb_help", name: "Help center", kind: "url", items: 96 },
  { id: "kb_warehouse", name: "Analytics warehouse", kind: "database", items: 38 },
  { id: "kb_policies", name: "Support policies", kind: "files", items: 14 },
  { id: "kb_pricing", name: "Pricing sheets", kind: "files", items: 6 },
]

export const agents: Agent[] = [
  {
    id: "ag_support",
    name: "Support Copilot",
    description: "Drafts replies to support tickets using the help center and policies.",
    model: "claude-sonnet-5",
    systemPrompt:
      "You are a support copilot for Acme. Answer using the help center and support policies. Be concise, cite the article you used, and escalate billing disputes to a human.",
    tools: ["web_search", "read_file", "send_email"],
    knowledge: ["kb_help", "kb_policies"],
    status: "active",
    temperature: 0.3,
    createdMinutesAgo: D * 62,
    runsLast7d: 1284,
    successRate: 97.2,
  },
  {
    id: "ag_analyst",
    name: "Revenue Analyst",
    description: "Answers questions about revenue and usage by querying the warehouse.",
    model: "claude-fable-5-1",
    systemPrompt:
      "You are a data analyst. Translate questions into read-only SQL against the analytics warehouse, run it, and explain the result in plain language with the query shown.",
    tools: ["run_sql", "code_interpreter"],
    knowledge: ["kb_warehouse"],
    status: "active",
    temperature: 0.1,
    createdMinutesAgo: D * 40,
    runsLast7d: 356,
    successRate: 93.8,
  },
  {
    id: "ag_research",
    name: "Research Scout",
    description: "Compiles competitor and market briefs from the web.",
    model: "claude-opus-5",
    systemPrompt:
      "You research companies and markets. Search broadly, prefer primary sources, and produce a brief with citations and a confidence note.",
    tools: ["web_search", "http_request", "write_file"],
    knowledge: [],
    status: "active",
    temperature: 0.5,
    createdMinutesAgo: D * 21,
    runsLast7d: 88,
    successRate: 90.9,
  },
  {
    id: "ag_scheduler",
    name: "Meeting Scheduler",
    description: "Finds times and books meetings across calendars.",
    model: "claude-haiku-4-5",
    systemPrompt: "You schedule meetings. Propose three slots that respect working hours in every attendee's timezone, then book the one the user picks.",
    tools: ["calendar", "send_email"],
    knowledge: [],
    status: "paused",
    temperature: 0.2,
    createdMinutesAgo: D * 15,
    runsLast7d: 0,
    successRate: 88.1,
  },
  {
    id: "ag_onboard",
    name: "Onboarding Guide",
    description: "Walks new customers through setup using the product docs.",
    model: "claude-sonnet-5",
    systemPrompt: "You guide new customers through setup step by step, using the product docs. Ask one question at a time.",
    tools: ["read_file"],
    knowledge: ["kb_docs"],
    status: "draft",
    temperature: 0.4,
    createdMinutesAgo: D * 3,
    runsLast7d: 12,
    successRate: 100,
  },
]

export const conversations: AgentConversation[] = [
  { id: "cv_01", agentId: "ag_analyst", title: "September revenue vs target", lastMinutesAgo: 6 },
  { id: "cv_02", agentId: "ag_support", title: "Refund policy for annual plans", lastMinutesAgo: 42 },
  { id: "cv_03", agentId: "ag_research", title: "Brief: Meridian Labs competitors", lastMinutesAgo: 3 * H },
  { id: "cv_04", agentId: "ag_analyst", title: "Churn by plan, last quarter", lastMinutesAgo: D },
  { id: "cv_05", agentId: "ag_support", title: "SSO loop troubleshooting", lastMinutesAgo: D + 5 * H },
  { id: "cv_06", agentId: "ag_scheduler", title: "Book plant walkthrough with Atlas Works", lastMinutesAgo: 3 * D },
]

export const messages: AgentMessage[] = [
  { id: "am_01", conversationId: "cv_01", role: "user", parts: [{ type: "text", text: "How did September revenue compare to target, and which channel drove the gap?" }], minutesAgo: 9 },
  {
    id: "am_02",
    conversationId: "cv_01",
    role: "assistant",
    model: "claude-fable-5-1",
    tokensIn: 1840,
    tokensOut: 412,
    minutesAgo: 8,
    parts: [
      { type: "text", text: "I'll query the warehouse for September actuals against target, then break the difference down by channel." },
      {
        type: "tool_call",
        id: "tc_01",
        name: "run_sql",
        status: "success",
        durationMs: 1320,
        input: { sql: "SELECT channel, SUM(revenue) AS revenue, SUM(target) AS target FROM monthly_metrics WHERE month = '2026-09' GROUP BY channel" },
        output: { rows: [{ channel: "web", revenue: 51600, target: 46000 }, { channel: "mobile", revenue: 25700, target: 22000 }, { channel: "partner", revenue: 14000, target: 12000 }] },
      },
      {
        type: "text",
        text: "September closed at $91,300 against an $80,000 target, 14% ahead. Web contributed the most of the overage ($5,600 over target), followed by mobile ($3,700) and partner ($2,000). All three channels beat target, so the gap is broad-based rather than driven by one channel.",
      },
    ],
  },
  { id: "am_03", conversationId: "cv_01", role: "user", parts: [{ type: "text", text: "Chart the monthly trend for web only." }], minutesAgo: 7 },
  {
    id: "am_04",
    conversationId: "cv_01",
    role: "assistant",
    model: "claude-fable-5-1",
    tokensIn: 2210,
    tokensOut: 96,
    minutesAgo: 6,
    parts: [
      {
        type: "tool_call",
        id: "tc_02",
        name: "code_interpreter",
        status: "running",
        input: { language: "python", code: "import matplotlib.pyplot as plt\n# plot web revenue by month" },
      },
    ],
  },
  { id: "am_10", conversationId: "cv_02", role: "user", parts: [{ type: "text", text: "A customer on an annual Pro plan wants a refund after 4 months. What does policy say?" }], minutesAgo: 45 },
  {
    id: "am_11",
    conversationId: "cv_02",
    role: "assistant",
    model: "claude-sonnet-5",
    tokensIn: 1220,
    tokensOut: 188,
    minutesAgo: 43,
    parts: [
      { type: "tool_call", id: "tc_10", name: "read_file", status: "success", durationMs: 240, input: { path: "policies/refunds.md" }, output: "Annual plans are refundable pro rata within 30 days. After 30 days, refunds are at the discretion of the billing team…" },
      { type: "text", text: "Per the refund policy, annual plans are only refundable pro rata within the first 30 days. At four months this is outside the automatic window, so it needs a billing team decision. I've drafted a reply explaining that and offering to escalate. Want me to send it?" },
    ],
  },
  { id: "am_12", conversationId: "cv_02", role: "user", parts: [{ type: "text", text: "Yes, send it and cc billing." }], minutesAgo: 42 },
  {
    id: "am_13",
    conversationId: "cv_02",
    role: "assistant",
    model: "claude-sonnet-5",
    tokensIn: 1410,
    tokensOut: 40,
    minutesAgo: 42,
    parts: [
      { type: "tool_call", id: "tc_11", name: "send_email", status: "error", durationMs: 3100, input: { to: "customer@example.com", cc: ["billing@acme.com"], subject: "Your refund request" }, output: { error: "SMTP timeout after 3000ms" } },
      { type: "text", text: "The email failed to send (SMTP timeout). I've kept the draft. Retry, or I can hand it to you to send manually." },
    ],
  },
  { id: "am_20", conversationId: "cv_03", role: "user", parts: [{ type: "text", text: "Who are Meridian Labs' main competitors in research cloud tooling?" }], minutesAgo: 3 * H + 10 },
  {
    id: "am_21",
    conversationId: "cv_03",
    role: "assistant",
    model: "claude-opus-5",
    tokensIn: 3900,
    tokensOut: 720,
    minutesAgo: 3 * H,
    parts: [
      { type: "tool_call", id: "tc_20", name: "web_search", status: "success", durationMs: 2100, input: { query: "research cloud platform biotech labs competitors 2026" }, output: { results: 8 } },
      { type: "tool_call", id: "tc_21", name: "write_file", status: "success", durationMs: 180, input: { path: "briefs/meridian-competitors.md" }, output: { bytes: 6412 } },
      { type: "text", text: "I found eight relevant sources and wrote the brief to briefs/meridian-competitors.md. Top three competitors by overlap: Benchling (data management), LabArchives (ELN), and Scispot (lab ops). Confidence: medium; two sources are vendor-authored." },
    ],
  },
]

export const runs: Run[] = [
  {
    id: "run_9021", agentId: "ag_analyst", trigger: "chat", status: "running", startedMinutesAgo: 6, durationMs: 0, tokensIn: 2210, tokensOut: 96, costUsd: 0.031,
    steps: [
      { id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 820, tokensIn: 2210, tokensOut: 96 },
      { id: "s2", type: "tool", name: "code_interpreter", status: "running", durationMs: 0, input: { language: "python" }, log: ["Starting sandbox", "Installing matplotlib (cached)", "Running cell 1…"] },
    ],
  },
  {
    id: "run_9020", agentId: "ag_analyst", trigger: "chat", status: "succeeded", startedMinutesAgo: 8, durationMs: 4300, tokensIn: 1840, tokensOut: 412, costUsd: 0.048,
    steps: [
      { id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 910, tokensIn: 1840, tokensOut: 80 },
      { id: "s2", type: "tool", name: "run_sql", status: "success", durationMs: 1320, input: { sql: "SELECT channel, SUM(revenue)…" }, output: { rows: 3 }, log: ["Connected to warehouse", "Query planned (3 partitions)", "Returned 3 rows in 1.3s"] },
      { id: "s3", type: "llm", name: "Answer", status: "success", durationMs: 2070, tokensIn: 2400, tokensOut: 332 },
    ],
  },
  {
    id: "run_9019", agentId: "ag_support", trigger: "chat", status: "failed", startedMinutesAgo: 42, durationMs: 5200, tokensIn: 1410, tokensOut: 40, costUsd: 0.012,
    steps: [
      { id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 700, tokensIn: 1410, tokensOut: 40 },
      { id: "s2", type: "tool", name: "send_email", status: "error", durationMs: 3100, input: { to: "customer@example.com" }, output: { error: "SMTP timeout after 3000ms" }, log: ["Connecting to smtp.acme.internal:587", "STARTTLS ok", "Timeout waiting for 250 after DATA"] },
      { id: "s3", type: "llm", name: "Recover", status: "success", durationMs: 1400, tokensIn: 1900, tokensOut: 60 },
    ],
  },
  {
    id: "run_9018", agentId: "ag_support", trigger: "chat", status: "succeeded", startedMinutesAgo: 43, durationMs: 2900, tokensIn: 1220, tokensOut: 188, costUsd: 0.011,
    steps: [
      { id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 600, tokensIn: 1220, tokensOut: 30 },
      { id: "s2", type: "tool", name: "read_file", status: "success", durationMs: 240, input: { path: "policies/refunds.md" }, output: { bytes: 2210 } },
      { id: "s3", type: "llm", name: "Answer", status: "success", durationMs: 2060, tokensIn: 1800, tokensOut: 158 },
    ],
  },
  {
    id: "run_9017", agentId: "ag_research", trigger: "api", status: "succeeded", startedMinutesAgo: 3 * H, durationMs: 18400, tokensIn: 3900, tokensOut: 720, costUsd: 0.21,
    steps: [
      { id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 1200, tokensIn: 3900, tokensOut: 120 },
      { id: "s2", type: "tool", name: "web_search", status: "success", durationMs: 2100, input: { query: "research cloud…" }, output: { results: 8 } },
      { id: "s3", type: "tool", name: "http_request", status: "success", durationMs: 6400, input: { url: "https://example.com/report.pdf" }, output: { status: 200, bytes: 148000 } },
      { id: "s4", type: "tool", name: "write_file", status: "success", durationMs: 180, input: { path: "briefs/meridian-competitors.md" } },
      { id: "s5", type: "llm", name: "Summarise", status: "success", durationMs: 8520, tokensIn: 9200, tokensOut: 600 },
    ],
  },
  { id: "run_9016", agentId: "ag_support", trigger: "api", status: "succeeded", startedMinutesAgo: 5 * H, durationMs: 2100, tokensIn: 980, tokensOut: 140, costUsd: 0.008, steps: [{ id: "s1", type: "llm", name: "Answer", status: "success", durationMs: 2100, tokensIn: 980, tokensOut: 140 }] },
  { id: "run_9015", agentId: "ag_support", trigger: "api", status: "succeeded", startedMinutesAgo: 6 * H, durationMs: 2600, tokensIn: 1100, tokensOut: 160, costUsd: 0.009, steps: [{ id: "s1", type: "llm", name: "Answer", status: "success", durationMs: 2600, tokensIn: 1100, tokensOut: 160 }] },
  { id: "run_9014", agentId: "ag_analyst", trigger: "schedule", status: "succeeded", startedMinutesAgo: 9 * H, durationMs: 6100, tokensIn: 2100, tokensOut: 380, costUsd: 0.052, steps: [{ id: "s1", type: "tool", name: "run_sql", status: "success", durationMs: 1900 }, { id: "s2", type: "llm", name: "Answer", status: "success", durationMs: 4200, tokensIn: 2100, tokensOut: 380 }] },
  { id: "run_9013", agentId: "ag_scheduler", trigger: "chat", status: "cancelled", startedMinutesAgo: 3 * D, durationMs: 900, tokensIn: 640, tokensOut: 20, costUsd: 0.001, steps: [{ id: "s1", type: "llm", name: "Plan", status: "success", durationMs: 900, tokensIn: 640, tokensOut: 20 }] },
  { id: "run_9012", agentId: "ag_research", trigger: "schedule", status: "failed", startedMinutesAgo: D, durationMs: 30500, tokensIn: 4100, tokensOut: 0, costUsd: 0.09, steps: [{ id: "s1", type: "tool", name: "http_request", status: "error", durationMs: 30000, input: { url: "https://example.org/feed" }, output: { error: "Timeout" }, log: ["GET https://example.org/feed", "No response after 30s"] }] },
  { id: "run_9011", agentId: "ag_onboard", trigger: "chat", status: "succeeded", startedMinutesAgo: D + 2 * H, durationMs: 3300, tokensIn: 1500, tokensOut: 260, costUsd: 0.014, steps: [{ id: "s1", type: "tool", name: "read_file", status: "success", durationMs: 200 }, { id: "s2", type: "llm", name: "Answer", status: "success", durationMs: 3100, tokensIn: 1500, tokensOut: 260 }] },
  { id: "run_9010", agentId: "ag_support", trigger: "api", status: "succeeded", startedMinutesAgo: D + 6 * H, durationMs: 1900, tokensIn: 900, tokensOut: 120, costUsd: 0.007, steps: [{ id: "s1", type: "llm", name: "Answer", status: "success", durationMs: 1900, tokensIn: 900, tokensOut: 120 }] },
]

export const usage: UsageDay[] = [
  { day: "Aug 23", tokens: 412000, costUsd: 18.4, latencyMs: 2900, runs: 610 },
  { day: "Aug 24", tokens: 388000, costUsd: 17.1, latencyMs: 3100, runs: 574 },
  { day: "Aug 25", tokens: 455000, costUsd: 20.2, latencyMs: 2800, runs: 662 },
  { day: "Aug 26", tokens: 501000, costUsd: 22.9, latencyMs: 2700, runs: 715 },
  { day: "Aug 27", tokens: 478000, costUsd: 21.4, latencyMs: 3000, runs: 690 },
  { day: "Aug 28", tokens: 302000, costUsd: 13.2, latencyMs: 2600, runs: 431 },
  { day: "Aug 29", tokens: 288000, costUsd: 12.6, latencyMs: 2500, runs: 402 },
  { day: "Aug 30", tokens: 520000, costUsd: 23.8, latencyMs: 3200, runs: 744 },
  { day: "Aug 31", tokens: 548000, costUsd: 25.1, latencyMs: 3300, runs: 781 },
  { day: "Sep 1", tokens: 590000, costUsd: 27.4, latencyMs: 3100, runs: 823 },
  { day: "Sep 2", tokens: 612000, costUsd: 28.6, latencyMs: 2900, runs: 858 },
  { day: "Sep 3", tokens: 575000, costUsd: 26.7, latencyMs: 3000, runs: 811 },
  { day: "Sep 4", tokens: 634000, costUsd: 29.9, latencyMs: 2800, runs: 902 },
  { day: "Sep 5", tokens: 410000, costUsd: 19.3, latencyMs: 2700, runs: 588 },
]

export const usageByAgent: { agentId: string; tokens: number; costUsd: number; latencyMs: number }[] = [
  { agentId: "ag_support", tokens: 3_900_000, costUsd: 168.2, latencyMs: 2400 },
  { agentId: "ag_analyst", tokens: 1_800_000, costUsd: 121.6, latencyMs: 4100 },
  { agentId: "ag_research", tokens: 920_000, costUsd: 88.4, latencyMs: 12800 },
  { agentId: "ag_onboard", tokens: 210_000, costUsd: 9.1, latencyMs: 3000 },
  { agentId: "ag_scheduler", tokens: 60_000, costUsd: 1.2, latencyMs: 1500 },
]

export const apiKeys: ApiKey[] = [
  { id: "key_01", name: "Production backend", prefix: "ak_live_7f3c", scopes: ["runs:write", "agents:read"], createdMinutesAgo: D * 60, lastUsedMinutesAgo: 4 },
  { id: "key_02", name: "Zapier integration", prefix: "ak_live_2b9e", scopes: ["runs:write"], createdMinutesAgo: D * 31, lastUsedMinutesAgo: 3 * H },
  { id: "key_03", name: "Staging", prefix: "ak_test_c41d", scopes: ["runs:write", "agents:write", "keys:read"], createdMinutesAgo: D * 12, lastUsedMinutesAgo: D * 2 },
  { id: "key_04", name: "Analyst notebook", prefix: "ak_test_e8a0", scopes: ["runs:read"], createdMinutesAgo: D * 2 },
]
