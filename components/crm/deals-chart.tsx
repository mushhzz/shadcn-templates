"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"

const config = {
  value: { label: "Pipeline value", color: "var(--chart-1)" },
}

export function DealsChart({ data }: { data: { stage: string; count: number; value: number }[] }) {
  return (
    <ChartCard title="Pipeline by stage" description="Total deal value in each stage" config={config}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="stage" tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartCard>
  )
}
