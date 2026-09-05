import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type ProgressItem = {
  id: string
  label: string
  value: number
  /** Value shown at the right; defaults to `value` formatted. */
  display?: string
  /** Percentage change shown as a small badge. */
  delta?: number
  /** Icon element, e.g. `<Globe />`. */
  icon?: React.ReactNode
}

export type ProgressListProps = {
  title: string
  description?: string
  items: ProgressItem[]
  /** Denominator for the bars; defaults to the largest value. */
  max?: number
  formatValue?: (n: number) => string
  actions?: React.ReactNode
  className?: string
}

/** Ranked list with proportional bars, like "sales by region" or "top products". */
export function ProgressList({ title, description, items, max, formatValue = (n) => n.toLocaleString("en-US"), actions, className }: ProgressListProps) {
  const denominator = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <Card data-slot="progress-list" className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item) => {
          const pct = Math.max(0, Math.min(100, (item.value / denominator) * 100))
          return (
            <div key={item.id} className="grid gap-1.5">
              <div className="flex items-center gap-2 text-sm">
                {item.icon ? (
                  <span className="shrink-0 text-muted-foreground [&>svg]:size-4" aria-hidden>
                    {item.icon}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                {item.delta !== undefined ? (
                  <Badge
                    variant="outline"
                    className={cn("border-transparent px-1.5 text-[10px]", item.delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}
                  >
                    {item.delta >= 0 ? "+" : ""}
                    {item.delta.toFixed(1)}%
                  </Badge>
                ) : null}
                <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground">{item.display ?? formatValue(item.value)}</span>
              </div>
              <Progress value={pct} aria-label={`${item.label}: ${Math.round(pct)}%`} className="h-1.5" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
