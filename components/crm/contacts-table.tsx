"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Mail, Phone, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableActionsColumn,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { ContactStatusBadge } from "@/components/crm/stage-badge"
import { formatDate } from "@/lib/crm/format"
import type { ContactRow } from "@/lib/crm/types"

const h = createDataTableColumnHelper<ContactRow>()

export function ContactsTable({ contacts, owners }: { contacts: ContactRow[]; owners: string[] }) {
  const router = useRouter()
  const columns = h.columns([
    DataTableSelectColumn<ContactRow>(),
    h.accessor("name", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => (
        <Link href={`/crm/contacts/${row.original.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="size-8">
            <AvatarImage src={personAvatar(row.original.name)} alt="" />
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
    h.accessor("status", { header: "Status", cell: ({ getValue }) => <ContactStatusBadge status={getValue()} />, filterFn: "arrIncludesSome" }),
    h.accessor("owner", { header: "Owner", filterFn: "arrIncludesSome" }),
    h.accessor("openDeals", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Open deals" className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
    }),
    h.accessor("createdAt", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
      cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
      sortFn: "datetime",
    }),
    DataTableActionsColumn<ContactRow>((c) => [
      { label: "Open", icon: Eye, onSelect: () => router.push(`/crm/contacts/${c.id}`) },
      { label: "Email", icon: Mail, onSelect: () => toast(`Drafting email to ${c.email}`) },
      { label: "Call", icon: Phone, onSelect: () => toast(`Calling ${c.phone}`) },
      { label: "Remove", icon: UserMinus, destructive: true, separator: true, onSelect: () => toast.error(`${c.name} removed`) },
    ]),
  ])

  return (
    <DataTable
      columns={columns}
      data={contacts}
      getRowId={(c) => c.id}
      enableSearch
      searchPlaceholder="Search contacts…"
      facets={[
        {
          column: "status",
          title: "Status",
          options: [
            { value: "lead", label: "Lead" },
            { value: "customer", label: "Customer" },
            { value: "churned", label: "Churned" },
          ],
        },
        { column: "owner", title: "Owner", options: owners.map((o) => ({ value: o, label: o })) },
      ]}
      exportFilename="contacts.csv"
      bulkActions={(rows, clear) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => {
            toast(`Assigned ${rows.length} contacts`)
            clear()
          }}
        >
          Assign owner
        </Button>
      )}
      emptyMessage="No contacts match your filters."
    />
  )
}
