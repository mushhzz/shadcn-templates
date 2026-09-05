"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type DonutSlice = { key: string; label: string; value: number; color?: string }

export type DonutChartProps = {
  title: string
  description?: string
  data: DonutSlice[]
  /** Big number in the middle; defaults to the total. */
  centerValue?: string
  centerLabel?: string
  /** Serializable formatter choice so server pages can use this block; `formatValue` overrides it. */
  valueFormat?: "number" | "currency" | "percent"
  currency?: string
  formatValue?: (n: number) => string
  /** Show a legend list with values and percentages under the chart. */
  legend?: boolean
  footer?: React.ReactNode
  className?: string
}

export function DonutChart({
  title,
  description,
  data,
  centerValue,
  centerLabel,
  valueFormat = "number",
  currency = "USD",
  formatValue: formatValueProp,
  legend = true,
  footer,
  className,
}: DonutChartProps) {
  const formatValue =
    formatValueProp ??
    (valueFormat === "currency"
      ? (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
      : valueFormat === "percent"
        ? (n: number) => `${n.toFixed(1)}%`
        : (n: number) => n.toLocaleString("en-US"))
  const total = data.reduce((s, d) => s + d.value, 0)
  const config = Object.fromEntries(data.map((d, i) => [d.key, { label: d.label, color: d.color ?? `var(--chart-${(i % 5) + 1})` }])) satisfies ChartConfig
  const rows = data.map((d) => ({ ...d, fill: `var(--color-${d.key})` }))
  return (
    <Card data-slot="donut-chart" className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-56">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={rows} dataKey="value" nameKey="label" innerRadius={60} strokeWidth={4} paddingAngle={2}>
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  const { cx, cy } = viewBox as { cx: number; cy: number }
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={cx} y={cy} className="fill-foreground text-2xl font-semibold">
                        {centerValue ?? formatValue(total)}
                      </tspan>
                      {centerLabel ? (
                        <tspan x={cx} y={cy + 20} className="fill-muted-foreground text-xs">
                          {centerLabel}
                        </tspan>
                      ) : null}
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {legend ? (
        <CardFooter className="grid gap-2 text-sm">
          {data.map((d, i) => (
            <div key={d.key} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: d.color ?? `var(--chart-${(i % 5) + 1})` }} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{d.label}</span>
              <span className="tabular-nums text-muted-foreground">{total ? Math.round((d.value / total) * 100) : 0}%</span>
              <span className="w-16 text-right tabular-nums">{formatValue(d.value)}</span>
            </div>
          ))}
          {footer}
        </CardFooter>
      ) : footer ? (
        <CardFooter>{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
