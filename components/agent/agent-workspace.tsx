"use client"

import * as React from "react"
import { ArrowLeft, Bot, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Composer } from "@/components/blocks/composer"
import { EmptyState } from "@/components/blocks/empty-state"
import { MessageList, type Message } from "@/components/blocks/message-list"
import { ToolCallCard } from "@/components/blocks/tool-call-card"
import { ModelPicker } from "@/components/agent/model-picker"
import { formatRelative, formatTokens, modelName } from "@/lib/agent/queries"
import type { AgentMessage, AgentRow, ConversationRow, ModelId } from "@/lib/agent/types"
import { cn } from "@/lib/utils"
import { agentAvatar, emptyIllustration, personAvatar } from "@/lib/kit/assets"

type Thread = AgentMessage & { at: Date }

export type AgentWorkspaceProps = {
  agents: AgentRow[]
  conversations: ConversationRow[]
  threads: Record<string, Thread[]>
  initialConversationId?: string
}

const USER = { id: "user", name: "You", initials: "YO", avatar: personAvatar("Jane Doe") }

export function AgentWorkspace({ agents, conversations: initialConversations, threads: initialThreads, initialConversationId }: AgentWorkspaceProps) {
  const [conversations, setConversations] = React.useState(initialConversations)
  const [threads, setThreads] = React.useState(initialThreads)
  const [activeId, setActiveId] = React.useState<string | null>(initialConversationId ?? initialConversations[0]?.id ?? null)
  const [query, setQuery] = React.useState("")
  // Per-conversation model override; defaults to the agent's configured model.
  const [modelOverride, setModelOverride] = React.useState<Record<string, ModelId>>({})
  const seq = React.useRef(0)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null
  const agent = active ? agents.find((a) => a.id === active.agentId) : undefined
  const thread = active ? (threads[active.id] ?? []) : []
  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))
  const model: ModelId = (active ? modelOverride[active.id] : undefined) ?? agent?.model ?? "claude-fable-5-1"
  const setModel = (m: ModelId) => {
    if (active) setModelOverride((o) => ({ ...o, [active.id]: m }))
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [activeId, thread.length])

  const send = (text: string) => {
    if (!active) return
    const now = new Date()
    const userMsg: Thread = { id: `um_local_${++seq.current}`, conversationId: active.id, role: "user", parts: [{ type: "text", text }], minutesAgo: 0, at: now }
    const reply: Thread = {
      id: `am_local_${++seq.current}`,
      conversationId: active.id,
      role: "assistant",
      model,
      tokensIn: 900 + text.length * 4,
      tokensOut: 64,
      minutesAgo: 0,
      at: new Date(now.getTime() + 1),
      parts: [
        { type: "tool_call", id: `tc_local_${seq.current}`, name: "web_search", status: "pending", input: { query: text.slice(0, 80) } },
        { type: "text", text: "This is a mock workspace: no model is connected. Wire `lib/agent/queries.ts` to your backend and stream real responses here." },
      ],
    }
    setThreads((t) => ({ ...t, [active.id]: [...(t[active.id] ?? []), userMsg, reply] }))
    setConversations((list) => list.map((c) => (c.id === active.id ? { ...c, lastAt: now } : c)))
  }

  const newConversation = () => {
    const a = agents.find((x) => x.status === "active") ?? agents[0]
    if (!a) return
    const conv: ConversationRow = { id: `cv_local_${++seq.current}`, agentId: a.id, title: "New conversation", lastMinutesAgo: 0, lastAt: new Date(), agentName: a.name }
    setConversations((l) => [conv, ...l])
    setThreads((t) => ({ ...t, [conv.id]: [] }))
    setActiveId(conv.id)
  }

  const messagesForList: Message[] = thread.map((m) => {
    const texts = m.parts.filter((p) => p.type === "text").map((p) => p.text)
    const calls = m.parts.filter((p) => p.type === "tool_call")
    return {
      id: m.id,
      author: m.role === "user" ? USER : { id: "assistant", name: agent?.name ?? "Agent", initials: "AI", avatar: agent ? agentAvatar(agent.name) : undefined },
      body: texts.join("\n\n") || undefined,
      createdAt: m.at,
      attachments:
        calls.length > 0 ? (
          <div className="grid w-full max-w-xl gap-2">
            {calls.map((c) => (
              <ToolCallCard key={c.id} name={c.name} status={c.status} input={c.input} output={c.output} durationMs={c.durationMs} />
            ))}
            {m.role === "assistant" && m.model ? (
              <div className="text-[11px] text-muted-foreground">
                {modelName(m.model)} · {formatTokens((m.tokensIn ?? 0) + (m.tokensOut ?? 0))} tokens
              </div>
            ) : null}
          </div>
        ) : undefined,
    }
  })

  return (
    <div className="flex h-[calc(100svh-7.5rem)] min-h-[480px] overflow-hidden rounded-lg border bg-card">
      <h1 className="sr-only">Agent workspace</h1>
      <aside aria-label="Conversations" className={cn("flex w-full shrink-0 flex-col border-r md:w-72", active && "hidden md:flex")}>
        <div className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button size="icon" className="size-9" aria-label="New conversation" onClick={newConversation}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="grid gap-0.5 p-2 pt-0">
            {filtered.map((c) => (
              <li key={c.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn("grid w-full min-w-0 gap-0.5 rounded-md px-2 py-2 text-left hover:bg-muted/60", c.id === activeId && "bg-muted")}
                >
                  <span className="min-w-0 truncate text-sm font-medium">{c.title}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Bot className="size-3 shrink-0" />
                    <span className="min-w-0 truncate">{c.agentName}</span>
                    <span className="ml-auto shrink-0" suppressHydrationWarning>{formatRelative(c.lastAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className={cn("flex min-w-0 flex-1 flex-col", !active && "hidden md:flex")}>
        {active ? (
          <>
            <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Back to conversations" onClick={() => setActiveId(null)}>
                <ArrowLeft className="size-4" />
              </Button>
              <div className="grid min-w-0 flex-1">
                <span className="truncate text-sm font-medium">{active.title}</span>
                <span className="truncate text-xs text-muted-foreground">{active.agentName}</span>
              </div>
              <ModelPicker value={model} onChange={setModel} size="sm" className="w-44" />
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <MessageList
                messages={messagesForList}
                currentUserId={USER.id}
                emptyState={<EmptyState icon={Bot} title="Start the conversation" description={`Ask ${active.agentName} anything.`} />}
              />
              <div ref={bottomRef} />
            </div>
            <Composer
              onSend={send}
              placeholder={`Message ${active.agentName}…`}
              leftSlot={
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {agent?.tools.length ?? 0} tools
                </Badge>
              }
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState illustration={emptyIllustration("runs")} title="No conversation selected" description="Pick one from the list or start a new one." action={<Button onClick={newConversation}>New conversation</Button>} />
          </div>
        )}
      </section>
    </div>
  )
}
