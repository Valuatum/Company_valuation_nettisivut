import Link from 'next/link'
import { Fragment } from 'react'

/** Renders `[text](url)` markdown links inline; everything else passes through
 * as plain text. Internal links (#, /) use next/link; external ones use <a>. */
export function InlineMd({ text }: { text: string }) {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = linkRe.exec(text))) {
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
