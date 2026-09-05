import { InstallCommand } from "@/components/site/install-command"
import { AppShellDemo } from "./_demos/app-shell-demo"
import { ChartCardDemo } from "./_demos/chart-card-demo"
import { ComposerDemo } from "./_demos/composer-demo"
import { DataTableDemo } from "./_demos/data-table-demo"
import { EmptyStateDemo } from "./_demos/empty-state-demo"
import { KanbanBoardDemo } from "./_demos/kanban-board-demo"
import { MessageListDemo } from "./_demos/message-list-demo"
import { PageHeaderDemo } from "./_demos/page-header-demo"
import { StatCardDemo } from "./_demos/stat-card-demo"
import { ToolCallCardDemo } from "./_demos/tool-call-card-demo"
import { SkeletonsDemo } from "./_demos/skeletons-demo"

type Demo = { name: string; title: string; Demo: React.ComponentType; install?: boolean }
const demos: Demo[] = [
  { name: "page-header", title: "Page Header", Demo: PageHeaderDemo },
  { name: "empty-state", title: "Empty State", Demo: EmptyStateDemo },
  { name: "stat-card", title: "Stat Card", Demo: StatCardDemo },
  { name: "chart-card", title: "Chart Card", Demo: ChartCardDemo },
  { name: "app-shell", title: "App Shell", Demo: AppShellDemo },
  { name: "data-table", title: "Data Table", Demo: DataTableDemo },
  { name: "kanban-board", title: "Kanban Board", Demo: KanbanBoardDemo },
  { name: "message-list", title: "Message List", Demo: MessageListDemo },
  { name: "composer", title: "Composer", Demo: ComposerDemo },
  { name: "tool-call-card", title: "Tool Call Card", Demo: ToolCallCardDemo },
  { name: "skeletons", title: "Loading skeletons", Demo: SkeletonsDemo, install: false },
]

export default function BlocksPage() {
  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-semibold tracking-tight">Blocks</h1>
      {demos.map(({ name, title, Demo, install }) => (
        <section key={name} id={name} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-medium">{title}</h2>
            {install === false ? null : (
              <div className="sm:w-96">
                <InstallCommand item={name} />
              </div>
            )}
          </div>
          <div className="rounded-lg border p-6">
            <Demo />
          </div>
        </section>
      ))}
    </div>
  )
}
