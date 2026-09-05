import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type HighlightCardProps = {
  eyebrow?: string
  title: string
  description?: string
  value?: string
  delta?: string
  action?: React.ReactNode
  /** Decorative illustration or icon on the right. */
  visual?: React.ReactNode
  tone?: "default" | "primary"
  className?: string
}

/** Hero-style card for a headline moment ("Congratulations, best month yet"). */
export function HighlightCard({ eyebrow, title, description, value, delta, action, visual, tone = "default", className }: HighlightCardProps) {
  return (
    <Card
      data-slot="highlight-card"
      className={cn(
        "relative overflow-hidden",
        tone === "primary" && "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4">
        <div className="grid min-w-0 gap-3">
          <div className="grid gap-1">
            {eyebrow ? <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</span> : null}
            <h3 className="text-lg font-semibold leading-tight">{title}</h3>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {value ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">{value}</span>
              {delta ? <span className="text-xs text-success">{delta}</span> : null}
            </div>
          ) : null}
          {action ? <div>{action}</div> : null}
        </div>
        {visual ? <div className="shrink-0 text-primary/80" aria-hidden>{visual}</div> : null}
      </CardContent>
    </Card>
  )
}
