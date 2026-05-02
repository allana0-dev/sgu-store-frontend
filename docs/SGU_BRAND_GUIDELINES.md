# SGU Ecommerce Brand Guidelines (Phase 1)

This project follows a strict SGU brand system. All future UI work must use these standards.

## Brand Foundation

- Brand name: `St. George's University`
- Location line: `Grenada, West Indies`
- Voice: `friendly`, `direct`, `confident`, `community-driven`

## Color Tokens

- Primary: `#1e1e64` (`--sgu-navy`) as dominant UI color.
- Secondary `turquoise`: `#00bec8` (`--sgu-turquoise`)
- Secondary `light turquoise`: `#b2ebee` (`--sgu-light-turquoise`)
- Secondary `orange`: `#ff6400` (`--sgu-orange`)
- Accent: `#b30838` (`--sgu-red`) used sparingly.
- Neutral `gray`: `#393939` (`--sgu-gray`)
- Neutral `light gray`: `#a9a9a9` (`--sgu-light-gray`)

## Typography

- Global font: `Montserrat` only.
- Headings: semibold or bold.
- Body text: regular.
- Buttons: bold.

## Logo Rules

- Use official SGU assets only.
- Active header logo file: `public/logos/sgu-logo-horizontal-color.png`.
- Do not stretch, recolor, rotate, or add effects.
- Preserve clear space (`.logo-safe-area`).

## Layout and Components

- Keep layouts clean and uncluttered.
- Use card-based sections with generous spacing.
- Use `.container-shell` to maintain max-width and alignment.
- Use `.button-primary` for main actions and `.button-accent` for limited emphasis.

## Accessibility Rules

- Maintain high contrast for text and controls.
- Ensure keyboard focus visibility (`:focus-visible`).
- Keep font sizes readable on mobile first.

## Enforcement

- Reuse `src/theme/brand.ts` and `src/theme/theme.ts`.
- Reuse variables in `src/app/globals.css`.
- Do not introduce ad-hoc fonts or random color values in feature components.
