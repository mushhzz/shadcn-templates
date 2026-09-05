import type { Metadata } from "next"
import Link from "next/link"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorPage } from "@/components/blocks/error-page"

export const metadata: Metadata = { title: "Maintenance" }

export default function MaintenancePage() {
  return (
    <ErrorPage
      className="min-h-svh"
      icon={<Wrench />}
      code="503"
      title="We'll be right back"
      description="Scheduled maintenance is in progress. We expect to be back by 02:00 UTC. Your data is safe and nothing needs to be re-done."
      actions={
        <>
          <Button asChild>
            <Link href="/">Check status</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@example.com">Contact support</a>
          </Button>
        </>
      }
    />
  )
}
