import type { ReactNode } from 'react'
import { Card } from '@repo/ui/components/card'

type SettingsSectionProps = {
  actions?: ReactNode
  children: ReactNode
  description?: string
  title: string
  tone?: 'default' | 'destructive'
}

export function SettingsSection({
  actions,
  children,
  description,
  title,
  tone = 'default',
}: SettingsSectionProps) {
  return (
    <Card
      className={tone === 'destructive' ? 'border-destructive/30 p-5' : 'p-5'}
     
    >
      <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="pt-4">{children}</div>
    </Card>
  )
}
