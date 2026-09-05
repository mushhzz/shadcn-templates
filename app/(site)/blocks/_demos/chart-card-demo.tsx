"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"

const data = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 1900 },
  { month: "Mar", revenue: 1600 },
  { month: "Apr", revenue: 2400 },
  { month: "May", revenue: 2100 },
  { month: "Jun", revenue: 2800 },
]
const config = { revenue: { label: "Revenue", color: "var(--chart-1)" } }
const ranges = [
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
]

export function ChartCardDemo() {
  const [range, setRange] = React.useState("6m")
  return (
    <ChartCard
      title="Revenue"
      description="Monthly gross revenue"
      ranges={ranges}
      range={range}
      onRangeChange={setRange}
      config={config}
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} minTickGap={24} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartCard>
  )
}
