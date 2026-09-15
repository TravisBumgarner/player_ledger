/**
 * Every layer in the app, lowest first: read down the list to see what covers
 * what. Never inline a z-index at a call site, and never write one relative to
 * another (`appBar + 1`) — a rank nobody can find by reading this list is a rank
 * that drifts. A bare `zIndex: 1` lifting a sibling inside one component is not
 * a layer and does not belong here.
 *
 * MUI's tooltip layer is 1500 and sits above everything below, which is why
 * `contextMenu` stops short of it: a menu item's tooltip has to clear the menu
 * it explains.
 */
export const Z_INDEX = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  toast: 1400,
  /** Over everything it can reach: a menu covered by the thing it acts on is a dead end. */
  contextMenu: 1450,
} as const

export const SPACING = {
  page: 3,
  section: 2,
  inline: 1,
} as const

export const MAX_CONTENT_WIDTH = 960

/** A number so a menu can be clamped inside its frame; the theme reads the same constant. */
export const MENU_WIDTH = 250

/**
 * Put on a `Menu` whose contents are shorter than the width above. A class because
 * it is the only handle MUI gives a caller on the paper a menu portals out; the
 * width itself stays in the theme.
 */
export const COMPACT_MENU = 'menu-compact'

/**
 * "Look here": a row something just landed in. Two beats and out — a single fade
 * is the one thing an eye elsewhere on the screen never catches. Carried by
 * `data-flash="true"`, drawn once in the theme, and timed here because whoever
 * sets the attribute has to take it off again.
 */
export const FLASH_MS = 900

export const SIDEBAR_WIDTH = 180
export const LEDGER_CONTENT_WIDTH = 920
