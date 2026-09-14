# THOTH — Brand Rebrand Brief (for Claude Design)

Paste the block below into Claude Design. Attach: the bee reference image,
2–3 screenshots of the current THOTH UI (dashboard, a table page, dark mode),
and these files:

  src/index.css
  src/components/Logo.tsx
  public/favicon.svg
  public/thoth-logo.svg
  public/thoth-ibis.svg
  public/thoth-logo-word.svg
  src/components/Sidebar.tsx
  src/components/Topbar.tsx
  src/pages/ExecutiveDashboard.tsx
  src/components/ui/{button,card,badge}.tsx

---

## THE PROMPT

I'm rebranding THOTH — a production ERP for a furniture/fashion manufacturer.
It's a dense, serious tool: 107 pages of tables, pipelines, payroll, stock
control. People live in it eight hours a day.

Right now it's muted lilac (#8C6FAE) on near-white. It's tasteful and completely
forgettable — the kind of palette that apologises for existing. I want to burn
that down and rebuild it in yellow.

### The feeling I'm after

Warm, confident, a little flirtatious. Honey and butter, not neon and caution
tape. It should feel like sunlight on a wooden workshop floor — soft, cheerful,
expensive. Somewhere between a good bakery's packaging and a well-made tool.

Three things it must never become:
- **Cheap.** Yellow goes to "budget airline" and "warning label" fast. Guard
  against it with warm greys, generous whitespace, and restraint in how much
  yellow actually lands on screen.
- **Harsh.** The current build already has a glare problem on near-white.
  Yellow will make it worse unless the canvas gets warmer and softer.
- **Sharp.** Nothing knife-edged. Rounded terminals, soft shadows, generous
  radii. The current radius is 0.875rem — keep it or go rounder.

### The colour

I've picked the anchor already. My yellow sits between *butter* and *corn* —
**NOT** the saturated marigold in the bee reference. That reference is for the
logo shape only; its orange is too aggressive.

Starting ramp — refine it, don't ignore it:

| Role         | HSL                | Hex     | Use                                            |
|--------------|--------------------|---------|------------------------------------------------|
| Signature    | hsl(51 85% 74%)    | #F5E484 | The brand yellow. Logo, hero fills, flat areas  |
| Primary      | hsl(46 88% 58%)    | #EFC63A | Buttons, active nav, focus — with graphite text |
| Deep         | hsl(40 72% 38%)    | #A67518 | Yellow text on light, icons, links              |
| Wash         | hsl(51 80% 94%)    | #FCF6D9 | Selected rows, hover tints, sidebar             |
| Dark lift    | hsl(48 90% 68%)    | —       | Yellow reads dimmer on dark; lift it            |

Constraints that are non-negotiable:
- The signature yellow is too light to be `--primary`. Buttons need the deeper
  step with dark text. Every text/background pair must clear **WCAG AA (4.5:1)**
  for body copy, 3:1 for large text and UI borders. Show me the ratios.
- Yellow cannot carry status. `--destructive`, warning, and success need a
  companion palette that doesn't collide with the brand hue — I'd guess a
  soft terracotta and a muted moss, but you decide.
- Charts need 5 distinguishable series (`--chart-1` … `--chart-5`) that survive
  next to a yellow UI **and** work for colour-blind users. This is the hardest
  part of the whole job. Don't hand me five yellows.
- Full dark mode. The current dark canvas is `220 14% 10%` — cool graphite.
  Decide whether it warms up, and show me both.

### The logo

Current mark is an ibis (Thoth, the Egyptian god). I want to replace it with a
**bee** — worker, hive, production. Heads up that this drops the name's
mythology; I'm fine with that, but flag it if you think the wordmark should
shift too.

The attached reference is the right *silhouette* — symmetrical, wings swept
wide, chevron-striped abdomen, lightning-bolt antennae. What I want changed:

- **Soften every edge.** The reference is all hard vector points and knife-tip
  wings. Round the terminals. Let the wings have weight and a gentle curve
  instead of straight-cut blades. The abdomen chevrons should feel like soft
  bands, not shards.
- **Keep the angry eyes** — but make them *cheeky-angry*, not menacing. Angled
  brows, determined scowl, the expression of something small that means
  business. Rounded eye shapes, not slits. It should make people smile.
- **Plumper body.** More bee, less dagger.
- Must survive at **16px** as a favicon and at **20px** in the sidebar. Test it
  small before you fall in love with it large.

The existing `Logo.tsx` takes `variant` (mark / wordmark / full) and `theme`
(dark / light / gold). Keep that API. The `gold` theme probably becomes the
signature yellow — tell me if the three-theme split still makes sense.

### What I want back

1. **The token set** — every variable in `src/index.css`, light and dark,
   as drop-in HSL triples using the exact variable names already in the file.
   Don't rename anything; the app reads these directly.
2. **The bee**, as clean SVG paths, in the three themes, plus favicon
   and app-icon crops.
3. **The wordmark lockup** — mark + THOTH, horizontal and stacked.
4. **Applied UI**, so I can judge it in situ rather than on swatches:
   sidebar + topbar, a dense data table with selected rows, a KPI card row,
   a chart, the button family, badges/status pills. Light and dark.
5. **A one-screen rationale** — why these values, where the contrast is
   tightest, and what to watch for when it's applied across 107 pages.

Push it. I'd rather talk you back from too bold than beg you toward it.

---

## After Claude Design ships

Codebase cleanup, in order:
1. Replace the token blocks in `src/index.css` (light `:root` + `.dark`).
2. Swap the SVG paths in `src/components/Logo.tsx` (hardcoded #8B72A7 / #2E3036 / #C9A96E).
3. Regenerate the 6 files in `public/`.
4. Sweep the tail: 511 hardcoded `purple-*` / `violet-*` / `indigo-*` Tailwind
   classes across 102 files under `src/` — these bypass the token system and
   will stay purple until each one is mapped to a semantic token.
