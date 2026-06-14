import type { ReactNode } from 'react'
import { Badge, type BadgeProps } from '@repo/ui/badge'

type PageHeaderProps = {
  actions?: ReactNode
  badgeIcon?: ReactNode
  badgeVariant?: BadgeProps['variant']
  description?: string
  eyebrow?: string
  meta?: ReactNode
  title: string
}

export function PageHeader({
  actions,
  badgeIcon,
  badgeVariant = 'secondary',
  description,
  eyebrow,
  meta,
  title,
}: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <Badge variant={badgeVariant} className="mb-3">
              {badgeIcon}
              {eyebrow}
            </Badge>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
    </header>
  )
}
