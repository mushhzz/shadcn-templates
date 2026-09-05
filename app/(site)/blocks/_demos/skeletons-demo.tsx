import { ChartCardSkeleton } from "@/components/blocks/chart-card"
import { DataTableSkeleton } from "@/components/blocks/data-table"
import { KanbanBoardSkeleton } from "@/components/blocks/kanban-board"
import { MessageListSkeleton } from "@/components/blocks/message-list"
import { StatCardSkeleton } from "@/components/blocks/stat-card"

export function SkeletonsDemo() {
  return (
    <div className="grid min-w-0 gap-4 *:min-w-0">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCardSkeleton />
        <MessageListSkeleton className="rounded-md border" />
      </div>
      <DataTableSkeleton rows={4} />
      <KanbanBoardSkeleton columns={3} />
    </div>
  )
}
