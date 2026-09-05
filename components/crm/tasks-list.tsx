"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/blocks/empty-state"
import { PriorityBadge } from "@/components/crm/stage-badge"
import { formatRelative } from "@/lib/crm/format"
import { bucketTask, type TaskBucket } from "@/lib/crm/queries"
import type { TaskRow } from "@/lib/crm/types"
import { cn } from "@/lib/utils"

const order: TaskBucket[] = ["Overdue", "Today", "This week", "Later", "Done"]

export function TasksList({ tasks: initial }: { tasks: TaskRow[] }) {
  const [tasks, setTasks] = React.useState(initial)
  const groups = order
    .map((bucket) => ({ bucket, tasks: tasks.filter((t) => bucketTask(t) === bucket) }))
    .filter((g) => g.tasks.length > 0)

  if (groups.length === 0) {
    return <EmptyState title="All caught up" description="No tasks to show." />
  }

  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <Card key={g.bucket}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={cn(g.bucket === "Overdue" && "text-destructive")}>{g.bucket}</CardTitle>
            <Badge variant="secondary">{g.tasks.length}</Badge>
          </CardHeader>
          <CardContent className="grid gap-1">
            {g.tasks.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/60",
                  t.done && "opacity-60",
                )}
              >
                <Checkbox
                  className="mt-0.5"
                  checked={t.done}
                  onCheckedChange={(v) => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, done: !!v } : x)))}
                  aria-label={`Mark ${t.title} ${t.done ? "not done" : "done"}`}
                />
                <div className="grid flex-1 gap-1 text-sm">
                  <span className={cn("font-medium", t.done && "line-through")}>{t.title}</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span suppressHydrationWarning>{formatRelative(t.dueAt)}</span>
                    {t.contactName ? <span>· {t.contactName}</span> : null}
                    {t.dealTitle ? <span>· {t.dealTitle}</span> : null}
                    <span>· {t.owner}</span>
                  </div>
                </div>
                <PriorityBadge priority={t.priority} />
              </label>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
