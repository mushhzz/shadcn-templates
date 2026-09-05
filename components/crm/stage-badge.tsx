import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ContactStatus, DealStage, TaskPriority } from "@/lib/crm/types"

const stageClass: Record<DealStage, string> = {
  lead: "bg-muted text-foreground",
  qualified: "bg-info/15 text-info",
  proposal: "bg-primary/10 text-primary",
  negotiation: "bg-warning/15 text-warning",
  won: "bg-success/15 text-success",
  lost: "bg-destructive/10 text-destructive",
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
      ? "bg-destructive/10 text-destructive"
      : priority === "medium"
        ? "bg-warning/15 text-warning"
        : "bg-muted text-muted-foreground"
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", cls)}>
      {priority}
    </Badge>
  )
}
