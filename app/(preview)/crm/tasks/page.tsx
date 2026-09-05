import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { TasksList } from "@/components/crm/tasks-list"
import { getTasks } from "@/lib/crm/queries"

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Follow-ups grouped by when they are due." actions={<Button>New task</Button>} />
      <TasksList tasks={getTasks()} />
    </>
  )
}
