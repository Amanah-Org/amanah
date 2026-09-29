---
name: Amanah
description: Aid records kept faithfully for the people who collect, coordinate and give.
colors:
  primary: "#075e46"
  primary-hover: "#004b37"
  primary-active: "#003728"
  canvas: "#e8fff2"
  tint: "#d7fbe8"
  tint-edge: "#bcf1d6"
  tint-strong: "#97e0bd"
  pine-ink: "#01261b"
  surface: "#ffffff"
  surface-quiet: "#e9f9f0"
  hairline: "#d3ebde"
  hairline-strong: "#bdd9ca"
  control-edge: "#83988e"
  text-strong: "#0f231b"
  text-body: "#20342b"
  text-secondary: "#51645b"
  text-metadata: "#61746b"
  danger: "#c7181d"
  danger-tint: "#fff2f2"
  danger-text: "#a50e15"
  warning-tint: "#fff8de"
  warning-text: "#905100"
  info-tint: "#eff8ff"
  info-text: "#2055ac"
typography:
  display:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.56
  title:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    fontFeature: "tnum"
  body:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  label-arabic:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.7
    letterSpacing: "0"
  body-arabic:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  body-large-arabic:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  headline-arabic:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0"
  title-arabic:
    fontFamily: "Inter, 'Latin Fallback', 'Noto Sans Arabic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  sm: "0.5rem"
  md: "0.625rem"
  lg: "0.75rem"
  xl: "0.875rem"
  2xl: "1.25rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "1.75rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    height: "44px"
    padding: "0.5rem 1rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.xl}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.xl}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.xl}"
    height: "44px"
    padding: "0.625rem 0.875rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
  badge-green:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.full}"
  nav-item-selected:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.xl}"
---

# Design System: Amanah

## Overview

**Creative North Star: "The Open Ledger" (proposed, not user-confirmed)**

Amanah means a trust held on someone else's behalf. The system looks like a ledger that is kept honestly and left open: a mint page ground, plain white entries raised on it, one deep pine voice for every action, and numbers that line up. Nothing is dressed up. A collector on a phone in bright sun and a coordinator at a desk read the same record in the same plain terms, in Arabic or English.

The color strategy is Committed. Deep pine carries actions, links, selection, focus and the sign-in ground. The mint canvas is the ground behind every screen and white cards sit on it. Neutrals are tinted toward the same green so grey never fights it. Success is the brand green itself; only danger, warning and info get their own hues. Depth is real but quiet: short, green-tinted shadows on white surfaces, no blur, no glass.

Every rule is built for weak hardware and mixed scripts: 44px touch targets on phones, inputs that never trigger iOS zoom, contrast that clears AA on both white and canvas, and layout that reverses cleanly for RTL.

**Key Characteristics:**
- Pine on mint, white raised surfaces, green-tinted greys.
- One focus ring, one selection recipe, one shadow family.
- Arabic and Latin drawn from one font stack, with Arabic-specific size and leading rules.
- Logical (start/end) geometry everywhere; direction is never hard-coded.
- Functional motion only, 150ms, disabled under reduced motion.

## Colors

A single deep-green voice on a pale mint ground, with tinted greys and three restrained status hues.

