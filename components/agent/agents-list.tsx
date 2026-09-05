import Link from "next/link"
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AgentStatusBadge } from "@/components/agent/status-badge"
import { modelName } from "@/lib/agent/queries"
import type { AgentRow } from "@/lib/agent/types"

export function AgentsList({ agents }: { agents: AgentRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((a) => (
        <Link key={a.id} href={`/agent/agents/${a.id}`} className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </span>
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </div>
                <AgentStatusBadge status={a.status} />
              </div>
              <CardDescription className="line-clamp-2">{a.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{modelName(a.model)}</Badge>
                {a.toolNames.slice(0, 3).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
                {a.toolNames.length > 3 ? <Badge variant="outline">+{a.toolNames.length - 3}</Badge> : null}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.runsLast7d.toLocaleString("en-US")} runs · 7d</span>
                <span className="tabular-nums">{a.successRate.toFixed(1)}% success</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
