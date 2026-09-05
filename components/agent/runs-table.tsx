"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { RunStatusBadge } from "@/components/agent/status-badge"
import { formatDuration, formatRelative, formatTokens, formatUsd } from "@/lib/agent/queries"
import type { RunRow, RunStatus } from "@/lib/agent/types"

const h = createDataTableColumnHelper<RunRow>()
const columns = h.columns([
  h.accessor("id", {
    header: "Run",
    cell: ({ getValue }) => (
      <Link href={`/agent/runs/${getValue()}`} className="font-mono text-xs underline-offset-4 hover:underline">
        {getValue()}
      </Link>
    ),
  }),
  h.accessor("agentName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" /> }),
  h.accessor("status", { header: "Status", cell: ({ getValue }) => <RunStatusBadge status={getValue()} /> }),
  h.accessor("trigger", { header: "Trigger", cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{getValue()}</Badge> }),
  h.accessor("durationMs", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{formatDuration(getValue())}</div>,
  }),
  h.accessor((r) => r.tokensIn + r.tokensOut, {
    id: "tokens",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tokens" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{formatTokens(getValue())}</div>,
  }),
  h.accessor("costUsd", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cost" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{formatUsd(getValue())}</div>,
  }),
  h.accessor("startedAt", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Started" />,
    cell: ({ getValue }) => <span className="text-muted-foreground" suppressHydrationWarning>{formatRelative(getValue())}</span>,
  }),
])

export function RunsTable({ runs }: { runs: RunRow[] }) {
  const [status, setStatus] = React.useState<RunStatus | "all">("all")
  const [agent, setAgent] = React.useState<string>("all")
  const agents = Array.from(new Set(runs.map((r) => r.agentName))).sort()
  const filtered = runs.filter((r) => (status === "all" || r.status === status) && (agent === "all" || r.agentName === agent))

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(r) => r.id}
      emptyMessage="No runs match these filters."
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as RunStatus | "all")}>
            <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger className="h-8 w-44" aria-label="Filter by agent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  )
}
