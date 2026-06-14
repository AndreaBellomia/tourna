'use client'

import { Check, ChevronDown } from 'lucide-react'
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

export type SelectOption = {
  disabled?: boolean
  label: ReactNode
  value: string
}

export type SelectProps = Omit<ComponentProps<'button'>, 'onChange' | 'value'> & {
  name?: string
  onValueChange: (value: string) => void
  options: readonly SelectOption[]
  placeholder?: string
  value?: string
}

export function Select({
  className,
  disabled,
  id,
  name,
  onValueChange,
  options,
  placeholder = 'Select',
  value,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const listboxRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [listboxStyle, setListboxStyle] = useState<CSSProperties>({})
  const selectedOption = options.find((option) => option.value === value)

  const updateListboxPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const gap = 8
    const viewportPadding = 12
    const rect = button.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding
    const openAbove = spaceBelow < 192 && spaceAbove > spaceBelow
    const availableHeight = Math.max(
      144,
      Math.min(256, (openAbove ? spaceAbove : spaceBelow) - gap),
    )

    setListboxStyle({
      left: rect.left,
      maxHeight: availableHeight,
      top: openAbove ? rect.top - gap - availableHeight : rect.bottom + gap,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    if (!open) return

    updateListboxPosition()

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node

      if (!rootRef.current?.contains(target) && !listboxRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    function onWindowChange() {
      updateListboxPosition()
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onWindowChange)
    window.addEventListener('scroll', onWindowChange, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onWindowChange)
      window.removeEventListener('scroll', onWindowChange, true)
    }
  }, [open, updateListboxPosition])

  return (
    <div ref={rootRef} className="relative">
      {name ? <input name={name} type="hidden" value={value ?? ''} /> : null}
      <button
        ref={buttonRef}
        id={selectId}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-input/30 px-3 py-2 text-left text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
          !selectedOption ? 'text-muted-foreground' : null,
          className,
        )}
        disabled={disabled}
        type="button"
        onClick={() => {
          updateListboxPosition()
          setOpen((current) => !current)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        {...props}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open ? 'rotate-180' : null,
          )}
        />
      </button>

      {open && typeof document !== 'undefined' ? createPortal(
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={selectId}
          className="fixed z-[100] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          style={listboxStyle}
        >
          {options.map((option) => {
            const selected = option.value === value

            return (
              <button
                key={option.value}
                role="option"
                aria-selected={selected}
                className={cn(
                  'flex min-h-9 w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50',
                  selected ? 'text-foreground' : 'text-muted-foreground',
                )}
                disabled={option.disabled}
                type="button"
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
              </button>
            )
          })}
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
