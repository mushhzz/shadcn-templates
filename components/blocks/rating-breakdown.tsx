import { Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type RatingBreakdownProps = {
  title: string
  description?: string
  /** Counts for 5 down to 1 stars. */
  counts: [number, number, number, number, number]
  actions?: React.ReactNode
  className?: string
}

export function RatingBreakdown({ title, description, counts, actions, className }: RatingBreakdownProps) {
  const total = counts.reduce((s, n) => s + n, 0)
  const average = total ? counts.reduce((s, n, i) => s + n * (5 - i), 0) / total : 0
  return (
    <Card data-slot="rating-breakdown" className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-1 sm:w-32">
          <div className="flex" role="img" aria-label={`${average.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={cn("size-5", s <= Math.round(average) ? "fill-warning text-warning" : "text-muted-foreground/40")} aria-hidden />
            ))}
          </div>
          <div className="text-3xl font-semibold tabular-nums">{average.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            {total.toLocaleString("en-US")} review{total === 1 ? "" : "s"}
          </div>
        </div>
        <div className="grid flex-1 gap-3">
          {counts.map((n, i) => {
            const stars = 5 - i
            const pct = total ? (n / total) * 100 : 0
            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="flex w-8 items-center gap-1 tabular-nums">
                  {stars}
                  <Star className="size-3 fill-warning text-warning" aria-hidden />
                </span>
                <Progress value={pct} className="h-2 flex-1" aria-label={`${stars} stars: ${Math.round(pct)}%`} />
                <span className="w-12 text-right tabular-nums text-muted-foreground">{n.toLocaleString("en-US")}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
