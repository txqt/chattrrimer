---
version: 1.2.0
name: ChatTrimmer
website: "https://github.com/txqt/chattrrimer"
description: >-
  The design language of the ChatTrimmer browser-extension popup — a dark,
  instrument-like utility built on a near-black zinc canvas "#141619", a single
  violet voltage "#a855f7" reserved for folded state and primary action, and a
  monospace voice (JetBrains Mono) that carries every number, label and tag.
  Display and body copy run Plus Jakarta Sans. Surfaces are separated by 1px
  hairlines rather than shadows; the only shadow in the system is the violet
  glow under the on-page button.
lastUpdated: "2026-10-14"

colors:
  canvas: "#141619"
  canvas-deep: "#0f1012"
  surface-row: "#17191d"
  surface-raised: "#22252b"
  surface-stepper: "#111316"
  surface-stats: "#0e0f11"
  surface-footer: "rgba(0,0,0,0.4)"
  hairline: "#26282d"
  hairline-soft: "rgba(38,40,45,0.8)"
  ink: "#e4e4e7"
  ink-dim: "#a1a1aa"
  ink-faint: "#71717a"
  violet: "#a855f7"
  violet-light: "#c084fc"
  violet-pale: "#d8b4fe"
  violet-deep: "#9333ea"
  violet-wash: "rgba(168,85,247,0.1)"
  violet-fold: "rgba(59,7,100,0.4)"
  violet-panel: "rgba(59,7,100,0.2)"
  violet-panel-edge: "rgba(168,85,247,0.4)"
  success: "#34d399"
  destructive: "#b91c1c"

typography:
  family-sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  family-mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace"
  title:
    fontFamily: "{typography.family-sans}"
    fontSize: 14px
    fontWeight: 600
    letterSpacing: "-0.2px"
  sub:
    fontFamily: "{typography.family-sans}"
    fontSize: 11px
    fontWeight: 400
  body:
    fontFamily: "{typography.family-sans}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "{typography.family-mono}"
    fontSize: 10px
    fontWeight: 400
    letterSpacing: "0.08em"
  label-value:
    fontFamily: "{typography.family-mono}"
    fontSize: 12px
    fontWeight: 600
  tag:
    fontFamily: "{typography.family-mono}"
    fontSize: 9px
    fontWeight: 400
  caption:
    fontFamily: "{typography.family-mono}"
    fontSize: 10px
    fontWeight: 400
  button:
    fontFamily: "{typography.family-sans}"
    fontSize: 12px
    fontWeight: 500

rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"

spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "10px"
  base: "12px"
  lg: "14px"
  xl: "16px"

components:
  popup-shell:
    width: "360px"
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  header:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "14px 16px"
    borderBottom: "1px solid {colors.hairline-soft}"
  state-pill:
    backgroundColor: "{colors.violet-wash}"
    textColor: "{colors.violet-pale}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
    border: "1px solid rgba(168,85,247,0.3)"
  state-pill-off:
    backgroundColor: transparent
    textColor: "{colors.ink-dim}"
    border: "1px solid {colors.hairline}"
  fold-row:
    backgroundColor: "{colors.surface-row}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "10px"
    border: "1px solid {colors.hairline}"
  fold-index:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
  fold-tag:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.tag}"
    rounded: "{rounded.xs}"
    padding: "1px 6px"
  fold-expand:
    backgroundColor: "{colors.violet-fold}"
    textColor: "{colors.violet-light}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "5px 9px"
    border: "1px solid rgba(107,33,168,0.5)"
  tail-card:
    backgroundColor: "{colors.violet-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
    border: "1px solid {colors.violet-panel-edge}"
  tag-visible:
    backgroundColor: "rgba(88,28,135,0.5)"
    textColor: "{colors.violet-pale}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: "2px 7px"
  button-unfold:
    backgroundColor: "{colors.violet-deep}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  stepper:
    backgroundColor: "{colors.surface-stepper}"
    padding: "12px 16px"
    borderTop: "1px solid {colors.hairline}"
  range-track:
    backgroundColor: "{colors.surface-raised}"
    height: "6px"
    rounded: "{rounded.pill}"
  stats-row:
    backgroundColor: "{colors.surface-stats}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.caption}"
    padding: "10px 16px"
    borderTop: "1px solid {colors.hairline-soft}"
  footer:
    backgroundColor: "{colors.surface-footer}"
    textColor: "{colors.ink-dim}"
    typography: "{typography.caption}"
    padding: "10px 16px"
    borderTop: "1px solid {colors.hairline}"
  toast:
    backgroundColor: "{colors.violet-deep}"
    textColor: "#ffffff"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  toast-error:
    backgroundColor: "{colors.destructive}"
  on-page-button:
    backgroundColor: "{colors.violet-deep}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
    shadow: "0 6px 18px rgba(147,51,234,0.28)"
---

## Overview

ChatTrimmer's popup is a **dark instrument panel**, not a settings page. It opens for a few seconds, answers one question — *is my thread folded, and can I get it back?* — and gets out of the way.

