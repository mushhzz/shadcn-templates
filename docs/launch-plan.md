# Launch plan: @kit as a paid TanStack Start template kit

Written 2026-09-13 from a market sweep (see memory notes) and an audit of this repo.

## Where the repo actually stands

More is built than the README's "4 templates pending" framing suggests. All four
templates ship today, with mock data layers, tests, an axe + overflow QA pass at
1400px and 390px, a smoke installer, and a live Vercel host.

| Asset | State | Notes |
|---|---|---|
| 24 blocks | done | Every block has a skeleton, AA axe pass, 390px check |
| `dashboard` | done | 27 files, 5 pages |
| `crm` | done | 23 files, contacts/companies/deals/tasks |
| `chat` | done | 16 files, three-pane |
| `agent` | done | 24 files, runs/traces/usage/API keys |
| Auth + error pages | done | 6 routes |
| QA pipeline | done | `pnpm qa`, `pnpm smoke`, screenshots |
| Theme customizer | done | 6 colour presets, 5 radii, light/dark |

Framework coupling is small and mechanical. Only two Next imports appear in
registry source: `next/link` (22 sites) and `next/navigation` (10 sites), all
inside template pages. Blocks themselves are framework-free. Fonts are loaded
via `next/font/google` in the root layout only.

## The two problems that stop this selling today

### 1. It is a Next.js kit in a market that already has fifty Next.js kits

The Next.js template space is saturated (Shadcn Studio, shadcnblocks, ReUI,
ShadcnStore, supastarter, thefrontkit, Creative Tim). The TanStack Start space
has roughly eight listed templates, nearly all free starters, and two paid
sellers: tanstackship (two templates at $99) and supastarter (early access).
Demand is rising: r/tanstack "looking for good TS Start templates", r/reactjs
"why are people moving from Next.js to TanStack Start", Inngest's public
migration post. This repo already targets TanStack Table v9; the router and
server-function layer are the missing piece.

### 2. It looks like default shadcn

The screenshots are clean and competent, but they are Geist + zinc + white
cards + 1px borders + the standard sidebar. Every AI-generated dashboard in
2026 looks exactly like this, and there is a loud "AI design slop" backlash
(r/Frontend "tired of every shadcn app looking the same", the 16-pattern slop
checklist, r/ClaudeCode threads). Nobody is selling a kit whose pitch is
"shadcn that does not look like shadcn". That is the marketing wedge, and it
cannot be faked with a colour preset. It needs a real design system layer.

## Positioning

**One line:** Production app templates for TanStack Start that don't look
vibe-coded.

**Buyer:** solo devs and small teams who chose TanStack Start (or are leaving
Next.js), are shipping an internal tool, SaaS admin, or AI product, and are
embarrassed by how generic their UI looks.

**Price:** $99 per template, $199 all-access lifetime. Match tanstackship on
price and win on design quality and template depth. Do not undercut; cheap
signals low quality in this market.

**Free tier:** all 24 blocks stay free and installable. They are the funnel and
the SEO surface. Templates are paid.

## Build order

### Phase 1: design system layer (weeks 1 to 2) — DONE 2026-09-13

Shipped on the `design-system` branch: Bricolage Grotesque + IBM Plex via
Fontsource, tinted surfaces with `--hue`/`--tint`, designed dark mode, six
retinting presets, `brand` and `elevated` tokens, borderless cards on a shadow
ramp, motion tokens, `DESIGN.md`, the anti-slop check in `pnpm qa`, and a
full illustrated asset layer (`@kit/kit-assets`, 71 SVGs generated with
Higgsfield/Recraft in the kit palette). Remaining from the original list: the
per-template `SKILL.md` for coding agents.

Original plan for reference:

This is the differentiator and every template inherits it, so it comes before
any porting.

- **Typography.** Replace Geist with a paired system that is not on the slop
  list: one display/heading face with real character plus one workhorse body
  face, plus a mono for data. Load via a plain `@font-face` or Fontsource so
  the same CSS works in Next and TanStack Start. `font-heading` is already a
  token; start using it (it is referenced in only 4 places today).
- **Colour.** Stop shipping pure white surfaces and neutral zinc. Give each of
  the six presets a tinted surface scale (background, card, elevated) and a
  genuine accent, in oklch, with the dark theme designed rather than inverted.
  Keep the `success`/`warning`/`info` semantic tokens.
- **Surface and depth.** Choose one system and commit: either tinted flat
  surfaces with no borders, or borders with a warm shadow ramp. Not the
  default 1px border on everything.
- **Density and rhythm.** Tighter sidebar, larger numerals in stat cards with
  tabular figures, real hierarchy between page title and section titles.
- **Motion.** Small, consistent enter transitions on sheets, dialogs, and list
  rows. Already have `tw-animate-css`; define three durations and use only
  those.
