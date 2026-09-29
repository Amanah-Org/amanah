import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

// Focus is drawn once, globally (main.css `:focus-visible`), so no ring utilities here.
// Same recipe as the `.btn-*` classes in main.css. Targets are 44px on phones, 40px from `sm`.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 active:scale-[0.98]",
        destructive: "bg-danger-600 text-white shadow-sm hover:bg-danger-700 active:bg-danger-800 active:scale-[0.98]",
        outline:     "border border-surface-300 bg-white text-ink-700 shadow-sm hover:bg-brand-50 hover:text-ink-900 active:bg-brand-100",
        secondary:   "bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-300 hover:bg-brand-200 active:bg-brand-300",
        ghost:       "text-ink-600 hover:bg-brand-900/[0.07] hover:text-ink-900 active:bg-brand-900/[0.12]",
        link:        "text-brand-600 underline-offset-4 hover:underline hover:text-brand-800",
      },
      size: {
        "default": "h-11 sm:h-10 px-4 py-2",
        "sm":      "h-11 sm:h-8 rounded-lg px-3 text-xs",
        "lg":      "h-12 rounded-2xl px-8 text-base",
        "icon":    "h-11 w-11 sm:h-10 sm:w-10",
        "icon-sm": "size-11 sm:size-8 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
