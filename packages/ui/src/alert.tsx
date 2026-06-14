import { type ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

export const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm leading-6",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-accent/30 bg-accent/10 text-foreground",
        success: "border-success/30 bg-success/10 text-foreground",
        warning: "border-warning/30 bg-warning/10 text-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants>

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="status" className={cn(alertVariants({ variant, className }))} {...props} />
}

export function AlertTitle({ className, ...props }: ComponentProps<"h5">) {
  return <h5 className={cn("mb-1 font-medium leading-none", className)} {...props} />
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-muted-foreground", className)} {...props} />
}
