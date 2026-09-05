import { describe, expect, it } from "vitest"
import {
  CURRENT_USER_ID,
  getContacts,
  getConversationById,
  getConversations,
  getCurrentUser,
  getMessages,
} from "@/lib/chat/queries"

const now = new Date("2026-09-05T12:00:00Z")

describe("chat queries", () => {
  it("derives DM titles from the other participant and group titles from the name", () => {
    const list = getConversations(now)
    expect(list.find((c) => c.id === "c_sam")?.title).toBe("Sam Rivera")
    expect(list.find((c) => c.id === "c_design")?.title).toBe("Design review")
  })

  it("sorts pinned first, then most recent", () => {
    const list = getConversations(now)
    expect(list[0]!.pinned).toBe(true)
    const unpinned = list.filter((c) => !c.pinned)
    for (let i = 1; i < unpinned.length; i++) {
      expect(unpinned[i - 1]!.lastMessage!.at.getTime()).toBeGreaterThanOrEqual(unpinned[i]!.lastMessage!.at.getTime())
    }
  })

  it("returns messages oldest first with dates", () => {
    const thread = getMessages("c_sam", now)
    expect(thread.length).toBeGreaterThan(3)
    for (let i = 1; i < thread.length; i++) {
      expect(thread[i]!.at.getTime()).toBeGreaterThanOrEqual(thread[i - 1]!.at.getTime())
    }
    expect(getConversationById("c_sam", now)?.lastMessage?.id).toBe(thread.at(-1)?.id)
  })

  it("excludes the current user from contacts", () => {
    expect(getCurrentUser().id).toBe(CURRENT_USER_ID)
    expect(getContacts().some((u) => u.id === CURRENT_USER_ID)).toBe(false)
    expect(getContacts().length).toBeGreaterThanOrEqual(9)
  })
})
