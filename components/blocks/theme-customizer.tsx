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
 * Presets. Each one sets the surface hue/tint (which every neutral token derives from in
 * globals.css) plus the accent, ring and chart palette. Surfaces are tinted toward the accent so
 * the whole page shifts, not just the buttons.
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

type PresetSpec = {
  id: string
  name: string
  /** Surface hue (oklch) and how much chroma the neutrals carry. */
  hue: number
  tint: number
  /** Accent [light, dark] as oklch strings. */
  accent: [string, string]
  accentForeground: [string, string]
  /** Large-surface colour in dark mode; defaults to the light accent. */
  brandDark?: string
  charts: [string[], string[]]
}

function preset(spec: PresetSpec): ThemePreset {
  const [aL, aD] = spec.accent
  const [fL, fD] = spec.accentForeground
  const base = { hue: String(spec.hue), tint: String(spec.tint) }
  return {
    id: spec.id,
    name: spec.name,
    swatch: aL,
    light: {
      ...base,
      primary: aL,
      "primary-foreground": fL,
      brand: aL,
      "brand-foreground": fL,
      ring: aL.replace(")", " / 0.5)"),
      "sidebar-primary": aL,
      "sidebar-primary-foreground": fL,
      ...Object.fromEntries(spec.charts[0].map((v, i) => [`chart-${i + 1}`, v])),
    },
    dark: {
      ...base,
      primary: aD,
      "primary-foreground": fD,
      brand: spec.brandDark ?? aL,
      "brand-foreground": fL,
      ring: aD.replace(")", " / 0.5)"),
      "sidebar-primary": aD,
      "sidebar-primary-foreground": fD,
      ...Object.fromEntries(spec.charts[1].map((v, i) => [`chart-${i + 1}`, v])),
    },
  }
}

export const THEME_PRESETS: ThemePreset[] = [
  preset({
    id: "ink",
    name: "Ink",
    hue: 75,
    tint: 0.008,
    accent: ["oklch(0.31 0.045 265)", "oklch(0.86 0.04 265)"],
    accentForeground: ["oklch(0.985 0.005 75)", "oklch(0.2 0.03 265)"],
    charts: [
      ["oklch(0.31 0.045 265)", "oklch(0.55 0.08 250)", "oklch(0.72 0.08 60)", "oklch(0.6 0.12 150)", "oklch(0.65 0.14 25)"],
      ["oklch(0.86 0.04 265)", "oklch(0.65 0.1 250)", "oklch(0.78 0.1 60)", "oklch(0.7 0.14 150)", "oklch(0.72 0.15 25)"],
    ],
  }),
  preset({
    id: "ocean",
    name: "Ocean",
    hue: 240,
    tint: 0.01,
    accent: ["oklch(0.5 0.17 255)", "oklch(0.78 0.11 245)"],
    accentForeground: ["oklch(0.985 0.01 250)", "oklch(0.2 0.05 255)"],
    charts: [
      ["oklch(0.5 0.17 255)", "oklch(0.66 0.13 230)", "oklch(0.78 0.09 200)", "oklch(0.7 0.1 70)", "oklch(0.6 0.16 25)"],
      ["oklch(0.78 0.11 245)", "oklch(0.66 0.13 230)", "oklch(0.55 0.15 255)", "oklch(0.8 0.1 70)", "oklch(0.72 0.15 25)"],
    ],
  }),
  preset({
    id: "violet",
    name: "Violet",
    hue: 300,
    tint: 0.01,
    accent: ["oklch(0.5 0.2 295)", "oklch(0.8 0.1 295)"],
    accentForeground: ["oklch(0.985 0.01 295)", "oklch(0.22 0.07 295)"],
    charts: [
      ["oklch(0.5 0.2 295)", "oklch(0.64 0.17 305)", "oklch(0.76 0.11 320)", "oklch(0.7 0.1 70)", "oklch(0.62 0.13 180)"],
      ["oklch(0.8 0.1 295)", "oklch(0.68 0.16 305)", "oklch(0.56 0.2 295)", "oklch(0.8 0.1 70)", "oklch(0.72 0.12 180)"],
    ],
  }),
  preset({
    id: "moss",
    name: "Moss",
    hue: 140,
    tint: 0.01,
    accent: ["oklch(0.45 0.11 155)", "oklch(0.8 0.12 155)"],
    accentForeground: ["oklch(0.985 0.01 155)", "oklch(0.2 0.04 155)"],
    charts: [
      ["oklch(0.45 0.11 155)", "oklch(0.62 0.13 145)", "oklch(0.76 0.1 120)", "oklch(0.7 0.1 70)", "oklch(0.55 0.12 250)"],
      ["oklch(0.8 0.12 155)", "oklch(0.66 0.13 145)", "oklch(0.52 0.11 155)", "oklch(0.8 0.1 70)", "oklch(0.68 0.1 250)"],
    ],
  }),
  preset({
    id: "clay",
    name: "Clay",
    hue: 45,
    tint: 0.014,
    accent: ["oklch(0.55 0.15 45)", "oklch(0.8 0.12 60)"],
    accentForeground: ["oklch(0.985 0.01 60)", "oklch(0.24 0.05 45)"],
    charts: [
      ["oklch(0.55 0.15 45)", "oklch(0.7 0.13 65)", "oklch(0.82 0.1 85)", "oklch(0.55 0.1 250)", "oklch(0.6 0.12 150)"],
      ["oklch(0.8 0.12 60)", "oklch(0.7 0.13 55)", "oklch(0.6 0.14 45)", "oklch(0.68 0.1 250)", "oklch(0.72 0.12 150)"],
    ],
  }),
  preset({
    id: "rose",
    name: "Rose",
    hue: 10,
    tint: 0.01,
    accent: ["oklch(0.55 0.2 15)", "oklch(0.8 0.1 15)"],
    accentForeground: ["oklch(0.985 0.01 15)", "oklch(0.24 0.06 15)"],
    charts: [
      ["oklch(0.55 0.2 15)", "oklch(0.68 0.16 20)", "oklch(0.8 0.1 30)", "oklch(0.55 0.1 250)", "oklch(0.6 0.12 150)"],
      ["oklch(0.8 0.1 15)", "oklch(0.7 0.15 20)", "oklch(0.6 0.19 15)", "oklch(0.68 0.1 250)", "oklch(0.72 0.12 150)"],
    ],
  }),
]

export const RADIUS_OPTIONS = [
  { id: "0", label: "0", value: "0rem" },
  { id: "sm", label: "S", value: "0.375rem" },
  { id: "md", label: "M", value: "0.75rem" },
  { id: "lg", label: "L", value: "0.875rem" },
  { id: "xl", label: "XL", value: "1.25rem" },
] as const

export type ThemeSettings = { preset: string; radius: string }

const STORAGE_KEY = "kit-theme"
const DEFAULTS: ThemeSettings = { preset: "ink", radius: "md" }
const MANAGED_VARS = ["hue", "tint", "primary", "primary-foreground", "brand", "brand-foreground", "ring", "sidebar-primary", "sidebar-primary-foreground", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "radius"]

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
