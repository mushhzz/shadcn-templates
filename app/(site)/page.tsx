import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InstallCommand } from "@/components/site/install-command"

type Template = {
  name: string
  title: string
  description: string
  status: "ready" | "coming soon"
  href?: string
}

const templates: Template[] = [
  {
    name: "dashboard",
    title: "Admin Dashboard",
    description: "Overview, analytics, customers, orders and settings.",
    status: "ready",
    href: "/dashboard",
  },
  {
    name: "chat",
    title: "Chat App",
    description: "Conversations, threads and contacts.",
    status: "ready",
    href: "/chat",
  },
  {
    name: "crm",
    title: "CRM",
    description: "Contacts, companies, deals pipeline and tasks.",
    status: "ready",
    href: "/crm",
  },
  {
    name: "agent",
    title: "AI Agent Platform",
    description: "Agent workspace, builder, runs and usage.",
    status: "ready",
    href: "/agent",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Application templates for shadcn/ui
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Full app skeletons and reusable blocks you install with the shadcn CLI. Add the registry
          once, then pull in a template or a single block.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Templates">
        {templates.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.title}</CardTitle>
                <Badge variant={t.status === "ready" ? "default" : "secondary"}>{t.status}</Badge>
              </div>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <InstallCommand item={t.name} />
              {t.href ? (
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={t.href}>View demo</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="space-y-4" aria-label="Pages">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Pages</h2>
          <p className="text-sm text-muted-foreground">Auth and error routes every app needs, installable as one item.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Auth &amp; error pages</CardTitle>
              <Badge>ready</Badge>
            </div>
            <CardDescription>Login, signup, forgot password, maintenance and 404, on a two-column auth layout.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InstallCommand item="auth-pages" />
            <div className="flex flex-wrap gap-2">
              {[
                ["/login", "Login"],
                ["/signup", "Signup"],
                ["/forgot-password", "Forgot password"],
                ["/maintenance", "Maintenance"],
                ["/this-page-does-not-exist", "404"],
              ].map(([href, label]) => (
                <Button key={href} asChild variant="outline" size="sm">
                  <Link href={href ?? "/"}>{label}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
