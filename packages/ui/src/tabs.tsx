"use client"

import { type ComponentProps } from "react"
import { cn } from "./utils"

export function TabsList({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      className={cn(
        "grid h-10 grid-cols-2 rounded-md border border-border bg-muted/50 p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  active,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[5px] px-3 py-1.5 text-sm font-medium outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-50",
        active ? "bg-card text-foreground shadow-sm" : "hover:bg-card/50 hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}
