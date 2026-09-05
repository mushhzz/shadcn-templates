import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/blocks/page-header"
import { SettingsBilling } from "@/components/dashboard/settings-billing"
import { SettingsNotifications } from "@/components/dashboard/settings-notifications"
import { SettingsProfile } from "@/components/dashboard/settings-profile"
import { SettingsTeam } from "@/components/dashboard/settings-team"
import { getInvoices, getTeam } from "@/lib/dashboard/queries"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, team, notifications and billing."
      />
      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <SettingsProfile />
        </TabsContent>
        <TabsContent value="team">
          <SettingsTeam members={getTeam()} />
        </TabsContent>
        <TabsContent value="notifications">
          <SettingsNotifications />
        </TabsContent>
        <TabsContent value="billing">
          <SettingsBilling invoices={getInvoices()} />
        </TabsContent>
      </Tabs>
    </>
  )
}
