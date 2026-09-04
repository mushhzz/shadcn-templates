import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MessageList, groupMessages, type Message } from "@/components/blocks/message-list"

const me = { id: "me", name: "Me", initials: "ME" }
const you = { id: "you", name: "You", initials: "YO" }
const t = (s: number) => new Date(2026, 0, 1, 12, 0, s)

const messages: Message[] = [
  { id: "1", author: you, body: "hi", createdAt: t(0) },
  { id: "2", author: you, body: "there", createdAt: t(30) },
  { id: "3", author: me, body: "hello", createdAt: t(60), status: "read" },
  { id: "4", author: you, body: "late", createdAt: t(60 * 20) },
]

describe("groupMessages", () => {
  it("groups consecutive same-author messages within the window", () => {
    const groups = groupMessages(messages, 5 * 60 * 1000)
    expect(groups.map((g) => g.map((m) => m.id))).toEqual([["1", "2"], ["3"], ["4"]])
  })
})

describe("MessageList", () => {
  it("renders bodies, aligns own messages, shows status on own messages", () => {
    render(<MessageList messages={messages} currentUserId="me" />)
    expect(screen.getByText("hello").closest("[data-own]")).toHaveAttribute("data-own", "true")
    expect(screen.getByText("hi").closest("[data-own]")).toHaveAttribute("data-own", "false")
    expect(screen.getByText(/read/i)).toBeInTheDocument()
  })

  it("renders empty state", () => {
    render(<MessageList messages={[]} currentUserId="me" emptyState={<p>No messages yet</p>} />)
    expect(screen.getByText("No messages yet")).toBeInTheDocument()
  })
})
