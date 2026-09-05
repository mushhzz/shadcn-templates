import { PageHeader } from "@/components/blocks/page-header"
import { ApiKeysTable } from "@/components/agent/api-keys-table"
import { getApiKeys } from "@/lib/agent/queries"

export default function ApiKeysPage() {
  return (
    <>
      <PageHeader title="API keys" description="Credentials for calling your agents from other systems." />
      <ApiKeysTable keys={getApiKeys()} />
    </>
  )
}
