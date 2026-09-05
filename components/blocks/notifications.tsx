"use client"

import * as React from "react"
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/blocks/empty-state"
import { cn } from "@/lib/utils"

export type NotificationKind = "info" | "success" | "warning" | "message"

export type Notification = {
  id: string
  title: string
  description?: string
  at: Date
  read: boolean
  kind?: NotificationKind
  href?: string
}

const icons: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  message: MessageSquare,
}

const tone: Record<NotificationKind, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  message: "text-primary",
}

function relative(d: Date, now: Date): string {
  const mins = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export type NotificationsProps = {
  items: Notification[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onOpen?: (item: Notification) => void
  className?: string
}

export function Notifications({ items, onMarkRead, onMarkAllRead, onOpen, className }: NotificationsProps) {
  const [tab, setTab] = React.useState<"all" | "unread">("all")
  const [now] = React.useState(() => new Date())
  const unread = items.filter((n) => !n.read)
  const list = tab === "unread" ? unread : items

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)} aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}>
          <Bell className="size-4" />
          {unread.length > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive" />
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-2rem)] p-0 sm:w-96">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread{unread.length ? ` (${unread.length})` : ""}
              </TabsTrigger>
            </TabsList>
            {onMarkAllRead ? (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkAllRead} disabled={unread.length === 0}>
                <CheckCheck className="size-3.5" /> Mark all read
              </Button>
            ) : null}
          </div>
          <TabsContent value={tab} className="m-0">
            {list.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={Bell} title="You're all caught up" description="New notifications will show up here." className="border-0 p-6" />
              </div>
            ) : (
              <ul className="max-h-96 overflow-y-auto" aria-label="Notifications">
                {list.map((n) => {
                  const Icon = icons[n.kind ?? "info"]
                  return (
                    <li key={n.id} className="border-b last:border-0">
                      <button
                        type="button"
                        className={cn("flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-muted/60", !n.read && "bg-muted/30")}
                        onClick={() => {
                          onMarkRead?.(n.id)
                          onOpen?.(n)
                        }}
                      >
                        <Icon className={cn("mt-0.5 size-4 shrink-0", tone[n.kind ?? "info"])} aria-hidden />
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <span className={cn("truncate text-sm", !n.read && "font-medium")}>{n.title}</span>
                          {n.description ? <span className="line-clamp-2 text-xs text-muted-foreground">{n.description}</span> : null}
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <time className="text-xs text-muted-foreground" dateTime={n.at.toISOString()} suppressHydrationWarning>
                            {relative(n.at, now)}
                          </time>
                          {!n.read ? <span className="size-2 rounded-full bg-primary" aria-label="Unread" /> : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
