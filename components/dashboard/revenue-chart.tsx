"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
}
const ranges = [
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "12m", label: "12m" },
]

export function RevenueChart({ data }: { data: MonthlyMetric[] }) {
  const [range, setRange] = React.useState("12m")
  const n = range === "3m" ? 3 : range === "6m" ? 6 : 12
  const slice = data.slice(-n)
  return (
    <ChartCard
      title="Revenue"
      description="Monthly revenue against target"
      ranges={ranges}
      range={range}
      onRangeChange={setRange}
      config={config}
    >
      <AreaChart data={slice} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="target"
          stroke="var(--color-target)"
          fill="var(--color-target)"
          fillOpacity={0.08}
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartCard>
  )
}
