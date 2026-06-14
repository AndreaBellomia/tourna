import { type ComponentProps } from "react"
import { cn } from "./utils"

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted",
        className,
      )}
      {...props}
    />
  )
}

export function AvatarImage({ className, alt = "", ...props }: ComponentProps<"img">) {
  return <img alt={alt} className={cn("aspect-square size-full object-cover", className)} {...props} />
}

export function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex size-full items-center justify-center bg-secondary text-sm font-semibold text-secondary-foreground",
        className,
      )}
      {...props}
    />
  )
}
