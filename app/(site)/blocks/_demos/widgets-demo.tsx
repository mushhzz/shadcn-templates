"use client"

import { PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DonutChart } from "@/components/blocks/donut-chart"
import { HighlightCard } from "@/components/blocks/highlight-card"
import { ProgressList } from "@/components/blocks/progress-list"
import { RatingBreakdown } from "@/components/blocks/rating-breakdown"

export function DonutChartDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DonutChart
        title="Store visits by source"
        description="Last 30 days"
        centerLabel="visits"
        data={[
          { key: "direct", label: "Direct", value: 520 },
          { key: "search", label: "Search", value: 310 },
          { key: "social", label: "Social", value: 180 },
          { key: "referral", label: "Referral", value: 115 },
        ]}
      />
      <DonutChart
        title="Plan mix"
        description="Active subscriptions"
        legend={false}
        centerLabel="accounts"
        data={[
          { key: "free", label: "Free", value: 140 },
          { key: "pro", label: "Pro", value: 96 },
          { key: "team", label: "Team", value: 42 },
        ]}
      />
    </div>
  )
}

export function ProgressListDemo() {
  return (
    <ProgressList
      title="Sales by location"
      description="Share of revenue by country"
      max={100}
      formatValue={(n) => `${n}%`}
      items={[
        { id: "ca", label: "Canada", value: 85, delta: 5.2 },
        { id: "gl", label: "Greenland", value: 80, delta: 7.8 },
        { id: "ru", label: "Russia", value: 63, delta: -2.1 },
        { id: "cn", label: "China", value: 60, delta: 3.4 },
        { id: "au", label: "Australia", value: 45, delta: 1.1 },
      ]}
    />
  )
}

export function HighlightCardDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <HighlightCard
        eyebrow="Best seller of the month"
        title="Congratulations, Toby! 🎉"
        value="$15,231.89"
        delta="+65% from last month"
        action={<Button size="sm">View sales</Button>}
        visual={<PartyPopper className="size-16" />}
        tone="primary"
      />
      <HighlightCard title="Upgrade to Team" description="Unlock unlimited seats, priority support and SSO for your whole company." action={<Button size="sm" variant="outline">See plans</Button>} />
    </div>
  )
}

export function RatingBreakdownDemo() {
  return <RatingBreakdown title="Customer reviews" description="Across all products" counts={[4000, 2100, 800, 631, 344]} />
}
