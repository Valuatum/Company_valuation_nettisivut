export const CONTENT_ROOT = 'src/content'
export const DRAFT_ROOT = '.editor-data'
export const ACTIVE_PREVIEW_COOKIE = 'valuatum_editor_preview_draft'
export const EDITOR_SESSION_COOKIE = 'valuatum_editor_session'

export const PAGE_DEFINITIONS = [
  { key: 'home', locale: 'fi', label: 'Etusivu', route: '/', fileName: 'home.json' },
] as const
