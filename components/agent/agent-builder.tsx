"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ModelPicker } from "@/components/agent/model-picker"
import type { AgentRow, AgentStatus, KnowledgeSource, ModelId, Tool, ToolId } from "@/lib/agent/types"

export function AgentBuilder({ agent, tools, knowledge }: { agent: AgentRow; tools: Tool[]; knowledge: KnowledgeSource[] }) {
  const [name, setName] = React.useState(agent.name)
  const [description, setDescription] = React.useState(agent.description)
  const [model, setModel] = React.useState<ModelId>(agent.model)
  const [status, setStatus] = React.useState<AgentStatus>(agent.status)
  const [temperature, setTemperature] = React.useState(agent.temperature)
  const [prompt, setPrompt] = React.useState(agent.systemPrompt)
  const [selectedTools, setSelectedTools] = React.useState<ToolId[]>(agent.tools)
  const [selectedKb, setSelectedKb] = React.useState<string[]>(agent.knowledge)
  const [saved, setSaved] = React.useState(false)

  const toggle = <T,>(list: T[], v: T, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v))

  return (
    <form
      className="grid gap-4 xl:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }}
    >
      <div className="grid gap-4 xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>What this agent is called and what it does.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="agent-name">Name</Label>
                <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AgentStatus)}>
                  <SelectTrigger aria-label="Status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent-description">Description</Label>
              <Input id="agent-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>The system prompt the model sees on every run.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor="agent-prompt" className="sr-only">
              System prompt
            </Label>
            <Textarea id="agent-prompt" rows={8} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="font-mono text-xs leading-relaxed" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>What the agent is allowed to call.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {tools.map((t) => {
              const on = selectedTools.includes(t.id)
              return (
                <label key={t.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50 has-[[data-state=checked]]:border-foreground/40">
                  <Checkbox className="mt-0.5" checked={on} onCheckedChange={(v) => setSelectedTools((l) => toggle(l, t.id, !!v))} aria-label={t.name} />
                  <span className="grid gap-0.5 text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </span>
                </label>
              )
            })}
          </CardContent>
        </Card>
      </div>
      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Model</CardTitle>
            <CardDescription>Which model runs this agent.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ModelPicker value={model} onChange={setModel} className="w-full" />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="agent-temp">Temperature</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{temperature.toFixed(1)}</span>
              </div>
              <input
                id="agent-temp"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Knowledge</CardTitle>
            <CardDescription>Sources the agent can retrieve from.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {knowledge.map((k) => {
              const on = selectedKb.includes(k.id)
              return (
                <label key={k.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/50">
                  <Checkbox checked={on} onCheckedChange={(v) => setSelectedKb((l) => toggle(l, k.id, !!v))} aria-label={k.name} />
                  <span className="grid min-w-0 flex-1 text-sm">
                    <span className="truncate font-medium">{k.name}</span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {k.kind} · {k.items} items
                    </span>
                  </span>
                </label>
              )
            })}
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit">Save agent</Button>
            {saved ? <span className="text-sm text-muted-foreground">Saved</span> : null}
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
