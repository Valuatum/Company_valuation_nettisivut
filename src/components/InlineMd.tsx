import Link from 'next/link'
import { Fragment } from 'react'

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g

/** Renders `[text](url)` markdown links inline; everything else passes through
 * as plain text. Internal links (#, /) use next/link; external ones use <a>. */
export function InlineMd({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  LINK_RE.lastIndex = 0
  while ((match = LINK_RE.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const [, label, href] = match
    const isInternal = href.startsWith('/') || href.startsWith('#')
    parts.push(
      isInternal ? (
        <Link key={key++} href={href} className="text-green-deep underline underline-offset-2 hover:text-green">
          {label}
        </Link>
      ) : (
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-deep underline underline-offset-2 hover:text-green"
        >
          {label}
        </a>
      )
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))

  return <Fragment>{parts}</Fragment>
}