- **Anti-slop checklist in the repo.** Encode the 16 patterns as a
  `DESIGN.md` plus a Playwright check in `scripts/qa.mjs` that fails on the
  detectable ones (Inter/Geist in computed styles, gradient text, coloured
  left borders, emoji in headings, three-column feature grids). This becomes
  a selling point: "passes the slop check in CI".
- **Agent skill.** Ship `SKILL.md` and an `AGENTS.md` block with each template
  so Claude Code and Cursor extend the template without regressing to
  defaults. Buyers are using agents; a kit that keeps the agent on-brand is
  worth paying for.

Verify with `pnpm qa:shots` and compare before/after screenshots. If the
after does not look obviously different at thumbnail size, iterate.

### Phase 2: TanStack Start port (weeks 3 to 4)

- Add a second app in the repo (`apps/start`) or a sibling workspace so the
  registry can emit both targets. The blocks are shared unchanged.
- Replace `next/link` with `@tanstack/react-router` `Link` and
  `next/navigation` with `useRouter`/`useNavigate`/`useSearch`. Wrap these in
  a tiny `lib/nav.ts` adapter per target so template code has one import.
- Move mock `queries.ts` behind server functions (`createServerFn`) so the
  "replace with real data" story is idiomatic TanStack Start.
- Root layout: fonts via CSS, theme provider unchanged.
- Extend `scripts/smoke-install.sh` to scaffold a TanStack Start app and
  install every item into it. That smoke test is the product guarantee.
- Publish registry JSON under `/r/start/{name}.json` alongside the existing
  Next output. Buyers pick the target in `components.json`.

Ship TanStack Start as the headline target. Keep Next as a second target;
it is nearly free and widens the funnel, but do not market it first.

### Phase 3: template order and what each needs

Order by market gap, not by what is most finished.

1. **`agent`** — first. AI agent platforms are the hottest build category,
   the existing template already has runs, traces, tool calls, usage, and
   API keys, and no TanStack Start seller has one. Add: streaming state via
   AI SDK hooks, a trace waterfall view, cost per run, and a model picker
   wired to a real provider adapter interface.
2. **`dashboard`** — second, as the "internal tools" template. Rename the
   positioning from "admin dashboard" to "internal tool starter". Add: an
   audit log page, role-based nav visibility, and a settings page with real
   form validation via TanStack Form (there is official shadcn guidance for
   this and almost no templates use it yet).
3. **`crm`** — third. Add: a timeline/activity view per contact, saved views
   on the data table, import/export. This one is the most crowded category,
   so it rides on the design system rather than novelty.
4. **`chat`** — fold into `agent` or ship as a free template. Standalone chat
   UI is the most saturated niche found (12+ options including Vercel's
   official AI Elements and shadcn's own June 2026 chat components).
   Keeping it free as a lead magnet is the better use.

### Phase 4: storefront and launch (week 5)

- **Checkout:** Polar or Lemon Squeezy. License key gates a private registry
  URL (`/r/pro/{name}.json?key=`). shadcn CLI v4 supports headers in
  `components.json`, so no custom installer is needed.
- **Site:** the existing gallery becomes the marketing site. Each template
  gets a live demo route, a mobile demo, and a "before/after: default shadcn
  vs @kit" comparison. That comparison is the hero.
- **Distribution (~$350 of the $1000):** sponsor one TanStack-focused
  creator or newsletter, submit to the official shadcn registry directory,
  tanstack.com showcase, shadcn.io, allshadcn, shadcntemplates.com, and the
  AdminLTE roundup author (they publish TanStack Start lists and clearly
  need entries). Post the free blocks and the slop-check tool on r/tanstack,
  r/reactjs, and r/ClaudeCode.
- **Reserve (~$500):** domain, Vercel, second distribution test.

## Budget

| Item | Est. |
|---|---|
| Fonts (commercial licence if not open) | $0 to $150 |
| Domain | $15 |
| Vercel Pro (optional, first 3 months) | $60 |
| Polar/Lemon Squeezy | % of sales only |
| Creator sponsorship / newsletter | $300 to $350 |
| Reserve | ~$450 |

## What I could not verify

- Reddit blocked scraping, so demand signals are thread titles and snippets,
  not vote or comment counts.
- Stow.build's creator revenue split is unpublished.
- Whether shadcn CLI v4 registry auth headers work with TanStack Start
  projects end to end. Test this in Phase 2 before building the license gate.

## First three tasks

1. Pick the type pairing and surface system; apply to `dashboard` only;
   run `pnpm qa:shots`; compare thumbnails.
2. Add the anti-slop Playwright check to `scripts/qa.mjs`.
3. Scaffold `apps/start` with TanStack Start, install `app-shell` and
   `data-table` from the local registry, and confirm the smoke test passes.
