/** Ported from the redesign's tokens.json: the single source for colour, type, space and layout. */

export type PaletteName = 'grove' | 'neutral'

export type LedgerPalette = {
  ground: string
  panel: string
  line: string
  line2: string
  text: string
  muted: string
  accent: string
  mention: string
}

export const PALETTES: Record<PaletteName, LedgerPalette> = {
  grove: {
    ground: '#1b1a1d',
    panel: '#222025',
    line: '#34313a',
    line2: '#4a4652',
    text: '#ebe6dd',
    muted: '#a59fa8',
    accent: '#a9bb98',
    mention: '#c3b0d6',
  },
  neutral: {
    ground: '#1a1918',
    panel: '#21201e',
    line: '#353330',
    line2: '#4b4844',
    text: '#ece8e1',
    muted: '#a49f97',
    accent: '#d6c9ad',
    mention: '#d6c9ad',
  },
}

/** Not in tokens.json, which has no destructive colour: a muted ember that passes 4.5:1 on both grounds. */
export const DANGER = '#e0937d'

export const FONTS = {
  display: '"Cinzel", Georgia, serif',
  body: '"Spectral", Georgia, serif',
}

const caps = (size: number, weight: number, letterSpacing: string) => ({
  fontFamily: FONTS.display,
  fontSize: size,
  fontWeight: weight,
  letterSpacing,
  lineHeight: 1.3,
  textTransform: 'uppercase' as const,
})

export const TYPE = {
  capsXs: caps(10, 500, '0.16em'),
  capsSm: caps(12, 500, '0.10em'),
  capsMd: caps(13, 600, '0.18em'),
  caption: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.45 },
  bodySm: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.5 },
  body: { fontFamily: FONTS.body, fontSize: 17, lineHeight: 1.6 },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, fontStyle: 'italic' as const, lineHeight: 1.4 },
  title: {
    fontFamily: FONTS.display,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '0.04em',
    lineHeight: 1.3,
  },
  stat: { fontFamily: FONTS.display, fontSize: 26, fontWeight: 500, lineHeight: 1 },
  h1: {
    fontFamily: FONTS.display,
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: '0.06em',
    lineHeight: 1.2,
  },
}

/** `theme.spacing(n)` is n × 4px; only these steps are used. */
export const SPACING_BASE = 4

export const RADIUS = { badge: 3, control: 4, portraitBottom: 6, portraitTop: 90 }

export const LAYOUT = {
  titleBarHeight: 52,
  trafficLightInset: 92,
  sidebarWidth: 248,
  navRowHeight: 40,
  contentMaxWidth: 820,
  cardPadding: 20,
  rowMinHeight: 44,
  statBox: { w: 64, h: 68 },
  iconButton: 36,
  bracketArm: 14,
  diamond: { nav: 7, slotPip: 10 },
  portrait: { w: 168, h: 196 },
}
