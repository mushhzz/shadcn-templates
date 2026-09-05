"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorPage } from "@/components/blocks/error-page"

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorPage
      icon={<AlertTriangle />}
      code="500"
      title="Something went wrong"
      description="This page hit an unexpected error. You can retry, or head back to the overview."
      detail={error.digest ? `Digest: ${error.digest}\n${error.message}` : error.message}
      actions={
        <>
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to overview</a>
          </Button>
        </>
      }
    />
  )
}
