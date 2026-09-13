import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatRelative, initialsOf } from "@/lib/dashboard/format"
import type { Activity } from "@/lib/dashboard/types"

export function ActivityFeed({
  items,
  limit,
  viewAllHref,
  className,
}: {
  items: (Activity & { at: Date })[]
  /** Show only the first N items; pair with `viewAllHref`. */
  limit?: number
  viewAllHref?: string
  className?: string
}) {
  const shown = limit ? items.slice(0, limit) : items
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Activity</CardTitle>
          <CardDescription>Latest account events</CardDescription>
        </div>
        {viewAllHref && items.length > shown.length ? (
          <Link href={viewAllHref} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            View all
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {shown.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <Avatar className="size-8">
              {a.actor !== "System" ? <AvatarImage src={personAvatar(a.actor)} alt="" /> : null}
              <AvatarFallback className="text-xs">
                {a.actor === "System" ? "SY" : initialsOf(a.actor)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 gap-0.5 text-sm">
              <p>
                <span className="font-medium">{a.actor}</span> {a.action}{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={a.at.toISOString()}
                suppressHydrationWarning
              >
                {formatRelative(a.at)}
              </time>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
