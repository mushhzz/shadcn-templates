"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, RotateCcw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  DataTable,
  DataTableActionsColumn,
  DataTableColumnHeader,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { RunStatusBadge } from "@/components/agent/status-badge"
import { formatDuration, formatRelative, formatTokens, formatUsd } from "@/lib/agent/queries"
import type { RunRow } from "@/lib/agent/types"

const h = createDataTableColumnHelper<RunRow>()

export function RunsTable({ runs }: { runs: RunRow[] }) {
  const router = useRouter()
  const agents = Array.from(new Set(runs.map((r) => r.agentName))).sort()
  const columns = h.columns([
    h.accessor("id", {
      header: "Run",
      cell: ({ getValue }) => (
        <Link href={`/agent/runs/${getValue()}`} className="font-mono text-xs underline-offset-4 hover:underline">
          {getValue()}
        </Link>
      ),
    }),
    h.accessor("agentName", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      filterFn: "arrIncludesSome",
    }),
    h.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => <RunStatusBadge status={getValue()} />,
      filterFn: "arrIncludesSome",
    }),
    h.accessor("trigger", {
      header: "Trigger",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="capitalize">
          {getValue()}
        </Badge>
      ),
      filterFn: "arrIncludesSome",
    }),
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
      cell: ({ getValue }) => (
        <span className="text-muted-foreground" suppressHydrationWarning>
          {formatRelative(getValue())}
        </span>
      ),
      sortFn: "datetime",
    }),
    DataTableActionsColumn<RunRow>((r) => [
      { label: "View trace", icon: Eye, onSelect: () => router.push(`/agent/runs/${r.id}`) },
      { label: "Re-run", icon: RotateCcw, onSelect: () => toast(`Queued a re-run of ${r.id}`) },
      ...(r.status === "running" ? [{ label: "Cancel", icon: XCircle, destructive: true, separator: true, onSelect: () => toast.error(`Cancelled ${r.id}`) }] : []),
    ]),
  ])

  return (
    <DataTable
      columns={columns}
      data={runs}
      getRowId={(r) => r.id}
      enableSearch
      searchPlaceholder="Search runs…"
      facets={[
        {
          column: "status",
          title: "Status",
          options: [
            { value: "running", label: "Running" },
            { value: "succeeded", label: "Succeeded" },
            { value: "failed", label: "Failed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
        { column: "agentName", title: "Agent", options: agents.map((a) => ({ value: a, label: a })) },
        {
          column: "trigger",
          title: "Trigger",
          options: [
            { value: "chat", label: "Chat" },
            { value: "api", label: "API" },
            { value: "schedule", label: "Schedule" },
          ],
        },
      ]}
      exportFilename="runs.csv"
      emptyMessage="No runs match these filters."
    />
  )
}
