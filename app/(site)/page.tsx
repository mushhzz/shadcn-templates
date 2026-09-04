import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstallCommand } from "@/components/site/install-command"

const templates = [
  {
    name: "dashboard",
    title: "Admin Dashboard",
    description: "Stats, charts, tables and settings.",
    status: "coming soon",
  },
  {
    name: "chat",
    title: "Chat App",
    description: "Conversations, threads and contacts.",
    status: "coming soon",
  },
  {
    name: "crm",
    title: "CRM",
    description: "Contacts, companies, deals pipeline and tasks.",
    status: "coming soon",
  },
  {
    name: "agent",
    title: "AI Agent Platform",
    description: "Agent workspace, builder, runs and usage.",
    status: "coming soon",
  },
] as const

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
      <section className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.title}</CardTitle>
                <Badge variant="secondary">{t.status}</Badge>
              </div>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <InstallCommand item={t.name} />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
