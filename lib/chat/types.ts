export type Presence = "online" | "away" | "offline"

export type ChatUser = {
  id: string
  name: string
  handle: string
  title: string
  presence: Presence
  timezone: string
}

export type Conversation = {
  id: string
  kind: "dm" | "group"
  /** Group name; DMs derive their name from the other participant. */
  name?: string
  participantIds: string[]
  unread: number
  pinned: boolean
  muted: boolean
}

export type ChatMessage = {
  id: string
  conversationId: string
  authorId: string
  body: string
  minutesAgo: number
  status?: "sent" | "delivered" | "read"
}

export type ConversationRow = Conversation & {
  title: string
  initials: string
  participants: ChatUser[]
  lastMessage?: ChatMessage & { at: Date }
}

export type ChatUserRow = ChatUser & { initials: string }
