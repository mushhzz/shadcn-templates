"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatUserRow } from "@/lib/chat/types"

export type NewConversationInput = { kind: "dm" | "group"; name?: string; participantIds: string[] }

export function NewConversationDialog({
  open,
  onOpenChange,
  contacts,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: ChatUserRow[]
  onCreate: (input: NewConversationInput) => void
}) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string[]>([])
  const [name, setName] = React.useState("")
  const isGroup = selected.length > 1
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))

  const reset = () => {
    setQuery("")
    setSelected([])
    setName("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>Pick one person for a direct message, or several to start a group.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Input placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <ScrollArea className="h-56 rounded-md border">
            <div className="grid p-1">
              {filtered.map((c) => {
                const checked = selected.includes(c.id)
                return (
                  <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => setSelected((s) => (v ? [...s, c.id] : s.filter((id) => id !== c.id)))}
                      aria-label={`Select ${c.name}`}
                    />
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">{c.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 text-sm">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{c.title}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </ScrollArea>
          {isGroup ? (
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group name</Label>
              <Input id="group-name" placeholder="e.g. Launch planning" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0 || (isGroup && name.trim() === "")}
            onClick={() => {
              onCreate({ kind: isGroup ? "group" : "dm", name: isGroup ? name.trim() : undefined, participantIds: selected })
              reset()
              onOpenChange(false)
            }}
          >
            {isGroup ? "Create group" : "Start chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
