import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ContactStatus, DealStage, TaskPriority } from "@/lib/crm/types"

const stageClass: Record<DealStage, string> = {
  lead: "bg-muted text-foreground",
  qualified: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  proposal: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  negotiation: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  won: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  lost: "bg-red-500/15 text-red-700 dark:text-red-300",
}

export function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", stageClass[stage])}>
      {stage}
    </Badge>
  )
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const variant = status === "customer" ? "default" : status === "lead" ? "secondary" : "outline"
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cls =
    priority === "high"
      ? "bg-red-500/15 text-red-700 dark:text-red-300"
      : priority === "medium"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-muted text-muted-foreground"
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", cls)}>
      {priority}
    </Badge>
  )
}
