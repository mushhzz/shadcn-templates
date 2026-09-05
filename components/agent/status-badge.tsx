import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AgentStatus, RunStatus } from "@/lib/agent/types"

const runClass: Record<RunStatus, string> = {
  running: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  succeeded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-red-500/15 text-red-700 dark:text-red-300",
  cancelled: "bg-muted text-muted-foreground",
}

export function RunStatusBadge({ status }: { status: RunStatus }) {
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", runClass[status])}>
      {status === "running" ? <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current" /> : null}
      {status}
    </Badge>
  )
}

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const variant = status === "active" ? "default" : status === "paused" ? "outline" : "secondary"
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}
