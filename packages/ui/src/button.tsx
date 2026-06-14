import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from './utils'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border border-primary/25 bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-secondary/85',
        outline:
          'border border-border bg-background/70 text-foreground hover:bg-muted hover:text-foreground',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        subtle: 'bg-muted/80 text-foreground hover:bg-muted',
        destructive:
          'border border-destructive/25 bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'h-auto rounded-none px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 rounded-md px-5 text-base',
        icon: 'size-10 p-0',
        'icon-sm': 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}
