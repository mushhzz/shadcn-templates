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

/** Hero-style card for a headline moment ("Best month on record"). */
export function HighlightCard({ eyebrow, title, description, value, delta, action, visual, tone = "default", className }: HighlightCardProps) {
  return (
    <Card
      data-slot="highlight-card"
      className={cn(
        "relative overflow-hidden",
        tone === "primary" && "bg-brand text-brand-foreground shadow-none [&_.text-muted-foreground]:text-brand-foreground/70 [&_.text-success]:text-brand-foreground",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4">
        <div className="grid min-w-0 gap-3">
          <div className="grid gap-1">
            {eyebrow ? <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</span> : null}
            <h3 className="font-heading text-xl font-semibold leading-tight tracking-tight">{title}</h3>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {value ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-heading text-4xl font-semibold tracking-tight tabular-nums">{value}</span>
              {delta ? <span className="text-xs text-success">{delta}</span> : null}
            </div>
          ) : null}
          {action ? <div>{action}</div> : null}
        </div>
        {visual ? <div className="shrink-0 opacity-60" aria-hidden>{visual}</div> : null}
      </CardContent>
    </Card>
  )
}
