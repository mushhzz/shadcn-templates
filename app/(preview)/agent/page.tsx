import { AgentWorkspace } from "@/components/agent/agent-workspace"
import { getAgents, getConversations, getMessages } from "@/lib/agent/queries"

export default function AgentWorkspacePage() {
  const conversations = getConversations()
  const threads = Object.fromEntries(conversations.map((c) => [c.id, getMessages(c.id)]))
  return <AgentWorkspace agents={getAgents()} conversations={conversations} threads={threads} />
}
