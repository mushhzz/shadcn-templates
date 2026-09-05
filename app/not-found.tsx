import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ErrorPage } from "@/components/blocks/error-page"

export default function NotFound() {
  return (
    <ErrorPage
      className="min-h-svh"
      icon={<Compass />}
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      actions={
        <>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blocks">Browse blocks</Link>
          </Button>
        </>
      }
    />
  )
}
