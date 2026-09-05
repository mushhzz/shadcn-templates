import type { Metadata } from "next"
import { AgentShell } from "@/components/agent/agent-shell"

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s · Relay" },
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>
}
