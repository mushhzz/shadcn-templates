import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { ByModelChart, CostChart, LatencyChart, TokensChart } from "@/components/agent/usage-charts"
import { formatDuration, formatTokens, formatUsd, getUsageByAgent, getUsageByModel, getUsageDaily, getUsageTotals, modelName } from "@/lib/agent/queries"

export default function UsagePage() {
  const t = getUsageTotals()
  const daily = getUsageDaily()
  return (
    <>
      <PageHeader title="Usage" description="Tokens, cost and latency across agents and models for the last 14 days." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tokens" value={formatTokens(t.tokens)} delta={9.4} deltaLabel="vs prior 14d" sparkline={t.tokensSpark} />
        <StatCard label="Spend" value={formatUsd(t.costUsd)} delta={7.8} deltaLabel="vs prior 14d" sparkline={t.costSpark} />
        <StatCard label="Runs" value={t.runs.toLocaleString("en-US")} delta={11.2} deltaLabel="vs prior 14d" />
        <StatCard label="Avg latency" value={formatDuration(t.avgLatencyMs)} delta={-3.1} deltaLabel="vs prior 14d" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <TokensChart data={daily} />
        <CostChart data={daily} />
        <LatencyChart data={daily} />
        <ByModelChart data={getUsageByModel()} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>By agent</CardTitle>
          <CardDescription>Where the spend is going.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Avg latency</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getUsageByAgent().map((u) => (
                <TableRow key={u.agentId}>
                  <TableCell className="font-medium">
                    <Link href={`/agent/agents/${u.agentId}`} className="underline-offset-4 hover:underline">
                      {u.agentName}
                    </Link>
                  </TableCell>
                  <TableCell>{u.model ? <Badge variant="secondary">{modelName(u.model)}</Badge> : null}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatTokens(u.tokens)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatDuration(u.latencyMs)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatUsd(u.costUsd)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
