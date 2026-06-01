import Link from 'next/link'

type MarkdownContentProps = {
  value?: string | null
  emptyLabel?: string
}

type MarkdownBlock =
  | { type: 'heading'; depth: 1 | 2 | 3; text: string; key: string }
  | { type: 'paragraph'; text: string; key: string }
  | { type: 'quote'; text: string; key: string }
  | { type: 'code'; text: string; key: string }
  | { type: 'list'; ordered: boolean; items: string[]; key: string }

export function MarkdownContent({ value, emptyLabel = 'No description yet.' }: MarkdownContentProps) {
  const blocks = parseBlocks(value ?? '')

  if (blocks.length === 0) {
    return <p className="text-sm leading-6 text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <div className="space-y-4 text-sm leading-7 text-foreground">
      {blocks.map((block) => renderBlock(block))}
    </div>
  )
}

function renderBlock(block: MarkdownBlock) {
  if (block.type === 'heading') {
    const className =
      block.depth === 1
        ? 'text-2xl font-semibold'
        : block.depth === 2
          ? 'text-xl font-semibold'
          : 'text-lg font-semibold'

    const content = renderInline(block.text)

    if (block.depth === 1) {
      return (
        <h1 key={block.key} className={className}>
          {content}
        </h1>
      )
    }

    if (block.depth === 2) {
      return (
        <h2 key={block.key} className={className}>
          {content}
        </h2>
      )
    }

    return (
      <h3 key={block.key} className={className}>
        {content}
      </h3>
    )
  }

  if (block.type === 'quote') {
    return (
      <blockquote key={block.key} className="border-l-2 border-accent pl-4 text-muted-foreground">
        {renderInline(block.text)}
      </blockquote>
    )
  }

  if (block.type === 'code') {
    return (
      <pre
        key={block.key}
        className="overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-xs leading-6"
      >
        <code>{block.text}</code>
      </pre>
    )
  }

  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul'

    return (
      <List
        key={block.key}
        className={block.ordered ? 'list-decimal space-y-2 pl-5' : 'list-disc space-y-2 pl-5'}
      >
        {block.items.map((item, index) => (
          <li key={`${block.key}-${index}`}>{renderInline(item)}</li>
        ))}
      </List>
    )
  }

  return <p key={block.key}>{renderInline(block.text)}</p>
}

function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const code: string[] = []
      index += 1

      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        code.push(lines[index] ?? '')
        index += 1
      }

      blocks.push({ type: 'code', text: code.join('\n'), key: `code-${blocks.length}` })
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed)

    if (heading) {
      const marker = heading[1] ?? '#'
      blocks.push({
        type: 'heading',
        depth: marker.length as 1 | 2 | 3,
        text: heading[2] ?? '',
        key: `heading-${blocks.length}`,
      })
      index += 1
      continue
    }

    const quote = /^>\s?(.+)$/.exec(trimmed)

    if (quote) {
      const parts = [quote[1] ?? '']
      index += 1

      while (index < lines.length) {
        const next = /^>\s?(.+)$/.exec((lines[index] ?? '').trim())
        if (!next) break
        parts.push(next[1] ?? '')
        index += 1
      }

      blocks.push({ type: 'quote', text: parts.join(' '), key: `quote-${blocks.length}` })
      continue
    }

    const unordered = /^[-*]\s+(.+)$/.exec(trimmed)
    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed)

    if (unordered || ordered) {
      const isOrdered = Boolean(ordered)
      const items: string[] = []

      while (index < lines.length) {
        const current = (lines[index] ?? '').trim()
        const match = isOrdered ? /^\d+\.\s+(.+)$/.exec(current) : /^[-*]\s+(.+)$/.exec(current)
        if (!match) break
        items.push(match[1] ?? '')
        index += 1
      }

      blocks.push({ type: 'list', ordered: isOrdered, items, key: `list-${blocks.length}` })
      continue
    }

    const paragraph = [trimmed]
    index += 1

    while (index < lines.length && (lines[index] ?? '').trim()) {
      const next = (lines[index] ?? '').trim()
      if (/^(#{1,3})\s+/.test(next) || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next)) break
      paragraph.push(next)
      index += 1
    }

    blocks.push({
      type: 'paragraph',
      text: paragraph.join(' '),
      key: `paragraph-${blocks.length}`,
    })
  }

  return blocks
}

function renderInline(text: string) {
  const nodes = parseInline(text)

  return nodes.map((node, index) => {
    if (typeof node === 'string') return node

    if (node.type === 'code') {
      return (
        <code key={index} className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
          {node.text}
        </code>
      )
    }

    if (node.type === 'strong') {
      return (
        <strong key={index} className="font-semibold">
          {node.text}
        </strong>
      )
    }

    if (node.type === 'emphasis') {
      return <em key={index}>{node.text}</em>
    }

    return (
      <Link
        key={index}
        className="font-medium text-accent underline-offset-4 hover:underline"
        href={node.href}
      >
        {node.text}
      </Link>
    )
  })
}

type InlineNode =
  | string
  | { type: 'code'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'emphasis'; text: string }
  | { type: 'link'; text: string; href: string }

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  const pattern = /(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) nodes.push({ type: 'code', text: match[2] })
    if (match[4]) nodes.push({ type: 'strong', text: match[4] })
    if (match[6]) nodes.push({ type: 'emphasis', text: match[6] })
    if (match[8] && match[9]) nodes.push({ type: 'link', text: match[8], href: safeHref(match[9]) })

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function safeHref(href: string) {
  if (href.startsWith('/') || href.startsWith('https://') || href.startsWith('http://')) {
    return href
  }

  return '#'
}
