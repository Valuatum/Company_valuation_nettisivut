type IconProps = { className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5" />
    </svg>
  )
}

export function HandshakeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M3 8l4-2 5 2 5-2 4 2M3 8v7l4 2M21 8v7l-4 2M7 17l5 2 5-2M12 8v6" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  )
}

export function CalculatorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </svg>
  )
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M12 4v16M5 20h14M12 4l-6 3m6-3 6 3M6 7l-3 6a3.5 3.5 0 0 0 6 0zM18 7l-3 6a3.5 3.5 0 0 0 6 0z" />
    </svg>
  )
}

export function BoardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="16" cy="8" r="2.5" />
      <path d="M3.5 19c.5-3 2.5-4.5 4.5-4.5s4 1.5 4.5 4.5M11.5 19c.5-3 2.5-4.5 4.5-4.5s4 1.5 4.5 4.5" />
    </svg>
  )
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M4 20h16M4 20V4M8 16v-5M13 16V8M18 16v-8" />
    </svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

const useCaseIcons: Record<string, (props: IconProps) => React.ReactNode> = {
  handshake: HandshakeIcon,
  search: SearchIcon,
  calculator: CalculatorIcon,
  scale: ScaleIcon,
  board: BoardIcon,
  chart: ChartIcon,
  document: DocumentIcon,
  mail: MailIcon,
}

export function UseCaseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = useCaseIcons[name] ?? DocumentIcon
  return <Icon className={className} />
}
