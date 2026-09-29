import type { Config } from 'tailwindcss'

/**
 * Amanah design tokens.
 *
 * Primary  #075e46 = brand-600   (buttons, links, active states, focus)
 * Canvas   #e8fff2 = brand-50    (page ground and tint)
 *
 * Ramps are OKLCH-derived at one hue family (161 to 170) with chroma tapered toward
 * white and black. Neutrals (`ink`, `surface`) lean toward that hue so grey never
 * fights the green. Text steps are AA-checked against both white and the canvas:
 * ink-400 4.7:1 (metadata, placeholders), ink-500 6.0:1, ink-700 9.8:1, ink-900 15.7:1.
 *
 * Semantic roles (background, primary, border, ...) are CSS variables in
 * app/assets/css/main.css as space-separated RGB channels, so opacity modifiers
 * work and the exact hex is preserved.
 */
const role = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Inter draws Latin and digits; Arabic glyphs fall through to Noto Sans Arabic, per character.
        sans: ['Inter', '"Latin Fallback"', '"Noto Sans Arabic"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Primary ramp. 600 is the brand color, 50 is the canvas.
        brand: {
          50: '#e8fff2',
          100: '#d7fbe8',
          200: '#bcf1d6',
          300: '#97e0bd',
          400: '#68c79f',
          500: '#2c9874',
          600: '#075e46',
          700: '#004b37',
          800: '#003728',
          900: '#01261b',
          950: '#01160f',
        },
        // Green-tinted neutral for text and quiet fills. Replaces Tailwind slate.
        ink: {
          50: '#f3f8f6',
          100: '#eaf0ed',
          200: '#d9e2de',
          300: '#b5c1bb',
          400: '#61746b',
          500: '#51645b',
          600: '#41554c',
          700: '#31453c',
          800: '#20342b',
          900: '#0f231b',
          950: '#05140e',
        },
        // Raised surfaces and hairlines. `canvas` is the page ground.
        canvas: role('background'),
        surface: {
          0: '#ffffff',
          50: '#f6fdf9',
          100: '#e9f9f0',
          200: '#d3ebde',
          300: '#bdd9ca',
        },
        // Status ramps. Success is the brand green; these carry the rest.
        danger: {
          50: '#fff2f2',
          100: '#ffe3e2',
          200: '#ffc6c3',
          300: '#ff9b95',
          400: '#fa6961',
          500: '#ea3d38',
          600: '#c7181d',
          700: '#a50e15',
          800: '#861213',
          900: '#641210',
          950: '#420a09',
        },
        warning: {
          50: '#fff8de',
          100: '#ffefb7',
          200: '#ffdd85',
          300: '#fcc447',
          400: '#f2ab19',
          500: '#d78c00',
          600: '#b26a00',
          700: '#905100',
          800: '#75410b',
          900: '#5b3310',
          950: '#3a1e08',
        },
        info: {
          50: '#eff8ff',
          100: '#deefff',
          200: '#c4e1ff',
          300: '#9cc8fe',
          400: '#6ca7f5',
          500: '#4385e4',
          600: '#2868c9',
          700: '#2055ac',
          800: '#1d4587',
          900: '#173463',
          950: '#0e2140',
        },
        // shadcn-vue semantic roles (values live in main.css)
        background: role('background'),
        foreground: role('foreground'),
        card: {
          DEFAULT: role('card'),
          foreground: role('card-foreground'),
        },
        popover: {
          DEFAULT: role('popover'),
          foreground: role('popover-foreground'),
        },
        primary: {
          DEFAULT: role('primary'),
          foreground: role('primary-foreground'),
        },
        secondary: {
          DEFAULT: role('secondary'),
          foreground: role('secondary-foreground'),
        },
        muted: {
          DEFAULT: role('muted'),
          foreground: role('muted-foreground'),
        },
        accent: {
          DEFAULT: role('accent'),
          foreground: role('accent-foreground'),
        },
        destructive: {
          DEFAULT: role('destructive'),
          foreground: role('destructive-foreground'),
        },
        border: role('border'),
        input: role('input'),
        ring: role('ring'),
      },
      // Bare `border` / `divide` utilities pick up the hairline color instead of Tailwind's grey.
      borderColor: { DEFAULT: role('border') },
      divideColor: { DEFAULT: role('border') },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      // Shadows are tinted with the deep brand green (brand-900) so depth reads as part of the palette, not grey dirt on the canvas.
      boxShadow: {
        card: '0 1px 2px 0 rgb(1 38 27 / 0.06), 0 1px 3px 0 rgb(1 38 27 / 0.05)',
        'card-hover': '0 8px 20px -6px rgb(1 38 27 / 0.16), 0 2px 4px -2px rgb(1 38 27 / 0.08)',
        dialog: '0 24px 64px -12px rgb(1 38 27 / 0.38), 0 8px 20px -8px rgb(1 38 27 / 0.22)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--reka-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--reka-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
