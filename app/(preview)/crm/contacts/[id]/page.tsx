import Link from "next/link"
import { notFound } from "next/navigation"
import { Mail, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/blocks/page-header"
import { ActivityTimeline } from "@/components/crm/activity-timeline"
import { ContactStatusBadge, StageBadge } from "@/components/crm/stage-badge"
import { formatCurrency, formatDate } from "@/lib/crm/format"
import { getContactById, getContacts, getDealsForContact, getTimeline } from "@/lib/crm/queries"

export function generateStaticParams() {
  return getContacts().map((c) => ({ id: c.id }))
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contact = getContactById(id)
  if (!contact) notFound()
  const deals = getDealsForContact(contact.id)

  return (
    <>
      <PageHeader
        title={contact.name}
        description={`${contact.title} at ${contact.companyName}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail className="size-4" /> Email
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                <Phone className="size-4" /> Call
              </a>
            </Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={personAvatar(contact.name)} alt="" />
              <AvatarFallback>{contact.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>
                <Link href={`/crm/companies/${contact.companyId}`} className="hover:underline">
                  {contact.companyName}
                </Link>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Status" value={<ContactStatusBadge status={contact.status} />} />
            <Row label="Email" value={contact.email} />
            <Row label="Phone" value={contact.phone} />
            <Row label="Owner" value={contact.owner} />
            <Row label="Added" value={formatDate(contact.createdAt)} />
          </CardContent>
        </Card>
        <div className="grid gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>Opportunities linked to this contact.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals yet.</p>
              ) : (
                deals.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                    <div className="grid min-w-0">
                      <span className="truncate font-medium">{d.title}</span>
                      <span className="text-xs text-muted-foreground">Closes {formatDate(d.closeDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StageBadge stage={d.stage} />
                      <Badge variant="outline" className="tabular-nums">
                        {formatCurrency(d.value)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <ActivityTimeline items={getTimeline({ contactId: contact.id })} title="Timeline" description="Notes and interactions with this contact" />
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
