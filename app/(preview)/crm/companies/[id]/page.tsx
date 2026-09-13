import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { StatCard } from "@/components/blocks/stat-card"
import { ActivityTimeline } from "@/components/crm/activity-timeline"
import { ContactStatusBadge, StageBadge } from "@/components/crm/stage-badge"
import { formatCurrency, formatDate } from "@/lib/crm/format"
import { getCompanies, getCompanyById, getContactsForCompany, getDealsForCompany, getTimeline } from "@/lib/crm/queries"

export function generateStaticParams() {
  return getCompanies().map((c) => ({ id: c.id }))
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const company = getCompanyById(id)
  if (!company) notFound()
  const contacts = getContactsForCompany(company.id)
  const deals = getDealsForCompany(company.id)
  const won = deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0)

  return (
    <>
      <PageHeader title={company.name} description={`${company.industry} · ${company.size} employees · ${company.location}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open pipeline" value={formatCurrency(company.openDealValue)} />
        <StatCard label="Closed won" value={formatCurrency(won)} />
        <StatCard label="Contacts" value={String(company.contactCount)} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>People at {company.name}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {contacts.map((c) => (
              <Link key={c.id} href={`/crm/contacts/${c.id}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted/60">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={personAvatar(c.name)} alt="" />
                    <AvatarFallback className="text-xs">{c.initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0">
                    <span className="truncate font-medium">{c.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{c.title}</span>
                  </div>
                </div>
                <ContactStatusBadge status={c.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deals</CardTitle>
            <CardDescription>All opportunities with this account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {deals.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                <div className="grid min-w-0">
                  <span className="truncate font-medium">{d.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.owner} · closes {formatDate(d.closeDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={d.stage} />
                  <Badge variant="outline" className="tabular-nums">
                    {formatCurrency(d.value)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <ActivityTimeline items={getTimeline({ companyId: company.id })} title="Timeline" description={`Everything logged with ${company.name}`} />
    </>
  )
}
