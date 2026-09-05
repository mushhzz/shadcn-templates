import Link from "next/link"
import { CreditCard, DollarSign, PartyPopper, Percent, ShoppingCart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@/components/blocks/donut-chart"
import { HighlightCard } from "@/components/blocks/highlight-card"
import { PageHeader } from "@/components/blocks/page-header"
import { RatingBreakdown } from "@/components/blocks/rating-breakdown"
import { StatCard } from "@/components/blocks/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/dashboard/format"
import { getActivity, getMonthly, getOverviewMetrics, getRecentOrders } from "@/lib/dashboard/queries"

export default function OverviewPage() {
  const m = getOverviewMetrics()
  const current = getMonthly("12m").at(-1)
  return (
    <>
      <PageHeader title="Overview" description="Key metrics for the current month." />
      <div className="grid gap-4 xl:grid-cols-3">
        <HighlightCard
          eyebrow="Best month so far"
          title="Congratulations, Jane! 🎉"
          description="Revenue beat target across every channel."
          value={formatCurrency(m.revenue)}
          delta={`+${m.revenueDelta.toFixed(1)}% from last month`}
          action={
            <Button size="sm" asChild>
              <Link href="/dashboard/analytics">View analytics</Link>
            </Button>
          }
          visual={<PartyPopper className="size-16" />}
          tone="primary"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
          <StatCard label="Revenue" value={formatCurrency(m.revenue)} icon={<DollarSign />} delta={m.revenueDelta} deltaLabel="vs last month" sparkline={m.revenueSpark} />
          <StatCard label="Orders" value={formatNumber(m.orders)} icon={<ShoppingCart />} delta={m.ordersDelta} deltaLabel="vs last month" sparkline={m.ordersSpark} sparklineType="bar" />
          <StatCard label="Active customers" value={formatNumber(m.customers)} icon={<Users />} delta={m.customersDelta} deltaLabel="vs last month" />
          <StatCard label="Conversion" value={formatPercent(m.conversion)} icon={<Percent />} delta={m.conversionDelta} deltaLabel="vs last month" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={getMonthly("12m")} className="h-full" />
        </div>
        <ActivityFeed items={getActivity()} limit={6} viewAllHref="/dashboard/orders" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <DonutChart
          title="Revenue by channel"
          description="This month"
          centerLabel="revenue"
          valueFormat="currency"
          data={[
            { key: "web", label: "Web", value: current?.web ?? 0 },
            { key: "mobile", label: "Mobile", value: current?.mobile ?? 0 },
            { key: "partner", label: "Partner", value: current?.partner ?? 0 },
          ]}
        />
        <RatingBreakdown
          title="Customer reviews"
          description="From the last 90 days"
          counts={[412, 168, 51, 22, 9]}
          className="xl:col-span-2"
          actions={
            <Button variant="outline" size="sm" className="h-8">
              <CreditCard className="size-4" /> Export
            </Button>
          }
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>The latest orders across all channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={getRecentOrders(16)} />
        </CardContent>
      </Card>
    </>
  )
}
