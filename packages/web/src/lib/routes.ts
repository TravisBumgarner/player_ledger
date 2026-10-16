export const ROUTES = {
  home: '/',
  combat: '/combat',
  inventory: '/inventory',
  brewing: '/brewing',
  grafting: '/grafting',
  npcs: '/npcs',
  sessionNotes: '/session-notes',
  development: '/character-development',
} as const

/** The sidebar, in order. The label is the only place a section is named. */
export const LEDGER_TABS = [
  { path: ROUTES.sessionNotes, label: 'Session Notes' },
  { path: ROUTES.development, label: 'Character Development' },
  { path: ROUTES.inventory, label: 'Inventory' },
  { path: ROUTES.combat, label: 'Combat' },
  { path: ROUTES.npcs, label: 'NPCs' },
  { path: ROUTES.grafting, label: 'Tree Grafting' },
  { path: ROUTES.brewing, label: 'Potion Brewing' },
] as const

/** Absolute URL for a route, for anything handing a link outside the app. */
export function absoluteUrl(path: string): string {
  return `${window.location.origin}${path}`
}
