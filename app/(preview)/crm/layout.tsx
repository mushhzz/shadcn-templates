import type { Metadata } from "next"
import { CrmShell } from "@/components/crm/crm-shell"

export const metadata: Metadata = {
  title: { default: "CRM", template: "%s · CRM" },
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <CrmShell>{children}</CrmShell>
}
