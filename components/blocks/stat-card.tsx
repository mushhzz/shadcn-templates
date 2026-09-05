"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Bar, BarChart, Line, LineChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type StatCardProps = {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  /** Optional icon element shown top-right, e.g. `<DollarSign />`. An element (not a component) so server pages can pass it. */
  icon?: React.ReactNode
  sparkline?: number[]
  sparklineType?: "line" | "bar"
  /** Where the sparkline sits: beside the value (default) or full-width below it. */
  layout?: "inline" | "stacked"
  className?: string
}

export function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : ""
  return `${sign}${Math.abs(delta).toFixed(1)}%`
}

const sparkConfig = { v: { label: "Value", color: "var(--chart-2)" } } satisfies ChartConfig

function Sparkline({ data, type }: { data: number[]; type: "line" | "bar" }) {
  const rows = data.map((v, i) => ({ i, v }))
  return (
    <ChartContainer config={sparkConfig} className="aspect-auto h-full w-full">
      {type === "bar" ? (
        <BarChart data={rows} margin={{ top: 2, bottom: 2, left: 0, right: 0 }} barCategoryGap={2} accessibilityLayer={false}>
          <Bar dataKey="v" fill="var(--color-v)" radius={2} isAnimationActive={false} />
        </BarChart>
      ) : (
        <LineChart data={rows} margin={{ top: 2, bottom: 2, left: 0, right: 0 }} accessibilityLayer={false}>
          <Line type="monotone" dataKey="v" stroke="var(--color-v)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      )}
    </ChartContainer>
  )
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  sparkline,
  sparklineType = "line",
  layout = "inline",
  className,
}: StatCardProps) {
  const trend = delta === undefined ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat"
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus
  const hasSpark = !!sparkline && sparkline.length > 1

  return (
    <Card data-slot="stat-card" className={cn("gap-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon ? (
          <span className="text-muted-foreground [&>svg]:size-4" aria-hidden>
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className={cn("flex gap-4", layout === "stacked" ? "flex-col" : "items-end justify-between")}>
        <div className="min-w-0">
          <div className="truncate text-2xl font-semibold tabular-nums">{value}</div>
          {trend && delta !== undefined ? (
            <div
              data-testid="stat-card-delta"
              data-trend={trend}
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "flat" && "text-muted-foreground",
              )}
            >
              <TrendIcon className="size-3" aria-hidden />
              <span>
                <span className="sr-only">{trend === "up" ? "Up " : trend === "down" ? "Down " : ""}</span>
                {formatDelta(delta)}
              </span>
              {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
            </div>
          ) : deltaLabel ? (
            <div className="mt-1 text-xs text-muted-foreground">{deltaLabel}</div>
          ) : null}
        </div>
        {hasSpark ? (
          <div
            data-testid="stat-card-sparkline"
            className={cn(layout === "stacked" ? "h-12 w-full" : "h-10 w-24 shrink-0")}
            aria-hidden
          >
            <Sparkline data={sparkline} type={sparklineType} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card data-slot="stat-card-skeleton" className={cn("gap-2", className)} aria-busy>
      <CardHeader className="pb-0">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  )
}
