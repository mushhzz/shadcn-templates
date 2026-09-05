"use client"

import * as React from "react"
import { Check, Palette, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Presets: primary colour + chart palette per scheme. Values are oklch so they blend with shadcn's
 * default tokens. Only the variables listed here are overridden; everything else stays as-is.
 * -----------------------------------------------------------------------------------------------*/

type Vars = Record<string, string>

export type ThemePreset = {
  id: string
  name: string
  /** Swatch colour shown in the picker. */
  swatch: string
  light: Vars
  dark: Vars
}

const charts = (l: string[], d: string[]) => ({
  light: Object.fromEntries(l.map((v, i) => [`chart-${i + 1}`, v])),
  dark: Object.fromEntries(d.map((v, i) => [`chart-${i + 1}`, v])),
})

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "neutral",
    name: "Neutral",
    swatch: "oklch(0.205 0 0)",
    light: {},
    dark: {},
  },
  {
    id: "blue",
    name: "Blue",
    swatch: "oklch(0.546 0.245 262.881)",
    light: {
      primary: "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      ring: "oklch(0.746 0.16 232.661)",
      "sidebar-primary": "oklch(0.546 0.245 262.881)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      ...charts(["oklch(0.546 0.245 262.881)", "oklch(0.707 0.165 254.624)", "oklch(0.809 0.105 251.813)", "oklch(0.882 0.059 254.128)", "oklch(0.932 0.032 255.585)"], []).light,
    },
    dark: {
      primary: "oklch(0.707 0.165 254.624)",
      "primary-foreground": "oklch(0.208 0.042 265.755)",
      ring: "oklch(0.707 0.165 254.624)",
      "sidebar-primary": "oklch(0.707 0.165 254.624)",
      "sidebar-primary-foreground": "oklch(0.208 0.042 265.755)",
      ...charts([], ["oklch(0.707 0.165 254.624)", "oklch(0.623 0.214 259.815)", "oklch(0.546 0.245 262.881)", "oklch(0.488 0.243 264.376)", "oklch(0.424 0.199 265.638)"]).dark,
    },
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "oklch(0.541 0.281 293.009)",
    light: {
      primary: "oklch(0.541 0.281 293.009)",
      "primary-foreground": "oklch(0.969 0.016 293.756)",
      ring: "oklch(0.702 0.183 293.541)",
      "sidebar-primary": "oklch(0.541 0.281 293.009)",
      "sidebar-primary-foreground": "oklch(0.969 0.016 293.756)",
      ...charts(["oklch(0.541 0.281 293.009)", "oklch(0.606 0.25 292.717)", "oklch(0.702 0.183 293.541)", "oklch(0.811 0.111 293.571)", "oklch(0.894 0.057 293.283)"], []).light,
    },
    dark: {
      primary: "oklch(0.702 0.183 293.541)",
      "primary-foreground": "oklch(0.283 0.141 291.089)",
      ring: "oklch(0.702 0.183 293.541)",
      "sidebar-primary": "oklch(0.702 0.183 293.541)",
      "sidebar-primary-foreground": "oklch(0.283 0.141 291.089)",
      ...charts([], ["oklch(0.702 0.183 293.541)", "oklch(0.606 0.25 292.717)", "oklch(0.541 0.281 293.009)", "oklch(0.491 0.27 292.581)", "oklch(0.432 0.232 292.759)"]).dark,
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "oklch(0.596 0.145 163.225)",
    light: {
      primary: "oklch(0.596 0.145 163.225)",
      "primary-foreground": "oklch(0.979 0.021 166.113)",
      ring: "oklch(0.765 0.177 163.223)",
      "sidebar-primary": "oklch(0.596 0.145 163.225)",
      "sidebar-primary-foreground": "oklch(0.979 0.021 166.113)",
      ...charts(["oklch(0.596 0.145 163.225)", "oklch(0.696 0.17 162.48)", "oklch(0.765 0.177 163.223)", "oklch(0.845 0.143 164.978)", "oklch(0.905 0.093 164.15)"], []).light,
    },
    dark: {
      primary: "oklch(0.696 0.17 162.48)",
      "primary-foreground": "oklch(0.262 0.051 172.552)",
      ring: "oklch(0.696 0.17 162.48)",
      "sidebar-primary": "oklch(0.696 0.17 162.48)",
      "sidebar-primary-foreground": "oklch(0.262 0.051 172.552)",
      ...charts([], ["oklch(0.696 0.17 162.48)", "oklch(0.596 0.145 163.225)", "oklch(0.508 0.118 165.612)", "oklch(0.432 0.095 166.913)", "oklch(0.378 0.077 168.94)"]).dark,
    },
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "oklch(0.666 0.179 58.318)",
    light: {
      primary: "oklch(0.666 0.179 58.318)",
      "primary-foreground": "oklch(0.987 0.022 95.277)",
      ring: "oklch(0.828 0.189 84.429)",
      "sidebar-primary": "oklch(0.666 0.179 58.318)",
      "sidebar-primary-foreground": "oklch(0.987 0.022 95.277)",
      ...charts(["oklch(0.666 0.179 58.318)", "oklch(0.769 0.188 70.08)", "oklch(0.828 0.189 84.429)", "oklch(0.879 0.169 91.605)", "oklch(0.945 0.129 101.54)"], []).light,
    },
    dark: {
      primary: "oklch(0.769 0.188 70.08)",
      "primary-foreground": "oklch(0.279 0.077 45.635)",
      ring: "oklch(0.769 0.188 70.08)",
      "sidebar-primary": "oklch(0.769 0.188 70.08)",
      "sidebar-primary-foreground": "oklch(0.279 0.077 45.635)",
      ...charts([], ["oklch(0.769 0.188 70.08)", "oklch(0.666 0.179 58.318)", "oklch(0.555 0.163 48.998)", "oklch(0.473 0.137 46.201)", "oklch(0.414 0.112 45.904)"]).dark,
    },
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "oklch(0.586 0.253 17.585)",
    light: {
      primary: "oklch(0.586 0.253 17.585)",
      "primary-foreground": "oklch(0.969 0.015 12.422)",
      ring: "oklch(0.712 0.194 13.428)",
      "sidebar-primary": "oklch(0.586 0.253 17.585)",
      "sidebar-primary-foreground": "oklch(0.969 0.015 12.422)",
      ...charts(["oklch(0.586 0.253 17.585)", "oklch(0.645 0.246 16.439)", "oklch(0.712 0.194 13.428)", "oklch(0.81 0.117 11.638)", "oklch(0.892 0.058 10.001)"], []).light,
    },
    dark: {
      primary: "oklch(0.712 0.194 13.428)",
      "primary-foreground": "oklch(0.271 0.105 12.094)",
      ring: "oklch(0.712 0.194 13.428)",
      "sidebar-primary": "oklch(0.712 0.194 13.428)",
      "sidebar-primary-foreground": "oklch(0.271 0.105 12.094)",
      ...charts([], ["oklch(0.712 0.194 13.428)", "oklch(0.645 0.246 16.439)", "oklch(0.586 0.253 17.585)", "oklch(0.514 0.222 16.935)", "oklch(0.455 0.188 13.697)"]).dark,
    },
  },
]

