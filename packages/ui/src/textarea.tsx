'use client'

import { type ComponentProps } from 'react'
import { cn } from './utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-28 w-full resize-y rounded-md border border-input bg-input/30 px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
