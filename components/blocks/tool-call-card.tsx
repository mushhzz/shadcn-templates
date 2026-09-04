"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Circle, Loader2, Wrench } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type ToolCallStatus = "pending" | "running" | "success" | "error"

export type ToolCallCardProps = {
  name: string
  status: ToolCallStatus
  input?: unknown
  output?: unknown
  durationMs?: number
  defaultOpen?: boolean
  className?: string
}

export function formatJson(value: unknown): string {
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`
}

const statusIcon: Record<ToolCallStatus, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  running: Loader2,
  success: CheckCircle2,
  error: AlertCircle,
}

export function ToolCallCard({
  name,
  status,
  input,
  output,
  durationMs,
  defaultOpen = false,
  className,
}: ToolCallCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const Icon = statusIcon[status]
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="tool-call-card"
      className={cn("rounded-lg border bg-card text-sm", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left">
        <ChevronRight
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        <Wrench className="size-4 text-muted-foreground" />
        <span className="font-mono text-xs font-medium">{name}</span>
        <span
          data-testid="tool-call-status"
          data-status={status}
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-xs",
            status === "success" && "text-emerald-600 dark:text-emerald-400",
            status === "error" && "text-red-600 dark:text-red-400",
            status === "running" && "text-primary",
            status === "pending" && "text-muted-foreground",
          )}
        >
          <Icon className={cn("size-3.5", status === "running" && "animate-spin")} />
          <span className="capitalize">{status}</span>
        </span>
        {durationMs !== undefined ? (
          <span className="text-xs text-muted-foreground">{formatDuration(durationMs)}</span>
        ) : null}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-3 border-t px-3 py-2">
          {input !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Input</div>
              <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">
                {formatJson(input)}
              </pre>
            </div>
          ) : null}
          {output !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Output</div>
              <pre className="overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs">
                {formatJson(output)}
              </pre>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
