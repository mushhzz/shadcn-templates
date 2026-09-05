import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { RunTimeline } from "@/components/agent/run-timeline"
import { RunStatusBadge } from "@/components/agent/status-badge"
import { formatDuration, formatRelative, formatTokens, formatUsd, getRunById, getRuns } from "@/lib/agent/queries"

export function generateStaticParams() {
  return getRuns().map((r) => ({ id: r.id }))
}

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRunById(id)
  if (!run) notFound()
  return (
    <>
      <PageHeader
        title={run.id}
        description={`${run.agentName} · triggered by ${run.trigger}`}
        actions={
          <>
            <RunStatusBadge status={run.status} />
            <Button variant="outline" asChild>
              <Link href={`/agent/agents/${run.agentId}`}>View agent</Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Duration" value={formatDuration(run.durationMs)} />
        <StatCard label="Input tokens" value={formatTokens(run.tokensIn)} />
        <StatCard label="Output tokens" value={formatTokens(run.tokensOut)} />
        <StatCard label="Cost" value={formatUsd(run.costUsd)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RunTimeline run={run} />
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Started" value={<span suppressHydrationWarning>{formatRelative(run.startedAt)}</span>} />
            <Row label="Agent" value={run.agentName} />
            <Row label="Trigger" value={<Badge variant="outline" className="capitalize">{run.trigger}</Badge>} />
            <Row label="Steps" value={String(run.steps.length)} />
            <Row label="Tool calls" value={String(run.steps.filter((s) => s.type === "tool").length)} />
            <Row label="Errors" value={String(run.steps.filter((s) => s.status === "error").length)} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
