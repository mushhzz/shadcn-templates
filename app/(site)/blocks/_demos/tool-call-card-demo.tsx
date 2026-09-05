import { ToolCallCard } from "@/components/blocks/tool-call-card"

export function ToolCallCardDemo() {
  return (
    <div className="space-y-2">
      <ToolCallCard name="search_web" status="success" durationMs={1240} input={{ query: "shadcn registry" }} output={{ results: 3 }} />
      <ToolCallCard name="read_file" state="input-available" input={{ path: "README.md" }} />
      <ToolCallCard name="fetch_weather" state="input-streaming" />
      <ToolCallCard name="send_email" state="output-error" durationMs={310} input={{ to: "ops@acme.com" }} errorText="SMTP timeout after 3000ms" />
    </div>
  )
}
