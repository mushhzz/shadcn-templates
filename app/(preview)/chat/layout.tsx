import type { Metadata } from "next"
import { ChatShell } from "@/components/chat/chat-shell"

export const metadata: Metadata = {
  title: { default: "Chats", template: "%s · Soho" },
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatShell>{children}</ChatShell>
}
