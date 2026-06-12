import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/editor/lib/auth'
import { EditorApp } from '@/editor/EditorApp'

export const metadata = { title: 'Sisällön hallinta | Valuatum' }

export default async function EditorPage() {
  if (!(await isAuthenticated())) redirect('/login')
  return <EditorApp />
}
