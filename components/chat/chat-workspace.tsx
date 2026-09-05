"use client"

import * as React from "react"
import { ArrowLeft, BellOff, Info, Pin, Plus, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Composer } from "@/components/blocks/composer"
import { EmptyState } from "@/components/blocks/empty-state"
import { MessageList, type Message } from "@/components/blocks/message-list"
import { NewConversationDialog, type NewConversationInput } from "@/components/chat/new-conversation-dialog"
import { PresenceDot } from "@/components/chat/presence-dot"
import { initialsOf } from "@/lib/chat/queries"
import type { ChatMessage, ChatUserRow, ConversationRow } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

type Thread = ChatMessage & { at: Date }

export type ChatWorkspaceProps = {
  currentUser: ChatUserRow
  conversations: ConversationRow[]
  threads: Record<string, Thread[]>
  contacts: ChatUserRow[]
  initialConversationId?: string
}

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })
const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

function preview(m: Thread | undefined, meId: string) {
  if (!m) return "No messages yet"
  const prefix = m.authorId === meId ? "You: " : ""
  return prefix + m.body.replace(/\n/g, " ")
}

// Uses the message's own age rather than the wall clock so server and client agree.
function stamp(m: Thread) {
  return m.minutesAgo < 20 * 60 ? timeFmt.format(m.at) : dayFmt.format(m.at)
}

