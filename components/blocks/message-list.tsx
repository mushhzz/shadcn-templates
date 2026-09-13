"use client"

import * as React from "react"
import { Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Composable primitives. Use these directly for custom layouts; <MessageList> composes them.
 * -----------------------------------------------------------------------------------------------*/

export type MessageFrom = "user" | "assistant" | "other"

const MessageCtx = React.createContext<{ from: MessageFrom; variant: "contained" | "flat" }>({ from: "other", variant: "contained" })

export function Message({
  from,
  variant = "contained",
  className,
  ...props
}: React.ComponentProps<"div"> & { from: MessageFrom; variant?: "contained" | "flat" }) {
  const own = from === "user"
  return (
    <MessageCtx.Provider value={{ from, variant }}>
      <div
        data-slot="message"
        data-from={from}
        data-own={own}
        className={cn("group/message flex gap-2", own ? "flex-row-reverse" : "flex-row", className)}
        {...props}
      />
    </MessageCtx.Provider>
  )
}

export function MessageAvatar({ initials, src, className, ...props }: React.ComponentProps<typeof Avatar> & { initials: string; src?: string }) {
  return (
    <Avatar data-slot="message-avatar" className={cn("size-8 shrink-0", className)} {...props}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export function MessageBody({ className, ...props }: React.ComponentProps<"div">) {
  const { from } = React.useContext(MessageCtx)
  return (
    <div
      data-slot="message-body"
      className={cn("flex min-w-0 max-w-[75%] flex-col gap-1", from === "user" ? "items-end" : "items-start", className)}
      {...props}
    />
  )
}

export function MessageMeta({ name, at, className }: { name?: string; at: Date; className?: string }) {
  return (
    <div data-slot="message-meta" className={cn("flex items-baseline gap-2 text-xs text-muted-foreground", className)}>
      {name ? <span className="font-medium text-foreground">{name}</span> : null}
      {/* Server and browser time zones can differ; the client value wins. */}
      <time dateTime={at.toISOString()} suppressHydrationWarning>
        {timeFmt.format(at)}
      </time>
    </div>
  )
}

export function MessageContent({ className, first = true, ...props }: React.ComponentProps<"div"> & { first?: boolean }) {
  const { from, variant } = React.useContext(MessageCtx)
  const own = from === "user"
  return (
    <div
      data-slot="message-content"
      className={cn(
        "whitespace-pre-wrap text-sm",
        variant === "contained" && "rounded-2xl px-3 py-2",
        variant === "contained" && (own ? "bg-primary text-primary-foreground" : "bg-muted"),
        variant === "contained" && first && (own ? "rounded-tr-md" : "rounded-tl-md"),
        variant === "flat" && "py-0.5",
        className,
      )}
      {...props}
    />
  )
}

export function MessageStatus({ status, className }: { status?: "sent" | "delivered" | "read"; className?: string }) {
  if (!status) return null
  const Icon = status === "sent" ? Check : CheckCheck
  return (
    <span
      data-slot="message-status"
      className={cn("inline-flex items-center gap-1 text-[10px]", status === "read" ? "text-primary" : "text-muted-foreground", className)}
    >
      <Icon className="size-3" aria-hidden />
      <span className="capitalize">{status}</span>
    </span>
  )
}

/** Hover actions (copy, retry…). Hidden until the message is hovered or focused. */
export function MessageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-actions"
      className={cn(
        "flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100",
        className,
      )}
      {...props}
    />
  )
}

export function MessageAction({ label, children, ...props }: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label={label} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Data-driven list
 * -----------------------------------------------------------------------------------------------*/

export type MessageAuthor = { id: string; name: string; initials: string; avatar?: string }

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
  variant?: "contained" | "flat"
  /** Render hover actions for a message. */
  renderActions?: (message: Message) => React.ReactNode
  className?: string
  emptyState?: React.ReactNode
}

/** Groups consecutive messages from the same author sent within `windowMs` of each other. */
export function groupMessages(messages: Message[], windowMs: number): Message[][] {
  const groups: Message[][] = []
  for (const m of messages) {
    const last = groups[groups.length - 1]
    const prev = last?.[last.length - 1]
    if (last && prev && prev.author.id === m.author.id && m.createdAt.getTime() - prev.createdAt.getTime() <= windowMs) {
      last.push(m)
    } else {
      groups.push([m])
    }
  }
  return groups
}

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" })

export function MessageList({
  messages,
  currentUserId,
  groupWindowMs = 5 * 60 * 1000,
  variant = "contained",
  renderActions,
  className,
  emptyState,
}: MessageListProps) {
  if (messages.length === 0) {
    return <div className={cn("flex flex-1 items-center justify-center p-8", className)}>{emptyState}</div>
  }
  const groups = groupMessages(messages, groupWindowMs)
  return (
    <div data-slot="message-list" role="log" aria-live="polite" className={cn("flex flex-col gap-4 p-4", className)}>
      {groups.map((group) => {
        const first = group[0]
        if (!first) return null
        const own = first.author.id === currentUserId
        return (
          <Message key={first.id} from={own ? "user" : "other"} variant={variant}>
            <MessageAvatar initials={first.author.initials} src={first.author.avatar} />
            <MessageBody>
              <MessageMeta name={own ? undefined : first.author.name} at={first.createdAt} />
              {group.map((m, i) => (
                <div key={m.id} className={cn("flex w-full flex-col gap-1", own ? "items-end" : "items-start")}>
                  <div className={cn("flex items-end gap-1", own ? "flex-row-reverse" : "flex-row")}>
                    {m.body ? <MessageContent first={i === 0}>{m.body}</MessageContent> : null}
                    {renderActions ? <MessageActions>{renderActions(m)}</MessageActions> : null}
                  </div>
                  {m.attachments ? <div className="w-full">{m.attachments}</div> : null}
                  {own && i === group.length - 1 ? <MessageStatus status={m.status} /> : null}
                </div>
              ))}
            </MessageBody>
          </Message>
        )
      })}
    </div>
  )
}

export function MessageListSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div data-slot="message-list-skeleton" className={cn("flex flex-col gap-4 p-4", className)} aria-busy>
      {Array.from({ length: count }).map((_, i) => {
        const own = i % 2 === 1
        return (
          <div key={i} className={cn("flex gap-2", own ? "flex-row-reverse" : "flex-row")}>
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className={cn("flex max-w-[75%] flex-col gap-1", own ? "items-end" : "items-start")}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className={cn("h-9 rounded-2xl", i % 3 === 0 ? "w-56" : "w-40")} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
