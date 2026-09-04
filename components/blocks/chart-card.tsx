"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ChartRange = { value: string; label: string }

export type ChartCardProps = {
  title: string
  description?: string
  ranges?: ChartRange[]
  range?: string
  onRangeChange?: (value: string) => void
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
  config,
  children,
  className,
  chartClassName,
}: ChartCardProps) {
  const firstRange = ranges?.[0]
  return (
    <Card data-slot="chart-card" className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {ranges && firstRange ? (
          <Tabs value={range ?? firstRange.value} onValueChange={(v) => onRangeChange?.(v)}>
            <TabsList>
              {ranges.map((r) => (
                <TabsTrigger key={r.value} value={r.value}>
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={cn("aspect-[16/6] w-full", chartClassName)}>
          {children}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
