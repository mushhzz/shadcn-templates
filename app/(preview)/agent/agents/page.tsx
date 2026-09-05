import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { AgentsList } from "@/components/agent/agents-list"
import { getAgents } from "@/lib/agent/queries"

export default function AgentsPage() {
  return (
    <>
      <PageHeader title="Agents" description="Configured agents and how they are performing." actions={<Button>New agent</Button>} />
      <AgentsList agents={getAgents()} />
    </>
  )
}
