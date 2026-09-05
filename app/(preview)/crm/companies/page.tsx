import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { CompaniesTable } from "@/components/crm/companies-table"
import { getCompanies } from "@/lib/crm/queries"

export default function CompaniesPage() {
  return (
    <>
      <PageHeader title="Companies" description="Accounts and their open pipeline." actions={<Button>Add company</Button>} />
      <CompaniesTable companies={getCompanies()} />
    </>
  )
}
