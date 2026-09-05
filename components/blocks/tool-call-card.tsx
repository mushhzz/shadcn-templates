"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, ChevronRight, Circle, Loader2, Wrench } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export type ToolCallStatus = "pending" | "running" | "success" | "error"

/** AI SDK tool part states, accepted as an alternative to `status`. */
export type ToolCallState = "input-streaming" | "input-available" | "output-available" | "output-error"

export function toolStateToStatus(state: ToolCallState): ToolCallStatus {
  switch (state) {
    case "input-streaming":
      return "pending"
    case "input-available":
      return "running"
    case "output-available":
      return "success"
    case "output-error":
      return "error"
  }
}

export type ToolCallCardProps = {
  name: string
  status?: ToolCallStatus
  state?: ToolCallState
  input?: unknown
  output?: unknown
  errorText?: string
  durationMs?: number
  defaultOpen?: boolean
  /** Custom output renderer; defaults to pretty JSON. */
  renderOutput?: (output: unknown) => React.ReactNode
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

const statusLabel: Record<ToolCallStatus, string> = {
  pending: "Pending",
  running: "Running",
  success: "Success",
  error: "Error",
}

export function ToolCallCard({
  name,
  status: statusProp,
  state,
  input,
  output,
  errorText,
  durationMs,
  defaultOpen,
  renderOutput,
  className,
}: ToolCallCardProps) {
  const status: ToolCallStatus = statusProp ?? (state ? toolStateToStatus(state) : "pending")
  const [open, setOpen] = React.useState(defaultOpen ?? status === "error")
  const Icon = statusIcon[status]
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-slot="tool-call-card"
      data-status={status}
      className={cn("rounded-lg border bg-card text-sm", status === "error" && "border-destructive/40", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} aria-hidden />
        <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 truncate font-mono text-xs font-medium">{name}</span>
        <span
          data-testid="tool-call-status"
          data-status={status}
          className={cn(
            "ml-auto inline-flex shrink-0 items-center gap-1 text-xs",
            status === "success" && "text-success",
            status === "error" && "text-destructive",
            status === "running" && "text-info",
            status === "pending" && "text-muted-foreground",
          )}
        >
          <Icon className={cn("size-3.5", status === "running" && "animate-spin")} aria-hidden />
          <span>{statusLabel[status]}</span>
        </span>
        {durationMs !== undefined ? <span className="shrink-0 text-xs text-muted-foreground">{formatDuration(durationMs)}</span> : null}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-3 border-t px-3 py-2">
          {input !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Input</div>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 font-mono text-xs" tabIndex={0}>
                {formatJson(input)}
              </pre>
            </div>
          ) : null}
          {errorText || status === "error" ? (
            <div>
              <div className="mb-1 text-xs font-medium text-destructive">Error</div>
              <pre className="max-h-64 overflow-auto rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive" tabIndex={0}>
                {errorText ?? formatJson(output)}
              </pre>
            </div>
          ) : output !== undefined ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Output</div>
              {renderOutput ? (
                renderOutput(output)
              ) : (
                <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 font-mono text-xs" tabIndex={0}>
                  {formatJson(output)}
                </pre>
              )}
            </div>
          ) : null}
          {status === "running" && output === undefined ? <p className="text-xs text-muted-foreground">Waiting for output…</p> : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
