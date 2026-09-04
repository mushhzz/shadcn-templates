import { ToolCallCard } from "@/components/blocks/tool-call-card"

export function ToolCallCardDemo() {
  return (
    <div className="space-y-2">
      <ToolCallCard
        name="search_web"
        status="success"
        durationMs={1240}
        input={{ query: "shadcn registry" }}
        output={{ results: 3 }}
      />
      <ToolCallCard name="read_file" status="running" input={{ path: "README.md" }} />
      <ToolCallCard
        name="send_email"
        status="error"
        durationMs={310}
        input={{ to: "ops@acme.com" }}
        output={{ error: "SMTP timeout" }}
        defaultOpen
      />
    </div>
  )
}
