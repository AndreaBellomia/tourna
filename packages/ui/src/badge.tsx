import { type ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-border bg-secondary text-secondary-foreground",
        outline: "border-border bg-background/60 text-muted-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        accent: "border-accent/30 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
