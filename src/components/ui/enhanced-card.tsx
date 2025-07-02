
import * as React from "react"
import { cn } from "@/lib/utils"

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-gradient-to-br from-white via-white/95 to-white/90 text-card-foreground shadow-xl transition-all duration-300",
      "border-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50",
      "backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]",
      "dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-900/90",
      className
    )}
    {...props}
  />
))
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-3 p-8 bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 rounded-t-2xl",
      "dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80",
      className
    )}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

export { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent }
