"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { Line, LineChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type StatCardProps = {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  sparkline?: number[]
  className?: string
}

export function formatDelta(delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : ""
  return `${sign}${Math.abs(delta).toFixed(1)}%`
}

const sparkConfig = { v: { label: "Value", color: "var(--chart-1)" } } satisfies ChartConfig

export function StatCard({ label, value, delta, deltaLabel, sparkline, className }: StatCardProps) {
  const trend =
    delta === undefined ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat"
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus

  return (
    <Card data-slot="stat-card" className={cn("gap-2", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          {trend && delta !== undefined ? (
            <div
              data-testid="stat-card-delta"
              data-trend={trend}
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                trend === "up" && "text-emerald-600 dark:text-emerald-400",
                trend === "down" && "text-red-600 dark:text-red-400",
                trend === "flat" && "text-muted-foreground",
              )}
            >
              <TrendIcon className="size-3" />
              <span>{formatDelta(delta)}</span>
              {deltaLabel ? <span className="text-muted-foreground">{deltaLabel}</span> : null}
            </div>
          ) : null}
        </div>
        {sparkline && sparkline.length > 1 ? (
          <div data-testid="stat-card-sparkline" className="h-10 w-24">
            <ChartContainer config={sparkConfig} className="aspect-auto h-full w-full">
              <LineChart
                data={sparkline.map((v, i) => ({ i, v }))}
                margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
              >
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-v)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
