import { type ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

export const cardVariants = cva(
  "rounded-lg border text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        panel: "border-border/80 bg-card/80 shadow-[0_16px_44px_rgba(3,7,18,0.18)]",
        interactive:
          "border-border bg-card transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_18px_48px_rgba(3,7,18,0.24)]",
        muted: "border-border/70 bg-muted/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>

export function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-normal", className)} {...props} />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
}