The canvas is a near-black zinc `{colors.canvas}` (`#141619`), one step lighter than the page behind it. Surfaces climb in small, deliberate steps: `{colors.surface-row}` (`#17191d`) for fold rows, `{colors.surface-raised}` (`#22252b`) for the small index/tag chips, `{colors.surface-stepper}` (`#111316`) and `{colors.surface-stats}` (`#0e0f11`) darkening again for the lower bands. There is no light surface anywhere except the white text.

Colour carries meaning, not decoration. **Violet** is the folded/foldable state: it marks the active tail panel, the Expand buttons, the primary action and the on-page button. Everything else is greyscale. Green `{colors.success}` (`#34d399`) marks liveness only — the state dot in the header and the status dot in the tail card. Red `{colors.destructive}` (`#b91c1c`) appears only in error toasts.

Type splits into two registers. **Plus Jakarta Sans** carries anything the user reads as a sentence — the thread title, the status line, the description under the tail card, the primary button. **JetBrains Mono** carries anything the user reads as a measurement — the fold ranges, section labels, tags, counters, footer, toasts. Set a number in the sans face and it stops looking like an instrument.

Horizontal 1px hairlines `{colors.hairline}` (`#26282d`) do all the structural work between bands. There are **no drop shadows inside the popup** — the only shadow in the entire system is the violet glow under the on-page button, which has to float above a page that isn't ours.

**Key characteristics:**
- 360px fixed width; a vertical stack of five bands: header, fold map, trim stepper, sender stats, footer.
- One reserved accent `{colors.violet}` — folded state and primary action only.
- Monospace voice for all numbers, ranges, labels, tags and toasts.
- Hairline-separated surfaces instead of cards-with-shadows.
- Fold rows are the only repeated interactive unit; each holds an index chip, a mono range, a preview line and an Expand button.
- 12px radius on fold rows and the tail card; 9999px only on the state pill, the range track and toasts.

## Colors

### Canvas & Surface
- **Canvas** (`{colors.canvas}` — `#141619`): the popup body. Every band sits on it unless it steps darker.
- **Canvas Deep** (`{colors.canvas-deep}` — `#0f1012`): the page behind the popup in design mockups; not used inside the shipped UI.
- **Surface Row** (`{colors.surface-row}` — `#17191d`): the fold-row fill. One step above the canvas.
- **Surface Raised** (`{colors.surface-raised}` — `#22252b`): the small chips inside a fold row (index badge, "Folded" tag) and the range track.
- **Surface Stepper / Stats** (`#111316` / `#0e0f11`): the two lower bands step *darker* than the canvas, which visually closes the popup the way a footer does.
- **Footer** (`rgba(0,0,0,0.4)`): the deepest band, a translucent black over the canvas.

### Ink
- **Ink** (`{colors.ink}` — `#e4e4e7`): body and titles.
- **Ink Dim** (`{colors.ink-dim}` — `#a1a1aa`): supporting text, mono counters, footer.
- **Ink Faint** (`{colors.ink-faint}` — `#71717a`): preview lines, scale ticks, the "off" state dot.

### Accent
- **Violet** (`{colors.violet}` — `#a855f7`): hover fill of the primary button and focus outlines.
- **Violet Deep** (`{colors.violet-deep}` — `#9333ea`): the rest state of every primary action (Unfold button, toast, on-page button).
- **Violet Light** (`{colors.violet-light}` — `#c084fc`): Expand button label, range thumb, the accent value text.
- **Violet Pale** (`{colors.violet-pale}` — `#d8b4fe`): text on violet-tinted chips (state pill, Visible tag).
- **Violet Wash / Fold / Panel**: the three low-alpha violet fills that tint the state pill, Expand buttons and the tail card without competing with the primary button.

### Semantic
- **Success** (`{colors.success}` — `#34d399`): live-state dots only.
- **Destructive** (`{colors.destructive}` — `#b91c1c`): error toast background only.

## Typography

Two families, two jobs, no overlap.

| Token | Size | Weight | Family | Use |
|---|---|---|---|---|
| `{typography.title}` | 14px | 600 | Plus Jakarta Sans | Thread title |
| `{typography.sub}` | 11px | 400 | Plus Jakarta Sans | Status line under the title |
| `{typography.body}` | 12px | 400 | Plus Jakarta Sans | Tail-card description |
| `{typography.button}` | 12px | 500 | Plus Jakarta Sans | Unfold button, on-page button |
| `{typography.label}` | 10px | 400 | JetBrains Mono | Section labels (uppercase, 0.08em) |
| `{typography.label-value}` | 12px | 600 | JetBrains Mono | Tail Window Size value |
| `{typography.caption}` | 10px | 400 | JetBrains Mono | Counters, tags, footer, toasts, Expand |
| `{typography.tag}` | 9px | 400 | JetBrains Mono | "Folded" tag, slider scale ticks |

### Principles
- **Numbers never touch the sans face.** Fold ranges, WD sizes, percentages, counts — always JetBrains Mono.
- **Labels are uppercase mono with tracking.** Set the section label in sentence case sans and the instrument read collapses.
- **No weight above 600.** Titles are 600; everything else 400–500.
- **Family fallbacks are required.** Both faces are bundled locally (SIL OFL) because extensions cannot fetch webfonts from a CDN.

