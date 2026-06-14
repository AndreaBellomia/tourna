import type { ReactNode } from 'react'
import { Card } from '@repo/ui/card'

type EmptyStateProps = {
  action?: ReactNode
  description: string
  title: string
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card className="border-dashed px-5 py-10 text-center" variant="muted">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  )
}
