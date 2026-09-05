import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { RunsTable } from "@/components/agent/runs-table"
import { formatDuration, formatTokens, formatUsd, getRunStats, getRuns } from "@/lib/agent/queries"

export default function RunsPage() {
  const s = getRunStats()
  return (
    <>
      <PageHeader title="Runs" description="Every agent execution, with its steps, tokens and cost." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Runs" value={String(s.total)} deltaLabel={`${s.running} running`} />
        <StatCard label="Failure rate" value={`${s.failureRate.toFixed(1)}%`} delta={-1.2} deltaLabel="vs last week" />
        <StatCard label="Avg duration" value={formatDuration(s.avgLatencyMs)} delta={-4.8} deltaLabel="vs last week" />
        <StatCard label="Spend" value={formatUsd(s.costUsd)} delta={6.1} deltaLabel={`${formatTokens(s.tokens)} tokens`} />
      </div>
      <RunsTable runs={getRuns()} />
    </>
  )
}
