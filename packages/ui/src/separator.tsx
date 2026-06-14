import { type ComponentProps } from "react"
import { cn } from "./utils"

type SeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

export function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  )
}
