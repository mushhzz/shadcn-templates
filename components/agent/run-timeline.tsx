"use client"

import * as React from "react"
import { Bot, Wrench } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolCallCard } from "@/components/blocks/tool-call-card"
import { formatDuration, formatTokens } from "@/lib/agent/queries"
import type { RunRow, StepStatus } from "@/lib/agent/types"
import { cn } from "@/lib/utils"

const dot: Record<StepStatus, string> = {
  pending: "bg-muted-foreground/40",
  running: "bg-info animate-pulse",
  success: "bg-success",
  error: "bg-destructive",
}

export function RunTimeline({ run }: { run: RunRow }) {
  const total = Math.max(run.steps.reduce((s, st) => s + st.durationMs, 0), 1)
  const logs = run.steps.flatMap((s) => (s.log ?? []).map((line) => ({ step: s.name, line })))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Steps</CardTitle>
        <CardDescription>Each model call and tool invocation, in order.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="gap-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <ol className="relative grid gap-4 border-l pl-6">
              {run.steps.map((s, i) => (
                <li key={s.id} className="relative grid gap-2">
                  <span className={cn("absolute -left-[29px] top-1.5 size-3 rounded-full ring-4 ring-background", dot[s.status])} />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      {s.type === "tool" ? <Wrench className="size-3.5 text-muted-foreground" /> : <Bot className="size-3.5 text-muted-foreground" />}
                      <span className={cn(s.type === "tool" && "font-mono text-xs")}>{s.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">step {i + 1}</span>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {formatDuration(s.durationMs)}
                      {s.tokensIn !== undefined ? ` · ${formatTokens((s.tokensIn ?? 0) + (s.tokensOut ?? 0))} tok` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", s.status === "error" ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.max(2, (s.durationMs / total) * 100)}%` }} />
                  </div>
                  {s.type === "tool" ? <ToolCallCard name={s.name} status={s.status} input={s.input} output={s.output} durationMs={s.durationMs || undefined} /> : null}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="logs">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No log lines were captured for this run.</p>
            ) : (
              <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
                {logs.map((l, i) => (
                  <div key={i}>
                    <span className="text-muted-foreground">[{l.step}]</span> {l.line}
                  </div>
                ))}
              </pre>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
