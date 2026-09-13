import * as React from "react"
import { cn } from "@/lib/utils"

export type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>
  /** Illustration URL (e.g. `/kit/empty/tasks.svg`). Takes precedence over `icon`. */
  illustration?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl bg-muted/40 p-10 text-center",
        className,
      )}
    >
      {illustration ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img data-testid="empty-state-illustration" src={illustration} alt="" className="mb-4 h-28 w-auto" />
      ) : Icon ? (
        <div data-testid="empty-state-icon" className="mb-4 rounded-full bg-muted p-3">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="font-heading text-lg font-semibold tracking-tight">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
