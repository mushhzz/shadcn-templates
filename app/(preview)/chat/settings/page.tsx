import { PageHeader } from "@/components/blocks/page-header"
import { ChatSettings } from "@/components/chat/chat-settings"
import { getCurrentUser } from "@/lib/chat/queries"

export default function ChatSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your profile and notification preferences." />
      <ChatSettings user={getCurrentUser()} />
    </>
  )
}
