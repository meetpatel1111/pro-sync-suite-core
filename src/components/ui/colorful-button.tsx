
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const colorfulButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95 hover:shadow-lg",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl",
        secondary: "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl",
        accent: "bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl",
        warning: "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl",
        success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl",
        info: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl",
        outline: "border-2 border-gradient-to-r from-blue-400 to-purple-400 bg-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-blue-600 hover:text-blue-700",
        ghost: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-blue-600 hover:text-blue-700",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 rounded-xl px-6",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ColorfulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof colorfulButtonVariants> {
  asChild?: boolean
}

const ColorfulButton = React.forwardRef<HTMLButtonElement, ColorfulButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(colorfulButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ColorfulButton.displayName = "ColorfulButton"

export { ColorfulButton, colorfulButtonVariants }
