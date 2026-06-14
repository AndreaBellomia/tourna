import { type ComponentProps } from "react"
import { cn } from "./utils"

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-border transition-colors hover:bg-muted/30", className)}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-medium uppercase text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-3 align-middle", className)} {...props} />
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}
