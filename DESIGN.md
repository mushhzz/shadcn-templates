# Design system

This is the layer that stops @kit looking like every other shadcn app. Agents and
humans editing this repo follow it. `pnpm qa` enforces the checkable parts.

## Type

| Role | Face | Token | Use |
|---|---|---|---|
| Display | Bricolage Grotesque (variable) | `font-heading` | h1 to h4, card titles, stat values, hero numbers |
| Body | IBM Plex Sans (variable) | `font-sans` | everything else |
| Data | IBM Plex Mono | `font-mono` | ids, code, keys, timestamps in tables |

Fonts load through Fontsource CSS imports in `app/globals.css`, so the same file
works in Next.js, TanStack Start and Vite. Never add `next/font`, Google Fonts
links, Inter, Geist, or Space Grotesk.

Scale: page title `text-3xl`, card title 17px, stat value 28px, hero value
`text-4xl`. Numbers are `tabular-nums` (set globally on tables and stat cards).

## Colour

Every neutral derives from two variables, `--hue` and `--tint`, so a preset
shifts the whole page toward its accent, not just the buttons. Surfaces are
tinted paper, never pure white; dark mode is a designed warm charcoal, not an
inversion.

Depth is a lightness ladder: `background` < `sidebar` < `card` < `elevated`.
Cards carry `shadow-card` (a hairline plus a 1px soft shadow). Popovers,
menus and dialogs carry `shadow-popover`. Nothing else casts a shadow.

Tokens beyond stock shadcn:

- `brand` / `brand-foreground`: the accent as a large surface. Stays deep in
  dark mode so hero cards do not glare. Use for at most one block per screen.
- `elevated`: the top of the surface ladder, for things floating over a card.
- `success`, `warning`, `info`: status text and `/15` tints for fills.

Presets live in `components/blocks/theme-customizer.tsx` and set hue, tint,
accent, brand, ring and a five-colour chart palette for both schemes.

## Surface rules

- Cards have no border. Do not add `border`, `ring-1` or `divide-y` to a card.
- Do not put a coloured left border on anything.
- No gradients on surfaces or text. `bg-brand` is the loud option.
- Chrome (sidebar, header) may use a hairline `border-sidebar-border`.
- Inputs keep their border; it is `--input`, tinted, not grey.

## Motion

Three durations, one ease, defined in `globals.css`: `duration-fast` (120ms)
for hover and focus, `duration-base` (200ms) for enter and exit of sheets,
menus and rows, `duration-slow` (320ms) for page-level reveals. Ease is
`ease-out-quart`. Nothing bounces.

## Content

- No emoji in headings, labels, buttons or card titles.
- No "Congratulations", "Welcome back", or exclamation marks in UI copy.
- Eyebrow labels are uppercase, 12px, tracked, muted. Use them sparingly.
- Icons are Lucide, 16px in chrome, 20px in empty states, never inside an h1.

## What the QA check fails on

`scripts/qa.mjs` fails a route when it finds:

1. Inter, Geist or Space Grotesk in any computed `font-family`.
2. An h1 to h3 whose heading font is not Bricolage Grotesque.
3. Gradient text (`background-clip: text` with a gradient image).
4. A gradient background on any element wider than 200px.
5. An element with a coloured left border and no other borders.
6. Emoji in an h1, h2, h3, card title, or a short button label (buttons over 30 characters or containing an avatar are treated as rows of user content).
7. A card (`[data-slot=card]`) with a visible border.

Run `pnpm qa` before calling any visual work done.
