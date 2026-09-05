import * as React from "react"
import { cn } from "@/lib/utils"

export type ErrorPageProps = {
  /** Large muted code, e.g. "404". */
  code?: string
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  /** Technical detail shown in a collapsible, e.g. an error digest. */
  detail?: string
  className?: string
}

/** Full-height centred state for 404, 500, maintenance and empty routes. */
export function ErrorPage({ code, title, description, icon, actions, detail, className }: ErrorPageProps) {
  return (
    <div data-slot="error-page" className={cn("flex min-h-[60svh] flex-col items-center justify-center gap-6 px-4 py-16 text-center", className)}>
      {icon ? <div className="text-muted-foreground [&>svg]:size-12" aria-hidden>{icon}</div> : null}
      <div className="grid gap-2">
        {code ? <div className="font-mono text-sm font-medium tracking-widest text-muted-foreground">{code}</div> : null}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mx-auto max-w-md text-balance text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
      {detail ? (
        <details className="max-w-lg text-left text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none text-center">Technical details</summary>
          <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 font-mono">{detail}</pre>
        </details>
      ) : null}
    </div>
  )
}
