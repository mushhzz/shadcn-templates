"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartCard } from "@/components/blocks/chart-card"
import type { UsageDay } from "@/lib/agent/types"

export function TokensChart({ data }: { data: UsageDay[] }) {
  return (
    <ChartCard title="Tokens" description="Input + output tokens per day" config={{ tokens: { label: "Tokens", color: "var(--chart-1)" } }}>
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="tokens" stroke="var(--color-tokens)" fill="var(--color-tokens)" fillOpacity={0.2} />
      </AreaChart>
    </ChartCard>
  )
}

export function CostChart({ data }: { data: UsageDay[] }) {
  return (
    <ChartCard title="Cost" description="Spend per day in USD" config={{ costUsd: { label: "Cost", color: "var(--chart-2)" } }}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `$${v}`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="costUsd" fill="var(--color-costUsd)" radius={4} />
      </BarChart>
    </ChartCard>
  )
}

export function LatencyChart({ data }: { data: UsageDay[] }) {
  return (
    <ChartCard title="Latency" description="Average run duration per day" config={{ latencyMs: { label: "Latency (ms)", color: "var(--chart-4)" } }}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={28} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}s`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="latencyMs" stroke="var(--color-latencyMs)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartCard>
  )
}

export function ByModelChart({ data }: { data: { model: string; costUsd: number; tokens: number }[] }) {
  return (
    <ChartCard title="Cost by model" description="Last 14 days" config={{ costUsd: { label: "Cost", color: "var(--chart-3)" } }} chartClassName="aspect-[16/10] sm:aspect-[16/8]">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
        <YAxis type="category" dataKey="model" tickLine={false} axisLine={false} width={120} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="costUsd" fill="var(--color-costUsd)" radius={4} />
      </BarChart>
    </ChartCard>
  )
}
