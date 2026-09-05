import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { AgentBuilder } from "@/components/agent/agent-builder"
import { AgentStatusBadge } from "@/components/agent/status-badge"
import { getAgentById, getAgents, getKnowledge, getTools } from "@/lib/agent/queries"

export function generateStaticParams() {
  return getAgents().map((a) => ({ id: a.id }))
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = getAgentById(id)
  if (!agent) notFound()
  return (
    <>
      <PageHeader
        title={agent.name}
        description={agent.description}
        actions={
          <>
            <AgentStatusBadge status={agent.status} />
            <Button variant="outline" asChild>
              <Link href="/agent">Open in workspace</Link>
            </Button>
          </>
        }
      />
      <AgentBuilder agent={agent} tools={getTools()} knowledge={getKnowledge()} />
    </>
  )
}
