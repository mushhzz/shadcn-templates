import { ChatWorkspace } from "@/components/chat/chat-workspace"
import { getContacts, getConversations, getCurrentUser, getMessages } from "@/lib/chat/queries"

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const { with: withUserId } = await searchParams
  const conversations = getConversations()
  const threads = Object.fromEntries(conversations.map((c) => [c.id, getMessages(c.id)]))
  const initial = withUserId
    ? conversations.find((c) => c.kind === "dm" && c.participantIds.includes(withUserId))?.id
    : undefined

  return (
    <ChatWorkspace
      currentUser={getCurrentUser()}
      conversations={conversations}
      threads={threads}
      contacts={getContacts()}
      initialConversationId={initial}
    />
  )
}