### Primary
- **Deep Pine** (#075e46, brand-600): buttons, links, selected and active states, focus ring, caret, accent-color, the auth ground, theme-color. Pinned by the user. White on it is 7.78:1; on the canvas it is 7.42:1. Hover is #004b37 (brand-700), active #003728 (brand-800).
- **Pine Ink** (#01261b, brand-900): the tint for shadows (rgb 1 38 27) and for hover/active overlays on ghost and nav items (6-7% hover, 12% active), which works on white and on mint alike.

### Secondary
- **Mint Tint** (#d7fbe8, brand-100) with edges #bcf1d6 (brand-200) and #97e0bd (brand-300): selected nav, tonal secondary button, green badges, selected table rows. Text on it is brand-800 (#003728).

### Neutral
- **Mint Canvas** (#e8fff2, brand-50): page ground behind every screen, also the hover fill on white surfaces (rows, outline buttons). Pinned by the user.
- **Paper White** (#ffffff): cards, dialogs, inputs, sidebar, popovers. Everything raised is white.
- **Quiet Mint** (#e9f9f0, surface-100): disabled input fill, muted fills.
- **Hairline** (#d3ebde, surface-200): card borders, dividers, sidebar edge. Decorative only; never the sole edge of a control.
- **Control Edge** (#83988e): input borders, 3.07:1 on white, meeting the 3:1 control-edge floor.
- **Ink 900** (#0f231b): headings and input text (16.45 on white, 15.68 on canvas). **Ink 800** (#20342b): body. **Ink 700** (#31453c): labels, 10.26 / 9.78. **Ink 500** (#51645b): secondary text, 6.32 / 6.02. **Ink 400** (#61746b): the lightest text step, metadata and placeholders, 4.98 on white / 4.74 on canvas.
- Ink 300 (#b5c1bb) is for scrollbar color only, never text.

### Status
- **Danger** (#c7181d, danger-600): destructive buttons, invalid edge; danger-50 (#fff2f2) fill with danger-700 (#a50e15) text is 7.19:1.
- **Warning**: warning-50 (#fff8de) with warning-700 (#905100), 5.87:1; callouts and pending-invite banner use warning-900 text.
- **Info**: info-50 (#eff8ff) with info-700 (#2055ac), 6.61:1.

### Named Rules
**The Ground-and-Raise Rule.** The canvas is the ground; white is what is raised on it. A raised thing is white with a hairline and a tinted shadow, never a second mint.

**The Lightest-Step Rule.** ink-400 is the lightest permitted text color. Anything paler than #61746b on white or canvas fails AA and does not ship.

**The No-Raw-Color Rule.** App code uses the named ramps (brand, ink, surface, danger, warning, info) or semantic roles. No slate, red, amber, blue or hex literals.

**The Success-Is-Brand Rule.** There is no separate success green. Positive states use brand-100/800.

## Typography

**Display, Body and Label Font:** Inter (Latin and digits) with Noto Sans Arabic (Arabic), then ui-sans-serif, system-ui. One per-glyph stack (fontFamily.sans); weights 400, 500, 600, 700 loaded from Google Fonts.

**Character:** Plain, wide-open and legible. The pairing lets each script draw with its own face inside one line, so mixed Arabic and Latin text (names, phone numbers) reads evenly.

### Hierarchy
- **Display** (700, 2.25rem rising to 3rem from sm, tight leading): landing headline only.
- **Headline** (600, 1.125rem, .section-title): section titles; h1-h6 default to 600 in ink-900 with text-wrap: balance.
- **Title** (700, 1.5rem, tabular numerals): stat values (.stat-value).
- **Body** (400, 0.875rem; 1rem on phones for inputs): default reading and table text, ink-800.
- **Label** (500, 0.875rem for form labels in ink-700; 0.75rem semibold ink-500 for table heads and stat labels): captions and metadata use 0.75rem in ink-500 or ink-400.

### Named Rules
**The Arabic-Scale Rule.** Under html[lang=ar], Arabic is drawn larger: .text-xs 0.8125rem, .text-sm 0.9375rem, .text-base 1.0625rem, .text-lg 1.1875rem, .text-xl 1.3125rem. Body sizes get 1.7 leading, headings 1.4. Letter-spacing is forced to 0 (tracking breaks joins) and uppercase is disabled.

**The Isolated-Value Rule.** User-entered values (phones, addresses, names) are wrapped in bdi (InfoRow's ltr prop) so they keep their order inside RTL text.

**The Column-Number Rule.** Money, counts and dates use tabular numerals in tables and stat values.

**The No-Zoom Rule.** Inputs are 16px (text-base) on phones and 14px from sm.

## Layout

A single content column: max-w-6xl, padded 1rem, 1.5rem from sm, 2rem from lg, with 1.75rem vertical padding. From md a fixed 16rem white sidebar (border on the reading-end edge) sits beside the canvas; below md a 3.5rem white top bar opens a 16rem drawer. Spacing follows the Tailwind 4px scale: 0.75rem inside nav items and small groups, 1.25rem card padding, 1.5rem header-to-content. Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024). Touch targets are 44px on phones (h-11) and drop to 40px (buttons, inputs) or 32px (small buttons) from sm. Icon-only buttons carry padding so they reach 44px.

Direction: only logical utilities (ps/pe, start/end, text-start, border-e, -ms/-me). Sidebar, drawer, dialog close, select items and table heads follow reading direction; drawer slide reverses under rtl; back-arrows rotate 180 in RTL.

## Elevation & Depth

Hybrid: hairline borders plus small tinted shadows on white surfaces over the mint ground. Shadows carry the brand-900 tint so they read as part of the palette. Depth increases only with layering (card, hovered card, dialog), and the modal scrim is solid ink-950 at 50% with no backdrop blur, which is costly on low-end phones.

### Shadow Vocabulary
- **Card** (`0 1px 2px 0 rgb(1 38 27 / 0.06), 0 1px 3px 0 rgb(1 38 27 / 0.05)`): cards, stat cards, selected settings chip.
- **Card hover** (`0 8px 20px -6px rgb(1 38 27 / 0.16), 0 2px 4px -2px rgb(1 38 27 / 0.08)`): interactive cards on hover.
- **Dialog** (`0 24px 64px -12px rgb(1 38 27 / 0.38), 0 8px 20px -8px rgb(1 38 27 / 0.22)`): dialogs, drawer, the sign-in card.

### Named Rules
**The Tinted-Shadow Rule.** Shadows use rgb(1 38 27), never black or grey, with real offset and blur.

**The No-Glass Rule.** No backdrop-blur, no translucent panels. Scrims are solid.

## Shapes

Soft, generous, consistent. Base radius is 0.75rem (--radius). Buttons, inputs, nav items and callouts use 0.875rem (rounded-xl); cards, stat cards, dialogs and the sign-in card use 1.25rem (rounded-2xl); small buttons and icon buttons use 0.75rem; badges and pills are fully round. Borders are 1px hairlines; controls use the stronger control edge. Selected items add a 1px inset ring rather than a heavier border.

## Components

### Buttons
- **Shape:** 0.875rem radius; large buttons 1.25rem; small 0.75rem.
- **Default:** Deep Pine fill, white text, 14px medium, height 44px on phones and 40px from sm, padding 1rem. Hover pine-700, active pine-800 with scale 0.98.
- **Destructive:** danger-600 fill, hover 700, active 800.
- **Outline:** white, ink-700 text, surface-300 border, hover fill mint canvas.
- **Secondary (tonal):** brand-100 fill, brand-800 text, inset ring brand-300.
- **Ghost / Link:** transparent with pine-900 overlay on hover (7%) and active (12%); link is pine text with underline on hover.
- **Disabled:** 50% opacity, no pointer events. Focus is the global ring; components add none.

### Cards / Containers
- **Corner Style:** 1.25rem. **Background:** white, hairline border, card shadow. **Padding:** 1.25rem. Stat card stacks a small label above a 1.5rem bold tabular value.

### Inputs / Fields
- **Style:** white, 0.875rem radius, control-edge border, padding 0.625rem 0.875rem, ink-900 text, ink-400 placeholder. Native select uses the same .input recipe.
- **Focus:** the global 2px pine outline with zero offset and the border turned pine.
- **Error / Disabled:** aria-invalid gives a danger-600 edge, danger-50 at 40% fill, and a danger focus outline; disabled is a surface-100 fill with ink-500 text. Field errors are 0.75rem danger-600 text.

### Navigation
- Sidebar and drawer items are 0.875rem medium, ink-500 with pine-900 6% hover. Selected: brand-100 fill, brand-800 semibold text, inset brand-200 ring, brand-600 icon, aria-current=page. The settings section switcher selects with a white chip, brand-200 ring and card shadow instead.

### Badges and Callouts
- Pill badges (0.75rem medium) pair a 50/100 tint with a 700/800 text and a 200 ring: green, yellow, red, slate, blue. Callouts are rounded-xl with tint fill, 200 border and 800/900 text.

### Language Switcher
- A white 0.75rem pill with a brand-200 ring; the active locale is a Deep Pine chip with white text, others ink-600.

### Sign-in surface
- A solid white 1.25rem card with dialog shadow on a solid Deep Pine ground; the switcher sits at the top end corner.

## Do's and Don'ts

### Do:
- **Do** use only the named ramps and semantic roles; pine (#075e46) for every action, link, selection and focus.
- **Do** keep ink-400 (#61746b) as the lightest text step.
- **Do** raise content as white cards on the mint canvas with a hairline and a brand-900-tinted shadow.
- **Do** mark selection with brand-100 fill, brand-800 semibold text, inset brand-200 ring and an aria-current attribute.
- **Do** use the single global :focus-visible outline and the aria-invalid recipe.
- **Do** keep every interactive element at 44px or more on phones, and inputs at 16px.
- **Do** use logical utilities (ps/pe, start/end, border-e) and rotate directional arrows under rtl.
- **Do** wrap user-entered values in bdi and use tabular numerals for figures.
- **Do** style native selects with .input.
- **Do** keep motion to 150ms color/transform transitions, active scale 0.98 and the 200ms drawer slide.

### Don't:
- **Don't** use raw slate, red, amber, blue or hex colors in app code.
- **Don't** use backdrop-blur or translucent glass; scrims are solid.
- **Don't** add per-component focus rings.
- **Don't** stack tint on tint for selection (a mint chip on a mint ground); selected items use the ring recipe on white or brand-100.
- **Don't** use left/right, ml/mr, text-left or pl/pr.
- **Don't** apply letter-spacing or uppercase to Arabic text.
- **Don't** use grey shadows or black scrims.
- **Don't** add decorative motion.

Not canonized: the landing eyebrow pill above the h1 and the landing sample-stat tiles are pre-existing content, not patterns for new surfaces.
