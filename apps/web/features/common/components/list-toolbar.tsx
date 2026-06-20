import type { ReactNode } from 'react'
import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'

type ListToolbarProps = {
  activeFilters?: ReactNode
  children: ReactNode
  resetDisabled?: boolean
  resetLabel?: string
  onReset?: () => void
}

export function ListToolbar({
  activeFilters,
  children,
  onReset,
  resetDisabled,
  resetLabel,
}: ListToolbarProps) {
  return (
    <Card className="space-y-3 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">{children}</div>
      {activeFilters || onReset ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">{activeFilters}</div>
          {onReset && resetLabel ? (
            <Button
              disabled={resetDisabled}
              size="sm"
              type="button"
              variant="ghost"
              onClick={onReset}
            >
              {resetLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
