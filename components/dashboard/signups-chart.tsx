"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { MonthlyMetric } from "@/lib/dashboard/types"

const config = {
  signups: { label: "Signups", color: "var(--chart-4)" },
  orders: { label: "Orders", color: "var(--chart-5)" },
}

export function SignupsChart({ data }: { data: MonthlyMetric[] }) {
  return (
    <ChartCard title="Signups and orders" description="Monthly counts" config={config}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="signups"
          stroke="var(--color-signups)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="var(--color-orders)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartCard>
  )
}
