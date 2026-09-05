"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, ChevronsUpDown, LogOut, Moon, Search, Settings, Sun } from "lucide-react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type NavItem = {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  /** Nested links rendered as a collapsible sub-menu. */
  items?: { title: string; href: string; badge?: string }[]
}

export type NavGroup = { label?: string; items: NavItem[] }

export type Breadcrumb = { label: string; href?: string }

export type AppShellUser = { name: string; email: string; initials: string }

export type AppShellProps = {
  brand: { name: string; href: string; icon?: React.ComponentType<{ className?: string }> }
  nav: NavGroup[]
  user: AppShellUser
  breadcrumbs?: Breadcrumb[]
  currentPath?: string
  onSearch?: () => void
  /** Replaces the default brand button in the sidebar header (e.g. a workspace switcher). */
  sidebarHeader?: React.ReactNode
  /** Rendered in the header, right of the breadcrumbs (e.g. date range, primary action). */
  headerActions?: React.ReactNode
  /** Rendered in the header before the theme toggle (e.g. notifications, command palette trigger). */
  headerTools?: React.ReactNode
  /** Items appended to the user dropdown menu. */
  userMenu?: React.ReactNode
  variant?: "sidebar" | "inset" | "floating"
  collapsible?: "icon" | "offcanvas" | "none"
  className?: string
  children: React.ReactNode
}

export function isNavItemActive(current: string | undefined, href: string) {
  if (!current) return false
  if (current === href) return true
  // Nested routes count as active for non-root hrefs, e.g. /crm/deals/123 under /crm/deals.
  return href.split("/").filter(Boolean).length > 1 && current.startsWith(`${href}/`)
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}

function NavEntry({ item, currentPath }: { item: NavItem; currentPath?: string }) {
  const Icon = item.icon
  const active = isNavItemActive(currentPath, item.href)
  const childActive = item.items?.some((c) => isNavItemActive(currentPath, c.href)) ?? false

  if (item.items && item.items.length > 0) {
    return (
      <Collapsible asChild defaultOpen={active || childActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={active && !childActive}>
              {Icon ? <Icon className="size-4" /> : null}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((sub) => (
                <SidebarMenuSubItem key={sub.href}>
                  <SidebarMenuSubButton asChild isActive={isNavItemActive(currentPath, sub.href)}>
                    <Link href={sub.href}>
                      <span>{sub.title}</span>
                      {sub.badge ? <span className="ml-auto text-xs text-muted-foreground">{sub.badge}</span> : null}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
        <Link href={item.href}>
          {Icon ? <Icon className="size-4" /> : null}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  )
}

export function AppShell({
  brand,
  nav,
  user,
  breadcrumbs,
  currentPath,
  onSearch,
  sidebarHeader,
  headerActions,
  headerTools,
  userMenu,
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
}: AppShellProps) {
  const BrandIcon = brand.icon
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <Sidebar collapsible={collapsible} variant={variant} role="complementary" aria-label="Sidebar">
          <SidebarHeader>
            {sidebarHeader ?? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild size="lg">
                    <Link href={brand.href}>
                      <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        {BrandIcon ? (
                          <BrandIcon className="size-4" />
                        ) : (
                          <span className="text-sm font-bold">{brand.name[0]}</span>
                        )}
                      </div>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold">{brand.name}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarHeader>
          <SidebarContent>
            <nav aria-label="Primary" className="contents">
              {nav.map((group, gi) => (
                <SidebarGroup key={group.label ?? gi}>
                  {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <NavEntry key={item.href} item={item} currentPath={currentPath} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </nav>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg" aria-label={`${user.name} account menu`}>
                      <Avatar className="size-8 shrink-0 rounded-lg">
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
                    <DropdownMenuLabel className="font-normal">
                      <div className="grid">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenu}
                    <DropdownMenuItem>
                      <Settings className="size-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="size-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0">
          <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 hidden h-4 sm:block" />
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap">
                  {breadcrumbs.map((crumb, i) => {
                    const last = i === breadcrumbs.length - 1
                    return (
                      <React.Fragment key={`${crumb.label}-${i}`}>
                        <BreadcrumbItem className={cn(!last && "hidden sm:inline-flex")}>
                          {last || !crumb.href ? (
                            <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {last ? null : <BreadcrumbSeparator className="hidden sm:block" />}
                      </React.Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}
            <div className="ml-auto flex items-center gap-1">
              {headerActions ? <div className="mr-1 flex items-center gap-2">{headerActions}</div> : null}
              {onSearch ? (
                <Button variant="ghost" size="icon" aria-label="Search" onClick={onSearch}>
                  <Search className="size-4" />
                </Button>
              ) : null}
              {headerTools}
              <ThemeToggle />
            </div>
          </header>
          {/* SidebarInset already renders the <main> landmark. */}
          <div className={cn("flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6", className)}>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
