"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronsUpDown, LogOut, Moon, Search, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

export type NavGroup = { label?: string; items: NavItem[] }

export type AppShellProps = {
  brand: { name: string; href: string; icon?: React.ComponentType<{ className?: string }> }
  nav: NavGroup[]
  user: { name: string; email: string; initials: string }
  breadcrumbs?: { label: string; href?: string }[]
  currentPath?: string
  onSearch?: () => void
  children: React.ReactNode
}

export function isNavItemActive(current: string | undefined, href: string) {
  if (!current) return false
  if (current === href) return true
  // Nested routes count as active for non-root hrefs, e.g. /crm/deals/123 under /crm/deals.
  return href.split("/").filter(Boolean).length > 1 && current.startsWith(`${href}/`)
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}

export function AppShell({
  brand,
  nav,
  user,
  breadcrumbs,
  currentPath,
  onSearch,
  children,
}: AppShellProps) {
  const BrandIcon = brand.icon
  return (
    <TooltipProvider delayDuration={0}>
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href={brand.href}>
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    {BrandIcon ? (
                      <BrandIcon className="size-4" />
                    ) : (
                      <span className="text-sm font-bold">{brand.name[0]}</span>
                    )}
                  </div>
                  <span className="font-semibold">{brand.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {nav.map((group, gi) => (
            <SidebarGroup key={group.label ?? gi}>
              {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isNavItemActive(currentPath, item.href)}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            {Icon ? <Icon className="size-4" /> : null}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" aria-label={user.name}>
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => {
                  const last = i === breadcrumbs.length - 1
                  return (
                    <React.Fragment key={`${crumb.label}-${i}`}>
                      <BreadcrumbItem>
                        {last || !crumb.href ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {last ? null : <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            {onSearch ? (
              <Button variant="ghost" size="icon" aria-label="Search" onClick={onSearch}>
                <Search className="size-4" />
              </Button>
            ) : null}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}
