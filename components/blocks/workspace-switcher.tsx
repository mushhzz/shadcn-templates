"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type Workspace = {
  id: string
  name: string
  plan?: string
  icon?: React.ComponentType<{ className?: string }>
}

export type WorkspaceSwitcherProps = {
  workspaces: Workspace[]
  activeId: string
  onChange: (id: string) => void
  onCreate?: () => void
  className?: string
}

/** Drop into `AppShell`'s `sidebarHeader` slot. */
export function WorkspaceSwitcher({ workspaces, activeId, onChange, onCreate, className }: WorkspaceSwitcherProps) {
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0]
  if (!active) return null
  const ActiveIcon = active.icon
  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" aria-label={`Workspace: ${active.name}. Switch workspace`} className="data-[state=open]:bg-sidebar-accent">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {ActiveIcon ? <ActiveIcon className="size-4" /> : <span className="text-sm font-bold">{active.name[0]}</span>}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{active.name}</span>
                {active.plan ? <span className="truncate text-xs text-muted-foreground">{active.plan}</span> : null}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
            {workspaces.map((w, i) => {
              const Icon = w.icon
              return (
                <DropdownMenuItem key={w.id} onSelect={() => onChange(w.id)} className="gap-2 p-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-sm border">
                    {Icon ? <Icon className="size-3.5" /> : <span className="text-xs font-semibold">{w.name[0]}</span>}
                  </div>
                  <span className={cn("flex-1 truncate", w.id === active.id && "font-medium")}>{w.name}</span>
                  {w.id === active.id ? <Check className="size-4" /> : <DropdownMenuShortcut>⌘{i + 1}</DropdownMenuShortcut>}
                </DropdownMenuItem>
              )
            })}
            {onCreate ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onCreate} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <span className="text-muted-foreground">Add workspace</span>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
