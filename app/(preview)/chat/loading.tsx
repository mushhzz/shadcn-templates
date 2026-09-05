import { Skeleton } from "@/components/ui/skeleton"
import { MessageListSkeleton } from "@/components/blocks/message-list"

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100svh-7.5rem)] min-h-[480px] overflow-hidden rounded-lg border bg-card" aria-busy aria-label="Loading">
      <div className="hidden w-80 shrink-0 flex-col gap-2 border-r p-3 md:flex">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <MessageListSkeleton count={5} className="flex-1" />
        <div className="border-t p-3">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}