export function ChatWorkspace({ currentUser, conversations: initialConversations, threads: initialThreads, contacts, initialConversationId }: ChatWorkspaceProps) {
  const [conversations, setConversations] = React.useState(initialConversations)
  const [threads, setThreads] = React.useState(initialThreads)
  const [activeId, setActiveId] = React.useState<string | null>(initialConversationId ?? initialConversations[0]?.id ?? null)
  const [query, setQuery] = React.useState("")
  const [showDetails, setShowDetails] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  // Local id counter for optimistic messages/conversations created in this session.
  const seq = React.useRef(0)
  const nextId = (prefix: string) => `${prefix}_local_${++seq.current}`
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null
  const thread = active ? (threads[active.id] ?? []) : []
  const userById = React.useMemo(() => {
    const map = new Map<string, ChatUserRow>()
    for (const c of contacts) map.set(c.id, c)
    map.set(currentUser.id, currentUser)
    return map
  }, [contacts, currentUser])

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [activeId, thread.length])

  const open = (id: string) => {
    setActiveId(id)
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const send = (text: string) => {
    if (!active) return
    const msg: Thread = {
      id: nextId("m"),
      conversationId: active.id,
      authorId: currentUser.id,
      body: text,
      minutesAgo: 0,
      status: "sent",
      at: new Date(),
    }
    setThreads((t) => ({ ...t, [active.id]: [...(t[active.id] ?? []), msg] }))
    setConversations((list) => list.map((c) => (c.id === active.id ? { ...c, lastMessage: msg } : c)))
  }

  const create = (input: NewConversationInput) => {
    const participants = [currentUser, ...input.participantIds.map((id) => userById.get(id)).filter((u): u is ChatUserRow => !!u)]
    const title = input.kind === "group" ? (input.name ?? "Group") : (participants[1]?.name ?? "Conversation")
    const conv: ConversationRow = {
      id: nextId("c"),
      kind: input.kind,
      name: input.name,
      participantIds: participants.map((p) => p.id),
      unread: 0,
      pinned: false,
      muted: false,
      title,
      initials: initialsOf(title),
      participants,
      lastMessage: undefined,
    }
    setConversations((list) => [conv, ...list])
    setThreads((t) => ({ ...t, [conv.id]: [] }))
    setActiveId(conv.id)
  }

  const messagesForList: Message[] = thread.map((m) => {
    const author = userById.get(m.authorId)
    return {
      id: m.id,
      author: { id: m.authorId, name: author?.name ?? "Unknown", initials: author?.initials ?? "?" },
      body: m.body,
      createdAt: m.at,
      status: m.status,
    }
  })

  const others = active ? active.participants.filter((p) => p.id !== currentUser.id) : []

  return (
    <div className="flex h-[calc(100svh-7.5rem)] min-h-[480px] overflow-hidden rounded-lg border bg-card">
      {/* Conversation list */}
      <aside className={cn("flex w-full shrink-0 flex-col border-r md:w-80", active && "hidden md:flex")}>
        <div className="flex items-center gap-2 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search chats" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button size="icon" className="size-9" aria-label="New conversation" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="grid gap-0.5 p-2 pt-0">
            {filtered.map((c) => (
              <li key={c.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/60",
                    c.id === activeId && "bg-muted",
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10">
                      <AvatarFallback className={cn(c.kind === "group" && "rounded-lg")}>{c.initials}</AvatarFallback>
                    </Avatar>
                    {c.kind === "dm" ? (
                      <PresenceDot presence={others.length && c.id === activeId ? others[0]!.presence : (c.participants.find((p) => p.id !== currentUser.id)?.presence ?? "offline")} className="absolute -bottom-0.5 -right-0.5" />
                    ) : null}
                  </div>
                  <div className="grid min-w-0 flex-1 gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("truncate text-sm", c.unread > 0 ? "font-semibold" : "font-medium")}>{c.title}</span>
                      {c.pinned ? <Pin className="size-3 shrink-0 text-muted-foreground" /> : null}
                      {c.muted ? <BellOff className="size-3 shrink-0 text-muted-foreground" /> : null}
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
                        {c.lastMessage ? stamp(c.lastMessage) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("truncate text-xs", c.unread > 0 ? "text-foreground" : "text-muted-foreground")}>
                        {preview(c.lastMessage, currentUser.id)}
                      </span>
                      {c.unread > 0 ? (
                        <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">{c.unread}</Badge>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Thread */}
      <section className={cn("flex min-w-0 flex-1 flex-col", !active && "hidden md:flex")}>
        {active ? (
          <>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Back to chats" onClick={() => setActiveId(null)}>
                <ArrowLeft className="size-4" />
              </Button>
              <Avatar className="size-8">
                <AvatarFallback className={cn("text-xs", active.kind === "group" && "rounded-lg")}>{active.initials}</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0">
                <span className="truncate text-sm font-medium">{active.title}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.kind === "group" ? `${active.participants.length} members` : others[0]?.title}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto" aria-label="Toggle details" aria-pressed={showDetails} onClick={() => setShowDetails((s) => !s)}>
                <Info className="size-4" />
              </Button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <MessageList
                messages={messagesForList}
                currentUserId={currentUser.id}
                emptyState={<EmptyState title="Say hello" description="This is the beginning of your conversation." />}
              />
              <div ref={bottomRef} />
            </div>
            <Composer onSend={send} placeholder={`Message ${active.title}`} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState title="No conversation selected" description="Pick a chat from the list or start a new one." action={<Button onClick={() => setDialogOpen(true)}>New conversation</Button>} />
          </div>
        )}
      </section>

      {/* Details panel */}
      {active && showDetails ? (
        <aside className="hidden w-72 shrink-0 flex-col border-l xl:flex">
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Avatar className="size-16">
              <AvatarFallback className={cn("text-lg", active.kind === "group" && "rounded-xl")}>{active.initials}</AvatarFallback>
            </Avatar>
            <div className="text-sm font-semibold">{active.title}</div>
            <div className="text-xs text-muted-foreground">
              {active.kind === "group" ? `${active.participants.length} members` : `@${others[0]?.handle} · ${others[0]?.timezone}`}
            </div>
          </div>
          <Separator />
          <div className="grid gap-1 p-3">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Members</div>
            {active.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <div className="relative">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">{initialsOf(p.name)}</AvatarFallback>
                  </Avatar>
                  <PresenceDot presence={p.presence} className="absolute -bottom-0.5 -right-0.5 size-2" />
                </div>
                <div className="grid min-w-0 text-sm">
                  <span className="truncate">{p.name}{p.id === currentUser.id ? " (you)" : ""}</span>
                  <span className="truncate text-xs text-muted-foreground">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="grid gap-2 p-3">
            <Button variant="outline" size="sm" onClick={() => setConversations((l) => l.map((c) => (c.id === active.id ? { ...c, pinned: !c.pinned } : c)))}>
              <Pin className="size-4" /> {active.pinned ? "Unpin" : "Pin"} conversation
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConversations((l) => l.map((c) => (c.id === active.id ? { ...c, muted: !c.muted } : c)))}>
              <BellOff className="size-4" /> {active.muted ? "Unmute" : "Mute"}
            </Button>
          </div>
        </aside>
      ) : null}

      <NewConversationDialog open={dialogOpen} onOpenChange={setDialogOpen} contacts={contacts} onCreate={create} />
    </div>
  )
}
