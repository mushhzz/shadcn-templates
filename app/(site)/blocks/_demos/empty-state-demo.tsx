import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/blocks/empty-state"

export function EmptyStateDemo() {
  return (
    <EmptyState
      icon={Inbox}
      title="No messages"
      description="Start a conversation to see it here."
      action={<Button>New message</Button>}
    />
  )
}
