import Image from "next/image"
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
import { KIT_ART } from "@/lib/kit/assets"

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
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            App templates that don&apos;t look like every other shadcn app
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Full application skeletons and reusable blocks, installed with the shadcn CLI. Add the
            registry once, then pull in a template or a single block.
          </p>
        </div>
        <Image src={KIT_ART.hero} alt="" width={1344} height={756} priority className="w-full rounded-xl shadow-card" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Templates">
        {templates.map((t) => (
          <Card key={t.name} className="overflow-hidden pt-0">
            {t.href ? (
              <Link href={t.href} className="block border-b bg-muted/40" aria-label={`Preview ${t.title}`}>
                <Image src={`/screenshots/${t.name}.png`} alt={`${t.title} screenshot`} width={1280} height={800} className="aspect-[16/10] w-full object-cover object-top" />
              </Link>
            ) : null}
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
