"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  web: { label: "Web", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
  partner: { label: "Partner", color: "var(--chart-3)" },
}
const ranges = [
  { value: "6m", label: "6m" },
  { value: "12m", label: "12m" },
]

export function ChannelsChart({ data }: { data: MonthlyMetric[] }) {
  const [range, setRange] = React.useState("12m")
  const slice = data.slice(range === "6m" ? -6 : -12)
  return (
    <ChartCard
      title="Revenue by channel"
      description="Stacked by acquisition channel"
      ranges={ranges}
      range={range}
      onRangeChange={setRange}
      config={config}
    >
      <BarChart data={slice}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="web" stackId="a" fill="var(--color-web)" />
        <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" />
        <Bar dataKey="partner" stackId="a" fill="var(--color-partner)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  )
}
