export const ROUTES = {
  home: '/',
  overview: '/overview',
  spells: '/spells',
  inventory: '/inventory',
  brewing: '/brewing',
  sessionNotes: '/session-notes',
} as const

/** The sidebar, in order. The label is the only place a section is named. */
export const LEDGER_TABS = [
  { path: ROUTES.overview, label: 'Overview' },
  { path: ROUTES.spells, label: 'Custom Spells' },
  { path: ROUTES.inventory, label: 'Inventory' },
  { path: ROUTES.brewing, label: 'Potion Brewing' },
  { path: ROUTES.sessionNotes, label: 'Session Notes' },
] as const

/** Absolute URL for a route, for anything handing a link outside the app. */
export function absoluteUrl(path: string): string {
  return `${window.location.origin}${path}`
}
