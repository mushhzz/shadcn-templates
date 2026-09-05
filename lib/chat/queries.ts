import { CURRENT_USER_ID, conversations, messages, users } from "./fixtures"
import type { ChatMessage, ChatUser, ChatUserRow, ConversationRow } from "./types"

const userById = new Map(users.map((u) => [u.id, u]))

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("")
}

function at(now: Date, minutesAgo: number): Date {
  return new Date(now.getTime() - minutesAgo * 60000)
}

export function getCurrentUser(): ChatUserRow {
  const me = userById.get(CURRENT_USER_ID) as ChatUser
  return { ...me, initials: initialsOf(me.name) }
}

export function getUsers(): ChatUserRow[] {
  return users.map((u) => ({ ...u, initials: initialsOf(u.name) }))
}

export function getContacts(): ChatUserRow[] {
  return getUsers()
    .filter((u) => u.id !== CURRENT_USER_ID)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getMessages(conversationId: string, now: Date = new Date()): (ChatMessage & { at: Date })[] {
  return messages
    .filter((m) => m.conversationId === conversationId)
    .map((m) => ({ ...m, at: at(now, m.minutesAgo) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())
}

export function getConversations(now: Date = new Date()): ConversationRow[] {
  return conversations
    .map<ConversationRow>((c) => {
      const participants = c.participantIds.map((id) => userById.get(id)).filter((u): u is ChatUser => !!u)
      const others = participants.filter((u) => u.id !== CURRENT_USER_ID)
      const title = c.kind === "group" ? (c.name ?? "Group") : (others[0]?.name ?? "Conversation")
      const thread = getMessages(c.id, now)
      return {
        ...c,
        title,
        initials: initialsOf(title),
        participants,
        lastMessage: thread[thread.length - 1],
      }
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return (b.lastMessage?.at.getTime() ?? 0) - (a.lastMessage?.at.getTime() ?? 0)
    })
}

export function getConversationById(id: string, now: Date = new Date()): ConversationRow | undefined {
  return getConversations(now).find((c) => c.id === id)
}

export function getUserById(id: string): ChatUserRow | undefined {
  const u = userById.get(id)
  return u ? { ...u, initials: initialsOf(u.name) } : undefined
}

export { CURRENT_USER_ID }
