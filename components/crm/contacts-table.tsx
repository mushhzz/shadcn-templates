"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { ContactStatusBadge } from "@/components/crm/stage-badge"
import { formatDate } from "@/lib/crm/format"
import type { ContactRow, ContactStatus } from "@/lib/crm/types"

const h = createDataTableColumnHelper<ContactRow>()
const columns = h.columns([
  h.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
    cell: ({ row }) => (
      <Link href={`/crm/contacts/${row.original.id}`} className="flex items-center gap-3 hover:underline">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">{row.original.initials}</AvatarFallback>
        </Avatar>
        <div className="grid">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.title}</span>
        </div>
      </Link>
    ),
  }),
  h.accessor("companyName", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
    cell: ({ row }) => (
      <Link href={`/crm/companies/${row.original.companyId}`} className="hover:underline">
        {row.original.companyName}
      </Link>
    ),
  }),
  h.accessor("email", { header: "Email", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span> }),
  h.accessor("status", { header: "Status", cell: ({ getValue }) => <ContactStatusBadge status={getValue()} /> }),
  h.accessor("owner", { header: "Owner" }),
  h.accessor("openDeals", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Open deals" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
  }),
  h.accessor("createdAt", {
    header: "Added",
    cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
  }),
])

export function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<ContactStatus | "all">("all")
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (q === "" || [c.name, c.email, c.companyName, c.title].some((v) => v.toLowerCase().includes(q))),
    )
  }, [contacts, query, status])

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(c) => c.id}
      emptyMessage="No contacts match your filters."
      toolbar={
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-initial">
          <Input placeholder="Search contacts…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-full min-w-40 sm:w-64" />
          <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus | "all")}>
            <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    />
  )
}
