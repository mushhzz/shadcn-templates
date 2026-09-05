"use client"

import { Copy, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { MessageAction, MessageList, type Message } from "@/components/blocks/message-list"

const me = { id: "me", name: "You", initials: "YO" }
const sam = { id: "sam", name: "Sam Rivera", initials: "SR" }
const at = (m: number) => new Date(2026, 8, 5, 9, m)
const messages: Message[] = [
  { id: "1", author: sam, body: "Morning! Did the deploy go out?", createdAt: at(0) },
  { id: "2", author: sam, body: "Dashboard looks a bit off on mobile.", createdAt: at(1) },
  { id: "3", author: me, body: "Yes, shipped at 8:40.\nLooking at the mobile issue now.", createdAt: at(3), status: "read" },
  { id: "4", author: sam, body: "Great, thanks!", createdAt: at(15) },
]

export function MessageListDemo() {
  return (
    <MessageList
      messages={messages}
      currentUserId="me"
      className="rounded-md border"
      renderActions={(m) => (
        <>
          <MessageAction label="Copy" onClick={() => toast(`Copied: ${m.body?.slice(0, 20)}…`)}>
            <Copy className="size-3.5" />
          </MessageAction>
          {m.author.id === "me" ? (
            <MessageAction label="Retry" onClick={() => toast("Resent")}>
              <RotateCcw className="size-3.5" />
            </MessageAction>
          ) : null}
        </>
      )}
    />
  )
}
