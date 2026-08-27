---
name: Geeks FE Boilerplate
description: Domain-agnostic, re-skinnable design system — swap tokens to launch a real project.
colors:
  brand-50: 'oklch(0.97 0.02 250)'
  brand-100: 'oklch(0.93 0.04 250)'
  brand-200: 'oklch(0.87 0.07 250)'
  brand-300: 'oklch(0.79 0.11 250)'
  brand-400: 'oklch(0.7 0.15 250)'
  brand-500: 'oklch(0.62 0.18 250)'
  brand-600: 'oklch(0.54 0.19 250)'
  brand-700: 'oklch(0.46 0.17 250)'
  brand-800: 'oklch(0.39 0.13 250)'
  brand-900: 'oklch(0.32 0.09 250)'
  surface: 'oklch(1 0 0)'
  surface-muted: 'oklch(0.97 0 0)'
  surface-inverted: 'oklch(0.21 0.01 260)'
  foreground: 'oklch(0.21 0.01 260)'
  foreground-muted: 'oklch(0.5 0.01 260)'
  border: 'oklch(0.9 0.005 260)'
  ring: '{colors.brand-500}'
  danger: 'oklch(0.58 0.22 25)'
  success: 'oklch(0.62 0.16 150)'
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 'normal'
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 600
  mono:
    fontFamily: "ui-monospace, 'SF Mono', 'Fira Code', monospace"
rounded:
  xs: '0.125rem'
  sm: '0.25rem'
  md: '0.5rem'
  lg: '0.75rem'
  xl: '1rem'
  full: '9999px'
spacing:
  base: '0.25rem'
components:
  button-primary:
    backgroundColor: '{colors.brand-600}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
    padding: '8px 16px'
  button-primary-hover:
    backgroundColor: '{colors.brand-700}'
  button-secondary:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
---

# Design System: Geeks FE Boilerplate

## Overview

This is a starting point, not a finished brand — every value below is a **neutral
default meant to be overridden**. The only rule that's actually permanent is the
mechanism: every visual value lives in the `@theme` block in `src/index.css`, and
every component reads tokens (`bg-brand-600`, `rounded-md`, `text-sm`) instead of
arbitrary values (`bg-[#1a2b3c]`, `w-[127px]`). Re-skinning a project means editing
`src/index.css` once — never hunting through components.

**Key Characteristics:**

- One brand color ramp (`brand-50`–`brand-900`, currently a neutral blue) plus a
  semantic surface/foreground/border layer that flips for dark mode.
- Flat, borderless-by-default components; depth comes from color contrast, not shadows.
- A single sans-serif stack for everything — no display/body font split.

## Colors

### Primary

- **Brand ramp** (`oklch` 50–900, default `brand-600` ≈ a mid-saturation blue):
  the only accent color. Used for primary actions (`Button` primary variant),
  focus rings (`--color-ring`), and links.

### Neutral

- **Surface** (`oklch(1 0 0)`, white / `oklch(0.21 0.01 260)` in dark mode): page
  and card backgrounds.
- **Surface Muted** (`oklch(0.97 0 0)`): secondary buttons, hover backgrounds,
  disabled fills.
- **Foreground** / **Foreground Muted**: body text and secondary/help text.
- **Border**: dividers, input outlines, card edges — always subtle, never a strong line.
- **Danger** (`oklch(0.58 0.22 25)`, red) / **Success** (`oklch(0.62 0.16 150)`, green):
  status-only, never decorative.

### Named Rules

**The Tokens-Only Rule.** No component or `cva()` variant map may reference a raw
hex/oklch/px value — every value traces back to a `@theme` custom property. This is
lint-enforced (`no-arbitrary-tailwind-values`), not just convention.

## Typography

**Body Font:** ui-sans-serif system stack (`ui-sans-serif, system-ui, -apple-system,
'Segoe UI', Roboto, sans-serif`) — no webfont loaded by default, zero network cost.
**Mono Font:** `ui-monospace, 'SF Mono', 'Fira Code', monospace` — code/OTP inputs only.

**Character:** Plain and utilitarian on purpose; a real project typically swaps the
body font first when re-skinning.

### Hierarchy

- **2xl** (1.5rem): page-level headings (rare — most screens don't need one).
- **xl** (1.25rem): section headings, dialog titles.
- **lg** (1.125rem): card/list-item titles.
- **base** (1rem): body text, form inputs.
- **sm** (0.875rem): labels, button text, secondary text.
- **xs** (0.75rem): helper/error text, badges.

## Layout

Density is compact by default (`--spacing: 0.25rem` base unit, Tailwind's spacing
scale multiplies from there). No fixed max-width container is imposed — layouts
(`AppLayout`, `RoleLayout`, `AuthLayout`) each define their own shell.

## Elevation & Depth

**The Flat-By-Default Rule.** No shadow tokens exist in `@theme`. Depth is conveyed
through the surface/surface-muted contrast and borders, not `box-shadow`. If a
project needs elevation, add shadow tokens to `@theme` rather than hardcoding
`shadow-lg` at call sites.

## Shapes

Radius scale: `xs` (0.125rem, checkboxes/badges) → `sm` (0.25rem) → `md` (0.5rem,
the default for buttons/inputs/cards) → `lg`/`xl` (0.75–1rem, dialogs/large cards)
→ `full` (pills, avatars). No hard corners (`rounded-none`) in any common component.

## Components

### Buttons

- **Shape:** `rounded-md` (0.5rem), no border.
- **Primary:** `bg-brand-600` / white text, `hover:bg-brand-700`.
- **Secondary:** `bg-surface-muted` / foreground text, `hover:bg-border`.
- **Ghost:** transparent, `hover:bg-surface-muted`.
- **Danger:** `bg-danger` / white text, `hover:opacity-90`.
- **Sizes:** `sm` (px-3 py-1, text-sm) / `md` (px-4 py-2, text-base) / `lg` (px-6 py-3, text-lg).

### Inputs / Fields

- **Style:** `border-border`, `rounded-md`, `bg-surface`.
- **Focus:** `outline-ring outline-2 outline-offset-2` (never a shadow glow — matches
  the Flat-By-Default rule and guarantees WCAG focus visibility).
- **Error:** border/text switch to `danger`, message linked via `aria-describedby`.

### Dialogs (Radix `Dialog`)

- **Corner Style:** `rounded-lg`/`rounded-xl`.
- **Background:** `surface`, with a translucent `surface-inverted` overlay behind it.
- **Border:** `border-border`, no shadow (see Elevation & Depth).

### Navigation

- Sidebar/topbar (`RoleLayout`) uses `surface`/`surface-muted` for the active-item
  state, never a shadow or heavy border to indicate selection — background contrast only.

## Do's and Don'ts

### Do:

- **Do** add new tokens to the `@theme` block in `src/index.css` when a project needs
  a color/radius/spacing step that doesn't exist yet — don't invent it at the call site.
- **Do** keep dark mode working by adding both a light and `.dark` value for any new
  semantic color token (see `--color-surface` / `.dark { --color-surface }`).

### Don't:

- **Don't** hardcode a hex, oklch, or arbitrary Tailwind value (`w-[127px]`) anywhere,
  including inside a `cva()` variant map.
- **Don't** add a shadow/elevation system without updating this file — it's a
  deliberate absence, not an oversight.
- **Don't** adopt shadcn's default `--primary`/`--secondary` CSS variables when pulling
  in a new `shadcn add` component — repoint it at these tokens instead.