## Layout

Fixed-width 360px column, five bands, no scrolling containers inside the popup except the fold list.

| Band | Padding | Fill |
|---|---|---|
| Header | 14px 16px | `{colors.canvas}` |
| Fold map | 14px 16px | `{colors.canvas}` |
| Trim stepper | 12px 16px | `{colors.surface-stepper}` |
| Sender stats | 10px 16px | `{colors.surface-stats}` |
| Footer | 10px 16px | `{colors.surface-footer}` |

- **Fold list**: vertical stack, `{spacing.sm}` (8px) gap between rows.
- **Scale ticks**: three labels spread edge to edge under the range, at `{typography.tag}`.
- **Stats row**: dots + mono counters on the left, CSV link pushed to the right edge.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat | Every popup surface |
| Hairline | 1px `{colors.hairline}` | Band separation, fold-row outline |
| Outline + tint | 1px violet edge over a low-alpha violet fill | Tail card, Expand buttons, state pill |
| Glow | `0 6px 18px rgba(147,51,234,0.28)` | On-page button only |

Depth inside the popup is a colour step, not a shadow. The single glow exists because the on-page button floats over a foreign page and must not look glued to it.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | "Folded" tag, "Visible" tag |
| `{rounded.sm}` | 6px | Expand button |
| `{rounded.md}` | 8px | Fold index chip, Unfold button |
| `{rounded.lg}` | 12px | Fold row, tail card |
| `{rounded.pill}` | 9999px | State pill, range track + thumb, toast, on-page button |

Nothing uses 16px or 20px. The scale is deliberately narrow: chips are 4–8px, panels are 12px, and anything the user clicks-and-holds is a full pill.

## Components

**`popup-shell`** — 360px fixed-width dark column. No title bar inside the popup; the header band does that job.

**`header`** — Thread title (sans, 600) with a 6px green live dot inline; below it a status line that switches between "folding" and "off". On the right, `state-pill`.

**`state-pill`** — The on/off control, rendered as a mono status chip rather than an iOS switch. Active: violet wash background, violet-pale text, violet border. Off: transparent, dim text, hairline border.

**`fold-row`** — The core repeated unit. Left: a raised index chip, then a mono range (`Messages 1 — 50`), a "Folded" tag, and a preview of the first folded message on its own line. Right: `fold-expand`.

**`fold-expand`** — Small violet-tinted button labelled "Expand". Expands exactly that fold; the fold map re-renders with the remaining folds.

**`tail-card`** — The violet-tinted panel describing what is still visible: status dot, "Active Tail: last N messages", a "Visible" tag, a one-line explanation, and `button-unfold`.

**`button-unfold`** — Full-width violet primary action. Disabled (45% opacity) when nothing is folded. Label is followed by a mono count `(N messages)`.

**`stepper`** — "Tail Window Size" label, a mono value on the right, a full-width range, and three mono scale ticks.

**`stats-row`** — Two dot + mono counter pairs (You / ChatGPT with percentages) and an "Export CSV" text link at the right edge.

**`toast`** — Pill anchored bottom-centre, violet for success and red for errors, mono 10px.

**`on-page-button`** — The only element injected into ChatGPT itself. Violet pill, mono-adjacent sans label, `Unfold N · M folded`, with the system's single glow.

## Do's and Don'ts

### Do
- Keep violet for folded state and primary action only. Everything else is greyscale.
- Set every number, range, tag and label in JetBrains Mono.
- Separate bands with 1px hairlines and colour steps, not shadows.
- Keep the popup exactly 360px wide and let it grow vertically.
- Give each fold a real preview line — the first folded message — so the map reads like content, not a counter.
- Step the lower bands *darker* than the canvas to close the popup.

### Don't
- Don't introduce a second accent colour; green and red are state indicators, not decoration.
- Don't put a drop shadow on any popup surface.
- Don't use radii outside 4/6/8/12/9999px.
- Don't render numbers or code-like values in Plus Jakarta Sans.
- Don't exceed weight 600.
- Don't turn the fold list into a paginated table — it is a stack of rows.

## Responsive Behavior

A browser popup has exactly one size, so there are no breakpoints. Two constraints follow from that:

- **Width is fixed at 360px.** Long thread titles truncate with an ellipsis at ~220px; fold previews truncate at ~170px.
- **Height is content-driven.** With many folds the popup grows tall; a thread with hundreds of folded messages should stay manageable by keeping `FOLD_SIZE` at 50.

## Known Gaps

- **Scroll behaviour for very long fold lists** is not specified — the current build lets the popup grow.
- **Motion specs** (row hover, thumb drag, toast enter/leave) are not tokenised; they are simple 150–200ms eased transitions.
- **Empty and error surfaces** exist for "no conversation" and "unsupported" but have no illustration treatment.
- **The on-page button** renders in the host page's font stack, not the bundled families, because the extension does not expose the font files to the page.
