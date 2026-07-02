// Editor + login are internal tools — never in search results.
export const metadata = { robots: { index: false, follow: false } }

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children
}
