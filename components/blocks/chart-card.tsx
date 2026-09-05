"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type ChartRange = { value: string; label: string }

export type ChartCardProps = {
  title: string
  description?: string
  ranges?: ChartRange[]
  range?: string
  onRangeChange?: (value: string) => void
  /** Extra controls rendered next to the range selector (export button, legend toggle…). */
  actions?: React.ReactNode
  config: ChartConfig
  children: React.ReactElement
  className?: string
  chartClassName?: string
}

export function ChartCard({
  title,
  description,
  ranges,
  range,
  onRangeChange,
  actions,
  config,
  children,
  className,
  chartClassName,
}: ChartCardProps) {
  const firstRange = ranges?.[0]
  return (
    <Card data-slot="chart-card" className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {(ranges && firstRange) || actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {ranges && firstRange ? (
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                aria-label="Time range"
                value={range ?? firstRange.value}
                onValueChange={(v) => {
                  if (v) onRangeChange?.(v)
                }}
              >
                {ranges.map((r) => (
                  <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
                    {r.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : null}
            {actions}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className={cn("aspect-[16/10] w-full sm:aspect-[16/6]", chartClassName)}
        >
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card data-slot="chart-card-skeleton" className={className} aria-busy>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-[16/10] w-full sm:aspect-[16/6]" />
      </CardContent>
    </Card>
  )
}
