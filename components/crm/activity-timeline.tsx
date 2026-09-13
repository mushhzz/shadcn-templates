import { Mail, MessageSquare, Phone, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/blocks/empty-state"
import { formatRelative } from "@/lib/crm/format"
import type { ActivityType, TimelineItem } from "@/lib/crm/types"
import { emptyIllustration } from "@/lib/kit/assets"

const icons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Users,
}

export function ActivityTimeline({
  items,
  title = "Activity",
  description = "Calls, emails, meetings and notes",
}: {
  items: TimelineItem[]
  title?: string
  description?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState illustration={emptyIllustration("files")} title="No activity yet" description="Log a call, email or note to start the timeline." />
        ) : (
          <ol className="relative grid gap-5 border-l pl-6">
            {items.map((item) => {
              const Icon = icons[item.type]
              return (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border bg-background">
                    <Icon className="size-3 text-muted-foreground" />
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium">{item.actor}</span>
                    <span className="capitalize text-muted-foreground">{item.type}</span>
                    <time className="text-xs text-muted-foreground" dateTime={item.at.toISOString()} suppressHydrationWarning>
                      {formatRelative(item.at)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
