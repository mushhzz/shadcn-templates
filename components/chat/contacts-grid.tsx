"use client"

import * as React from "react"
import Link from "next/link"
import { MessageSquare, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/blocks/empty-state"
import { PresenceDot } from "@/components/chat/presence-dot"
import type { ChatUserRow, Presence } from "@/lib/chat/types"

export function ContactsGrid({ contacts }: { contacts: ChatUserRow[] }) {
  const [query, setQuery] = React.useState("")
  const [presence, setPresence] = React.useState<Presence | "all">("all")
  const filtered = contacts.filter(
    (c) =>
      (presence === "all" || c.presence === presence) &&
      [c.name, c.handle, c.title].some((v) => v.toLowerCase().includes(query.trim().toLowerCase())),
  )
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search people" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Tabs value={presence} onValueChange={(v) => setPresence(v as Presence | "all")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="away">Away</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No people found" description="Try a different name or status." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="size-11">
                    <AvatarFallback>{c.initials}</AvatarFallback>
                  </Avatar>
                  <PresenceDot presence={c.presence} className="absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="grid min-w-0 flex-1">
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{c.title}</span>
                  <span className="truncate text-xs text-muted-foreground">@{c.handle} · {c.timezone}</span>
                </div>
                <Button asChild variant="outline" size="icon" aria-label={`Message ${c.name}`}>
                  <Link href={`/chat?with=${c.id}`}>
                    <MessageSquare className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
