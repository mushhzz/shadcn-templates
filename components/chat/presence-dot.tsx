import { cn } from "@/lib/utils"
import type { Presence } from "@/lib/chat/types"

const color: Record<Presence, string> = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-muted-foreground/40",
}

export function PresenceDot({ presence, className }: { presence: Presence; className?: string }) {
  return (
    <span
      role="img"
      aria-label={presence}
      title={presence}
      className={cn("inline-block size-2.5 rounded-full ring-2 ring-background", color[presence], className)}
    />
  )
}
