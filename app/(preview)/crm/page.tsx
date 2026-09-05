import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { ActivityTimeline } from "@/components/crm/activity-timeline"
import { DealsChart } from "@/components/crm/deals-chart"
import { StageBadge } from "@/components/crm/stage-badge"
import { formatCurrency, formatDate } from "@/lib/crm/format"
import { getDeals, getDealsByStage, getPipelineStats, getTimeline } from "@/lib/crm/queries"

export default function CrmOverviewPage() {
  const s = getPipelineStats()
  const topOpen = getDeals().filter((d) => !["won", "lost"].includes(d.stage)).slice(0, 6)
  return (
    <>
      <PageHeader
        title="Overview"
        description="Pipeline health and what needs attention."
        actions={
          <Button asChild>
            <Link href="/crm/deals">Open pipeline</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open pipeline" value={formatCurrency(s.openValue)} delta={8.2} deltaLabel="vs last month" />
        <StatCard label="Won this quarter" value={formatCurrency(s.wonValue)} delta={12.5} deltaLabel="vs last quarter" />
        <StatCard label="Win rate" value={`${s.winRate.toFixed(0)}%`} delta={-2.4} deltaLabel="vs last quarter" />
        <StatCard label="New leads" value={String(s.newLeads)} delta={16.7} deltaLabel="vs last month" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DealsChart data={getDealsByStage()} />
        </div>
        <ActivityTimeline items={getTimeline().slice(0, 6)} title="Recent activity" description="Across all deals" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Largest open deals</CardTitle>
          <CardDescription>Open opportunities ordered by value.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {topOpen.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
              <div className="grid min-w-0">
                <span className="truncate font-medium">{d.title}</span>
                <span className="text-xs text-muted-foreground">
                  {d.companyName} · {d.owner} · closes {formatDate(d.closeDate)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <StageBadge stage={d.stage} />
                <span className="tabular-nums font-medium">{formatCurrency(d.value)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
