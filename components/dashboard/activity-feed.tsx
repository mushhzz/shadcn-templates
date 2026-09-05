import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatRelative, initialsOf } from "@/lib/dashboard/format"
import type { Activity } from "@/lib/dashboard/types"

export function ActivityFeed({ items }: { items: (Activity & { at: Date })[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Latest account events</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <Avatar className="size-8">
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