export const RADIUS_OPTIONS = [
  { id: "0", label: "0", value: "0rem" },
  { id: "sm", label: "S", value: "0.375rem" },
  { id: "md", label: "M", value: "0.625rem" },
  { id: "lg", label: "L", value: "0.875rem" },
  { id: "xl", label: "XL", value: "1.25rem" },
] as const

export type ThemeSettings = { preset: string; radius: string }

const STORAGE_KEY = "kit-theme"
const DEFAULTS: ThemeSettings = { preset: "neutral", radius: "md" }
const MANAGED_VARS = ["primary", "primary-foreground", "ring", "sidebar-primary", "sidebar-primary-foreground", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "radius"]

function readSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>
    return { preset: parsed.preset ?? DEFAULTS.preset, radius: parsed.radius ?? DEFAULTS.radius }
  } catch {
    return DEFAULTS
  }
}

export function applyThemeSettings(settings: ThemeSettings, scheme: "light" | "dark") {
  const root = document.documentElement
  for (const v of MANAGED_VARS) root.style.removeProperty(`--${v}`)
  const preset = THEME_PRESETS.find((p) => p.id === settings.preset)
  const vars = preset ? preset[scheme] : {}
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(`--${k}`, v)
  const radius = RADIUS_OPTIONS.find((r) => r.id === settings.radius)
  if (radius && radius.id !== DEFAULTS.radius) root.style.setProperty("--radius", radius.value)
}

/** Loads persisted settings, applies them, and re-applies when the colour scheme changes. */
export function useThemeSettings() {
  const { resolvedTheme } = useTheme()
  const [settings, setSettings] = React.useState<ThemeSettings>(DEFAULTS)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // Read persisted settings once on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(readSettings())
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (!ready) return
    applyThemeSettings(settings, resolvedTheme === "dark" ? "dark" : "light")
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* private mode */
    }
  }, [settings, resolvedTheme, ready])

  return { settings, setSettings, reset: () => setSettings(DEFAULTS) }
}

/** Mount once near the root so persisted settings apply on every page. */
export function ThemeSettingsLoader() {
  useThemeSettings()
  return null
}

export function ThemeCustomizer({ className }: { className?: string }) {
  const { settings, setSettings, reset } = useThemeSettings()
  const { theme, setTheme } = useTheme()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label="Customize theme">
          <Palette className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="grid gap-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">Customize</div>
              <p className="text-xs text-muted-foreground">Pick a colour and radius. Saved to this browser.</p>
            </div>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Reset theme" onClick={reset}>
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Colour</Label>
            <div className="grid grid-cols-3 gap-2">
              {THEME_PRESETS.map((p) => {
                const active = settings.preset === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    className={cn(
                      "flex h-8 items-center gap-2 rounded-md border px-2 text-xs hover:bg-muted",
                      active && "border-foreground/60 bg-muted",
                    )}
                    onClick={() => setSettings((s) => ({ ...s, preset: p.id }))}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: p.swatch }}>
                      {active ? <Check className="size-3 text-white" /> : null}
                    </span>
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Radius</Label>
            <ToggleGroup type="single" variant="outline" size="sm" value={settings.radius} onValueChange={(v) => v && setSettings((s) => ({ ...s, radius: v }))} aria-label="Radius" className="w-full">
              {RADIUS_OPTIONS.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id} className="flex-1" aria-label={`Radius ${r.label}`}>
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Mode</Label>
            <ToggleGroup type="single" variant="outline" size="sm" value={theme ?? "system"} onValueChange={(v) => v && setTheme(v)} aria-label="Colour mode" className="w-full">
              <ToggleGroupItem value="light" className="flex-1">
                Light
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" className="flex-1">
                Dark
              </ToggleGroupItem>
              <ToggleGroupItem value="system" className="flex-1">
                System
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
