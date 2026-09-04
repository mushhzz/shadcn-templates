import * as React from "react"
import { Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type MessageAuthor = { id: string; name: string; initials: string }

export type Message = {
  id: string
  author: MessageAuthor
  body?: string
  createdAt: Date
  status?: "sent" | "delivered" | "read"
  attachments?: React.ReactNode
}

export type MessageListProps = {
  messages: Message[]
  currentUserId: string
  groupWindowMs?: number
  className?: string
  emptyState?: React.ReactNode
}

/** Groups consecutive messages from the same author sent within `windowMs` of each other. */
export function groupMessages(messages: Message[], windowMs: number): Message[][] {
  const groups: Message[][] = []
  for (const m of messages) {
    const last = groups[groups.length - 1]
    const prev = last?.[last.length - 1]
    if (
      last &&
      prev &&
      prev.author.id === m.author.id &&
      m.createdAt.getTime() - prev.createdAt.getTime() <= windowMs
    ) {
      last.push(m)
    } else {
      groups.push([m])
    }
  }
  return groups
}

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })

function Status({ status }: { status: Message["status"] }) {
  if (!status) return null
  const Icon = status === "sent" ? Check : CheckCheck
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px]",
        status === "read" ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-3" />
      <span className="capitalize">{status}</span>
    </span>
  )
}

export function MessageList({
  messages,
  currentUserId,
  groupWindowMs = 5 * 60 * 1000,
  className,
  emptyState,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-1 items-center justify-center p-8", className)}>
        {emptyState}
      </div>
    )
  }
  const groups = groupMessages(messages, groupWindowMs)
  return (
    <div data-slot="message-list" className={cn("flex flex-col gap-4 p-4", className)}>
      {groups.map((group) => {
        const first = group[0]
        if (!first) return null
        const own = first.author.id === currentUserId
        return (
          <div
            key={first.id}
            data-own={own}
            className={cn("flex gap-2", own ? "flex-row-reverse" : "flex-row")}
          >
            <Avatar className="size-8 shrink-0">
              <AvatarFallback>{first.author.initials}</AvatarFallback>
            </Avatar>
            <div className={cn("flex max-w-[75%] flex-col gap-1", own ? "items-end" : "items-start")}>
              <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
                {!own ? <span className="font-medium text-foreground">{first.author.name}</span> : null}
                <time dateTime={first.createdAt.toISOString()}>{timeFmt.format(first.createdAt)}</time>
              </div>
              {group.map((m, i) => (
                <div key={m.id} className={cn("flex flex-col gap-1", own ? "items-end" : "items-start")}>
                  {m.body ? (
                    <div
                      className={cn(
                        "whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                        own ? "bg-primary text-primary-foreground" : "bg-muted",
                        i === 0 && (own ? "rounded-tr-md" : "rounded-tl-md"),
                      )}
                    >
                      {m.body}
                    </div>
                  ) : null}
                  {m.attachments ? <div className="w-full">{m.attachments}</div> : null}
                  {own && i === group.length - 1 ? <Status status={m.status} /> : null}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
