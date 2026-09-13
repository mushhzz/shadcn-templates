"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { companyLogo } from "@/lib/kit/assets"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { formatCurrency } from "@/lib/crm/format"
import type { CompanyRow } from "@/lib/crm/types"

const h = createDataTableColumnHelper<CompanyRow>()
const columns = h.columns([
  h.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
    cell: ({ row }) => (
      <Link href={`/crm/companies/${row.original.id}`} className="flex items-center gap-3 hover:underline">
        <Avatar className="size-8 rounded-md">
          <AvatarImage src={companyLogo(row.original.name)} alt="" className="rounded-md" />
          <AvatarFallback className="rounded-md text-xs">{row.original.initials}</AvatarFallback>
        </Avatar>
        <div className="grid">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.domain}</span>
        </div>
      </Link>
    ),
  }),
  h.accessor("industry", { header: "Industry", cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge> }),
  h.accessor("size", { header: "Size" }),
  h.accessor("location", { header: "Location", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span> }),
  h.accessor("contactCount", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contacts" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
  }),
  h.accessor("openDealValue", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Open pipeline" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
  }),
])

export function CompaniesTable({ companies }: { companies: CompanyRow[] }) {
  const [query, setQuery] = React.useState("")
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q === ""
      ? companies
      : companies.filter((c) => [c.name, c.domain, c.industry, c.location].some((v) => v.toLowerCase().includes(q)))
  }, [companies, query])

  return (
    <DataTable
      columns={columns}
      data={filtered}
      getRowId={(c) => c.id}
      emptyMessage="No companies match your search."
      toolbar={<Input placeholder="Search companies…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 w-full min-w-40 sm:w-64" />}
    />
  )
}
