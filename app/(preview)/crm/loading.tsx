import { Skeleton } from "@/components/ui/skeleton"
import { KanbanBoardSkeleton } from "@/components/blocks/kanban-board"
import { StatCardSkeleton } from "@/components/blocks/stat-card"

export default function CrmLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <KanbanBoardSkeleton columns={5} />
    </div>
  )
}
