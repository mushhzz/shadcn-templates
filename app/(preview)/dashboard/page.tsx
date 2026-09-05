import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/dashboard/format"
import {
  getActivity,
  getMonthly,
  getOverviewMetrics,
  getRecentOrders,
} from "@/lib/dashboard/queries"

export default function OverviewPage() {
  const m = getOverviewMetrics()
  return (
    <>
      <PageHeader
        title="Overview"
        description="Key metrics for the current month."
        actions={<Button variant="outline">Download report</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(m.revenue)}
          delta={m.revenueDelta}
          deltaLabel="vs last month"
          sparkline={m.revenueSpark}
        />
        <StatCard
          label="Orders"
          value={formatNumber(m.orders)}
          delta={m.ordersDelta}
          deltaLabel="vs last month"
          sparkline={m.ordersSpark}
        />
        <StatCard
          label="Active customers"
          value={formatNumber(m.customers)}
          delta={m.customersDelta}
          deltaLabel="vs last month"
        />
        <StatCard
          label="Conversion"
          value={formatPercent(m.conversion)}
          delta={m.conversionDelta}
          deltaLabel="vs last month"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={getMonthly("12m")} />
        </div>
        <ActivityFeed items={getActivity()} />
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
