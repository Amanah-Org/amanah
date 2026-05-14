import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[0.98]",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]",
        outline:     "border border-surface-200 bg-white text-slate-700 shadow-sm hover:bg-surface-50 hover:text-slate-900",
        secondary:   "bg-surface-100 text-slate-700 hover:bg-surface-200 hover:text-slate-900",
        ghost:       "text-slate-600 hover:bg-surface-100 hover:text-slate-900",
        link:        "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        "default": "h-10 px-4 py-2",
        "sm":      "h-8 rounded-lg px-3 text-xs",
        "lg":      "h-11 rounded-2xl px-8 text-base",
        "icon":    "h-10 w-10",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
