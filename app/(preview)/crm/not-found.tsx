import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorPage } from "@/components/blocks/error-page"

export default function CrmNotFound() {
  return (
    <ErrorPage
      icon={<Compass />}
      code="404"
      title="Not found"
      description="That record or page doesn't exist. It may have been deleted."
      actions={
        <Button asChild>
          <Link href="/crm">Back to overview</Link>
        </Button>
      }
    />
  )
}
