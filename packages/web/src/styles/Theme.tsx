import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import type { Shadows, Theme } from '@mui/material/styles'
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles'
import type { CSSProperties, ReactNode } from 'react'
import { COMPACT_MENU, FLASH_MS, MENU_WIDTH, Z_INDEX } from './styleConsts'

/** Restated from MUI because `index.html` must agree with them before any bundle loads. */
export const THEME_ATTRIBUTE = 'data-mui-color-scheme'
export const THEME_MODE_STORAGE_KEY = 'mui-mode'

/**
 * The one family, UI and canvas alike. It replaced IBM Plex Mono — which this
 * app never actually loaded, so every screen was rendering in whatever the
 * platform calls its monospace.
 */
export const WIREFRAME_FONT =
  '"Source Sans 3", system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'

/**
 * The canvas-app sizes this theme came from were set for dense tool chrome. A
 * ledger is read, so everything is scaled from one number rather than retuned
 * site by site.
 */
const TYPE_SCALE = 1.3
const fs = (px: number) => Math.round(px * TYPE_SCALE * 2) / 2

export type WireframeTokens = {
  desk: string
  surface: string
  surfaceAlt: string
  surfaceSunken: string
  surfaceControl: string
  white: string
  stripeLight: string
  stripeDark: string
  borderStrong: string
  border: string
  borderLight: string
  borderFaint: string
  borderFainter: string
  borderDormant: string
  iconBoxBorder: string
  iconBoxFill: string
  ink: string
  inkFilled: string
  textBody: string
  textMuted: string
  textFaint: string
  textGhost: string
  textDashed: string
  /** The one hue, as a mark: urgent numbers, destructive verbs, invalid fields. */
  alert: string
  /**
   * One step further from the ground than `alert` — deeper in light, brighter in
   * dark. What a filled alert hovers to.
   */
  alertStrong: string
  /** The hue at the weight of a surface: a hovered destructive row, a field that failed. */
  alertTint: string
  scrim: string
  /** Lighter than `scrim`: the excluded part of a crop must stay readable under it. */
  cropScrim: string
  captionChip: string
  menuShadow: string
  modalShadow: string
}

/**
 * `_design/WIREFRAME_UI.md`'s token table, both halves, copied verbatim so frames
 * drawn in different sessions do not drift. Greyscale apart from the alert ramp —
 * one hue in three weights, so a warning can be layered on itself rather than
 * borrowing a grey. It lifts in dark rather than inverting because `#8a3c30` is
 * nearly black there.
 */
/**
 * The one exception to the two palettes: a warning band is the same dark red
 * with the same light ink in light and dark alike. Following the theme gave it
 * white ink in one and near-black in the other, which is two warnings to design
 * and no way to say what colour this one is.
 *
 * `raised` is the band's own surface for a control standing on it. A hairline
 * box of band ink was the alternative and it read as a hole cut in the warning;
 * a lighter step of the same red is a chip sitting on it.
 */
const ALERT_BAND = {
  ground: '#8a3c30',
  ink: '#fbfbfa',
  raised: '#a4503f',
  raisedHover: '#b85e4c',
}

export const WIREFRAME_TOKENS: Record<'light' | 'dark', WireframeTokens> = {
  light: {
    desk: '#e8e8e6',
    surface: '#fbfbfa',
    surfaceAlt: '#f7f7f4',
    surfaceSunken: '#f4f4f1',
    surfaceControl: '#f0f0ed',
    white: '#ffffff',
    stripeLight: '#ecece8',
    stripeDark: '#e0e0db',
    borderStrong: '#6e6e68',
    border: '#b4b4ae',
    borderLight: '#cfcfc9',
    borderFaint: '#e4e4e0',
    borderFainter: '#ecece8',
    borderDormant: '#dcdcd6',
    iconBoxBorder: '#9a9a94',
    iconBoxFill: '#e4e4e0',
    ink: '#1c1c1a',
    inkFilled: '#3c3c38',
    textBody: '#46463f',
    textMuted: '#5a5a53',
    textFaint: '#66665f',
    textGhost: '#85857e',
    textDashed: '#8f8f88',
    alert: '#8a3c30',
    alertStrong: '#6d2d23',
    alertTint: '#f2e2de',
    scrim: '#dededbe6',
    cropScrim: '#e8e8e6bf',
    captionChip: '#ffffffd9',
    menuShadow: '0 10px 26px #0000001f',
    modalShadow: '0 16px 40px #00000026',
  },
  dark: {
    desk: '#0d0d0c',
    surface: '#151513',
    surfaceAlt: '#1a1a18',
    surfaceSunken: '#100f0e',
    surfaceControl: '#1e1e1b',
    white: '#191917',
    stripeLight: '#212120',
    stripeDark: '#1a1a19',
    borderStrong: '#8f8a80',
    border: '#4a4842',
    borderLight: '#39382f',
    borderFaint: '#2a2925',
    borderFainter: '#242320',
    borderDormant: '#302f29',
    // Not in the handoff table: sits between `border` and `borderStrong`.
    iconBoxBorder: '#6b675e',
    iconBoxFill: '#2a2925',
    ink: '#eae7df',
    inkFilled: '#ddd8cd',
    textBody: '#d3cdc2',
    textMuted: '#b5afa3',
    textFaint: '#a39d91',
    textGhost: '#857f74',
    textDashed: '#7a746b',
    alert: '#c98168',
    alertStrong: '#e2a08a',
    alertTint: '#3a221c',
    scrim: '#080807e6',
    cropScrim: '#0d0d0cbf',
    captionChip: '#191917d9',
    // Deeper than light's: a dark surface separates from a dark backdrop far less,
    // so these are load-bearing and a 12%-black shadow would not read at all.
    menuShadow: '0 10px 26px #00000080',
    modalShadow: '0 16px 40px #000000a6',
  },
}

declare module '@mui/material/styles' {
  interface Palette {
    wireframe: WireframeTokens
  }
  interface PaletteOptions {
    wireframe: WireframeTokens
  }
  interface TypographyVariants {
    microLabel: CSSProperties
    statusLabel: CSSProperties
    meta: CSSProperties
  }
  interface TypographyVariantsOptions {
    microLabel?: CSSProperties
    statusLabel?: CSSProperties
    meta?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    microLabel: true
    statusLabel: true
    meta: true
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    /** Inside a panel that is already the hairline, so it is drawn by hover alone. */
    quiet: true
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    /** Bordered rather than filled. */
    panel: true
    /** The surface colour, and no border at all. */
    surface: true
    /** The page ground, ruled into cells. */
    desk: true
    /** `1.5px` of the strong border, and nothing else. */
    promoted: true
    /** A panel carrying the padding and rhythm a block of prose needs. */
    section: true
    sunken: true
    /** A quieter card on the alternate surface. */
    subtle: true
    tableHead: true
    strip: true
    /** A strip pinned above a list rather than below it, so its rule falls underneath. */
    listHeader: true
    /** A side panel's ground, running from the close row to the foot in one colour. */
    panelBody: true
    row: true
    /** An empty slot something can be created into. */
    dashed: true
    captionChip: true
    card: true
    toneDot: true
    menu: true
    modal: true
    /** The striped stand-in for an image that does not exist yet. */
    placeholder: true
    /** One step of a wizard's progress bar; `data-done` fills it. */
    stepSegment: true
    /** Dims a whole card so a layer over it reads as the only live thing. */
    scrim: true
    cornerBadge: true
    toggleBox: true
    swatch: true
    /** Greys out everything the crop leaves behind. */
    cropScrim: true
  }
}

/** Every override below reads colour through this; nothing reads a hex directly. */
function wf(theme: Theme): WireframeTokens {
  // `vars` exists only on a CSS-variables theme; the fallback covers a test's plain one.
  const { vars } = theme as Theme & { vars?: { palette: Theme['palette'] } }
  return (vars ?? theme).palette.wireframe
}

/**
 * One spelling for "this is the one that is on". Three had grown up, so a new
 * control had to guess which the theme was listening for.
 */
const ACTIVE = '&.Mui-selected, &[data-selected="true"], &[data-on="true"]'

/**
 * One appearance for an active *button*: the surface flips and the border follows.
 * `aria-pressed` is deliberately not in `ACTIVE` — a toolbar can hold several
 * pressed toggles at once, and five filled buttons is rule 5 broken five times. Do not fold the two together.
 */
function activeButton(theme: Theme) {
  return {
    backgroundColor: wf(theme).inkFilled,
    color: wf(theme).surface,
    borderColor: wf(theme).inkFilled,
  }
}

function paletteFor(scheme: 'light' | 'dark') {
  const w = WIREFRAME_TOKENS[scheme]

  return {
    mode: scheme,
    wireframe: w,
    // The one filled thing on a screen, and it inverts fully.
    primary: { main: w.inkFilled, dark: w.ink, contrastText: w.surface },
    secondary: { main: w.textBody, contrastText: w.surface },
    error: { main: w.alert, contrastText: w.surface },
    // No hue but the alert, so MUI's success/warning/info resolve onto the greyscale
    // ramp rather than smuggling hues in through a `color` nobody read as a choice.
    success: { main: w.inkFilled, contrastText: w.surface },
    warning: { main: w.textBody, contrastText: w.surface },
    info: { main: w.textMuted, contrastText: w.surface },
    background: { default: w.desk, paper: w.surface },
    text: { primary: w.ink, secondary: w.textBody, disabled: w.textGhost },
    divider: w.border,
    action: {
      active: w.textFaint,
      hover: alpha(w.ink, scheme === 'light' ? 0.04 : 0.08),
      selected: alpha(w.ink, scheme === 'light' ? 0.07 : 0.12),
      disabled: w.textGhost,
      disabledBackground: w.surfaceSunken,
    },
  }
}

/** The doc's type scale. The uppercase variants carry their own tracking so no screen picks one. */
const typography = {
  fontFamily: WIREFRAME_FONT,
  h1: { fontSize: fs(24), fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 },
  h2: { fontSize: fs(20), fontWeight: 600, letterSpacing: '-0.012em', lineHeight: 1.2 },
  h3: { fontSize: fs(18), fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 },
  h4: { fontSize: fs(16), fontWeight: 600, lineHeight: 1.25 },
  h5: { fontSize: fs(14), fontWeight: 600, lineHeight: 1.3 },
  h6: { fontSize: fs(13.5), fontWeight: 600, lineHeight: 1.3 },
  subtitle1: { fontSize: fs(13), fontWeight: 500, lineHeight: 1.4 },
  subtitle2: { fontSize: fs(11.5), fontWeight: 600, lineHeight: 1.2 },
  body1: { fontSize: fs(12.5), fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: fs(11.5), fontWeight: 400, lineHeight: 1.45 },
  button: { fontSize: fs(12), fontWeight: 400, letterSpacing: 0, textTransform: 'none' as const },
  caption: { fontSize: fs(10), fontWeight: 400, lineHeight: 1.3 },
  /** The workhorse uppercase label: a section heading, a field label. */
  overline: {
    fontSize: fs(9.5),
    fontWeight: 500,
    letterSpacing: '.15em',
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
  },
  /** The smallest label. */
  microLabel: {
    fontSize: fs(9),
    fontWeight: 600,
    letterSpacing: '.12em',
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
  },
  /** A status pill, a live readout. */
  statusLabel: {
    fontSize: fs(10),
    fontWeight: 600,
    letterSpacing: '.08em',
    lineHeight: 1.2,
    textTransform: 'uppercase' as const,
  },
  /** The quiet second line under a title. */
  meta: { fontSize: fs(9.5), fontWeight: 400, lineHeight: 1.2 },
}

/** Flat, so MUI's `elevation` ladder does nothing; the menu and modal write their own. */
const shadows = Array.from({ length: 25 }, () => 'none') as unknown as Shadows

const theme = createTheme({
  // Defaults to 'media', which makes `setMode` a no-op: the mode would follow the
  // OS and ignore the person's choice.
  cssVariables: { colorSchemeSelector: THEME_ATTRIBUTE },
  colorSchemes: { light: { palette: paletteFor('light') }, dark: { palette: paletteFor('dark') } },
  typography,
  shadows,
  // MUI keeps its own ladder, and `sx={{ zIndex: 'modal' }}` reads that one. Same
  // numbers by construction rather than by coincidence; its tooltip layer stays
  // at MUI's 1500, above everything in ours.
  zIndex: {
    appBar: Z_INDEX.appBar,
    drawer: Z_INDEX.drawer,
    modal: Z_INDEX.modal,
    snackbar: Z_INDEX.toast,
  },
  /** Avatars carry their own `50%`. */
  shape: { borderRadius: 0 },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: { backgroundColor: wf(theme).desk, color: wf(theme).ink },
        // Nothing behind a dialog moves. MUI locks the document, which is the whole
        // story on a page that scrolls; a view that is the viewport's height exactly
        // shifts because the app is scrolled into view.
        'body:has(> .MuiDialog-root) #root': { overflow: 'hidden' },
        // One copy of the striping: a second is a second place its angle can drift.
        ':root': {
          '--wireframe-stripes': `repeating-linear-gradient(135deg, ${wf(theme).stripeLight} 0 7px, ${wf(theme).stripeDark} 7px 14px)`,
          '--wireframe-caption-chip': wf(theme).captionChip,
        },
        '::selection': { backgroundColor: wf(theme).borderLight, color: wf(theme).ink },

        // Anything can say "look here" by carrying the attribute; the beats are
        // written once, here, so a chip and a row in a grid say it identically.
        // An inset ring rather than a border: a highlight that changes an
        // element's box moves whatever is beside it.
        '@keyframes wireframe-flash': {
          '0%, 36%, 56%': {
            backgroundColor: wf(theme).border,
            boxShadow: `inset 0 0 0 1.5px ${wf(theme).borderStrong}`,
          },
          '20%, 100%': {
            backgroundColor: 'transparent',
            boxShadow: 'inset 0 0 0 1.5px transparent',
          },
        },
        '[data-flash="true"]': { animation: `wireframe-flash ${FLASH_MS}ms ease-out` },
        // Somebody who has asked for less motion still has to be told where the
        // thing went: they get the highlight without the beats.
        '@media (prefers-reduced-motion: reduce)': {
          '[data-flash="true"]': {
            animation: 'none',
            backgroundColor: wf(theme).border,
            boxShadow: `inset 0 0 0 1.5px ${wf(theme).borderStrong}`,
          },
        },
      }),
    },

    // A ripple is a fill that grows, the opposite of a language built on borders.
    MuiButtonBase: { defaultProps: { disableRipple: true } },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          // Doubled specificity, so it survives a variant that sets `border` wholesale.
          '&&[data-edge="bottom"]': { borderBottom: `1px solid ${wf(theme).borderLight}` },
          '&&[data-edge="right"]': { borderRight: `1px solid ${wf(theme).borderLight}` },
          '&&[data-edge="left"]': { borderLeft: `1px solid ${wf(theme).borderLight}` },
          '&&[data-edge="top"]': { borderTop: `1px solid ${wf(theme).borderLight}` },
          // Two Papers reading as one frame: the seam is opened, not doubled.
          '&&[data-join="below"]': { borderBottomWidth: 0 },
          '&&[data-join="above"]': { borderTopWidth: 0 },
          '&&[data-join="both"]': { borderTopWidth: 0, borderBottomWidth: 0 },
          '&&[data-failed="true"]': { borderColor: wf(theme).alert },
          '&&[data-edge="right-strong"]': { borderRight: `1.5px solid ${wf(theme).borderStrong}` },
        }),
      },
      variants: [
        {
          props: { variant: 'elevation' },
          style: ({ theme }) => ({ backgroundColor: wf(theme).surface }),
        },
        {
          props: { variant: 'outlined' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surface,
            border: `1px solid ${wf(theme).border}`,
          }),
        },
        {
          props: { variant: 'desk' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).desk,
            border: 'none',
          }),
        },
        {
          props: { variant: 'surface' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surface,
            border: 'none',
          }),
        },
        {
          props: { variant: 'panel' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surface,
            border: `1px solid ${wf(theme).border}`,
            // Border weight says whether the thing it reports on is happening.
            '&[data-live="true"]': {
              borderColor: wf(theme).borderStrong,
              backgroundColor: wf(theme).surfaceControl,
            },
            '&[data-live="false"]': {
              borderColor: wf(theme).borderLight,
              backgroundColor: 'transparent',
            },
            // Filled, not outlined: this sits over artwork, and the palette's one
            // hue spent on a hairline and some small type is the quietest thing
            // on a busy canvas — which is the opposite of what a warning is for.
            '&[data-alert="true"]': {
              backgroundColor: ALERT_BAND.ground,
              borderColor: ALERT_BAND.ground,
              color: ALERT_BAND.ink,
              // The band stays one hue and gains a weight instead: a control on
              // it is a lighter step of the same red, which reads as a chip
              // standing on the warning. Outlining it in band ink instead read
              // as a hole cut out of one.
              '& .MuiButton-root': {
                backgroundColor: ALERT_BAND.raised,
                borderColor: ALERT_BAND.raised,
                color: ALERT_BAND.ink,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: ALERT_BAND.raisedHover,
                  borderColor: ALERT_BAND.raisedHover,
                  color: ALERT_BAND.ink,
                },
              },
            },
          }),
        },
        {
          props: { variant: 'section' },
          // The padding is the variant: a section is read, not fitted around a control,
          // so every one of them wants the same measure and the same internal rhythm.
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surface,
            border: `1px solid ${wf(theme).border}`,
            padding: 18,
            display: 'grid',
            gap: 10,
            alignContent: 'start',
          }),
        },
        {
          props: { variant: 'subtle' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceAlt,
            border: `1px solid ${wf(theme).borderLight}`,
            transition: 'border-color 80ms ease-out',
            '&:hover, &:focus-visible, &:focus-within': { borderColor: wf(theme).iconBoxBorder },
          }),
        },
        {
          props: { variant: 'dashed' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceSunken,
            border: `1.5px dashed ${wf(theme).textDashed}`,
            transition: 'border-color 80ms ease-out, background-color 80ms ease-out',
            // A drag is neither hover nor focus, so the drop target says so outright.
            '&:hover, &:focus-visible, &:focus-within, &[data-active="true"]': {
              borderColor: wf(theme).inkFilled,
              backgroundColor: wf(theme).surfaceControl,
            },
          }),
        },
        {
          props: { variant: 'captionChip' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).captionChip,
            color: wf(theme).textBody,
            // A caption floating over an image is an annotation, not a surface.
            border: 'none',
          }),
        },
        {
          props: { variant: 'promoted' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).white,
            border: `1.5px solid ${wf(theme).borderStrong}`,
          }),
        },
        {
          props: { variant: 'strip' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceAlt,
            border: 'none',
            borderTop: `1px solid ${wf(theme).borderLight}`,
            // A heading band rather than a rule between two lists. `surfaceAlt`
            // against `surface` is a few points of grey and reads as nothing.
            '&&[data-strong="true"]': {
              backgroundColor: wf(theme).surfaceControl,
              borderTop: 'none',
            },
          }),
        },
        {
          props: { variant: 'listHeader' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceAlt,
            border: 'none',
          }),
        },
        {
          props: { variant: 'panelBody' },
          // The same ground a header paints, so a panel is one surface from the
          // close row down. A header that brought its own drew a line under the
          // close button that nobody had asked for and nothing could remove.
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceAlt,
            border: 'none',
          }),
        },
        {
          props: { variant: 'tableHead' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceSunken,
            border: 'none',
          }),
        },
        {
          props: { variant: 'row' },
          style: ({ theme }) => ({
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${wf(theme).borderFainter}`,
            transition: 'background-color 80ms ease-out',
            '&:hover': { backgroundColor: wf(theme).surfaceAlt },
            // The row the list is currently on — whose turn it is, in a tracker.
            '&[data-active="true"]': {
              backgroundColor: wf(theme).surfaceControl,
              boxShadow: `inset 2px 0 0 ${wf(theme).inkFilled}`,
            },
          }),
        },
        {
          props: { variant: 'sunken' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceSunken,
            border: `1px solid ${wf(theme).borderLight}`,
          }),
        },
        {
          props: { variant: 'card' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).white,
            border: `1px solid ${wf(theme).border}`,
            // The heading of the page under it rather than one card among many.
            // `&&` so a panel that clears every border inside itself does not
            // clear the one rule saying where the page starts.
            '&&[data-strong="true"]': {
              backgroundColor: wf(theme).surfaceControl,
              borderColor: wf(theme).borderStrong,
              borderWidth: '1.5px',
            },
            transition: 'border-color 80ms ease-out',
            '&:hover, &:focus-visible, &:focus-within': { borderColor: wf(theme).borderStrong },
            // The one a detail panel is currently showing. Weight, drawn inward, so
            // nothing in the grid moves.
            '&&[data-selected="true"]': {
              borderColor: wf(theme).borderStrong,
              boxShadow: `inset 0 0 0 1px ${wf(theme).borderStrong}`,
            },
          }),
        },
        {
          props: { variant: 'toneDot' },
          style: ({ theme }) => ({
            borderRadius: '50%',
            border: 'none',
            backgroundColor: wf(theme).borderLight,
            '&[data-tone="live"]': { backgroundColor: wf(theme).inkFilled },
            '&[data-tone="prep"]': { backgroundColor: wf(theme).textFaint },
            '&[data-tone="idle"]': { backgroundColor: wf(theme).borderLight },
            '&[data-tone="empty"]': { backgroundColor: wf(theme).borderFaint },
          }),
        },
        {
          props: { variant: 'modal' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).white,
            border: `1.5px solid ${wf(theme).borderStrong}`,
            boxShadow: wf(theme).modalShadow,
          }),
        },
        {
          props: { variant: 'menu' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).white,
            border: `1px solid ${wf(theme).borderStrong}`,
            boxShadow: wf(theme).menuShadow,
          }),
        },
        {
          props: { variant: 'placeholder' },
          style: { backgroundImage: 'var(--wireframe-stripes)', border: 'none' },
        },
        {
          props: { variant: 'stepSegment' },
          style: ({ theme }) => ({
            border: 'none',
            backgroundColor: wf(theme).borderFaint,
            '&[data-done="true"]': { backgroundColor: wf(theme).inkFilled },
          }),
        },
        {
          props: { variant: 'scrim' },
          style: ({ theme }) => ({ border: 'none', backgroundColor: wf(theme).scrim }),
        },
        {
          props: { variant: 'cornerBadge' },
          style: ({ theme }) => ({
            fontSize: fs(8),
            lineHeight: 1.3,
            padding: '1px 3px',
            border: 'none',
            backgroundColor: wf(theme).captionChip,
            color: wf(theme).textBody,
            // Only the two edges facing the picture; the other two are the thumbnail's.
            '&[data-corner="bottom-left"]': {
              borderTop: `1px solid ${wf(theme).borderFainter}`,
              borderRight: `1px solid ${wf(theme).borderFainter}`,
            },
            '&[data-corner="top-right"]': {
              letterSpacing: '.06em',
              borderLeft: '1px solid',
              borderBottom: '1px solid',
              borderColor: wf(theme).borderLight,
            },
            /** Picked up: the same filled treatment, said about a thing rather than a role. */
            '&[data-tone="marked"]': {
              backgroundColor: wf(theme).inkFilled,
              color: wf(theme).surface,
              borderColor: wf(theme).inkFilled,
            },
            '&[data-tone="archived"]': {
              backgroundColor: wf(theme).captionChip,
              color: wf(theme).textFaint,
              borderColor: wf(theme).borderLight,
            },
          }),
        },
        {
          props: { variant: 'toggleBox' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).white,
            border: `1px solid ${wf(theme).borderLight}`,
            transition: 'border-color 80ms ease-out, background-color 80ms ease-out',
            // Takes weight rather than a fill, which would swallow the tick.
            [ACTIVE]: {
              borderColor: wf(theme).borderStrong,
              backgroundColor: wf(theme).surfaceControl,
            },
          }),
        },
        {
          props: { variant: 'swatch' },
          style: ({ theme }) => ({
            border: `1px solid ${wf(theme).borderLight}`,
            // Weight, not a ring or a fill: either would cover the colour the swatch
            // exists to show.
            [ACTIVE]: { border: `2px solid ${wf(theme).inkFilled}` },
          }),
        },
        {
          props: { variant: 'cropScrim' },
          style: ({ theme }) => ({
            border: 'none',
            backgroundColor: wf(theme).cropScrim,
          }),
        },
      ],
    },

    // Colour travels with the variant rather than being restated at every call site.
    MuiTypography: {
      styleOverrides: {
        root: ({ theme }) => ({
          // A goal ticked off, gear used up: still readable, no longer asking for attention.
          '&[data-done="true"]': { color: wf(theme).textFaint, textDecoration: 'line-through' },
          // "No goals yet.": the one place prose is italic, so an absence never reads as content.
          '&[data-empty="true"]': { color: wf(theme).textMuted, fontStyle: 'italic' },
        }),
      },
      variants: [
        {
          props: { variant: 'overline' },
          style: ({ theme }) => ({ color: wf(theme).textFaint }),
        },
        {
          props: { variant: 'microLabel' },
          style: ({ theme }) => ({ color: wf(theme).textFaint }),
        },
        { props: { variant: 'statusLabel' }, style: ({ theme }) => ({ color: wf(theme).ink }) },
        { props: { variant: 'meta' }, style: ({ theme }) => ({ color: wf(theme).textFaint }) },
        { props: { variant: 'caption' }, style: ({ theme }) => ({ color: wf(theme).textMuted }) },
      ],
    },

    // Chrome, not content: the bar gives the page as little of the window as it can.
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingLeft: 10,
          paddingRight: 10,
          '@media (min-width: 600px)': { minHeight: 40, paddingLeft: 12, paddingRight: 12 },
        },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: wf(theme).desk,
          color: wf(theme).ink,
          borderBottom: `1px solid ${wf(theme).border}`,
          backgroundImage: 'none',
        }),
      },
    },

    MuiButton: {
      // Outlined is what a button is here; `contained` is the one filled thing.
      defaultProps: { variant: 'outlined', disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          minWidth: 0,
          lineHeight: 1.2,
          // `aria-disabled` and not MUI's `disabled`, for the same reason a menu item
          // uses it: an unusable action still has to raise its own tooltip.
          '&&[aria-disabled="true"]': {
            cursor: 'not-allowed',
            color: wf(theme).textGhost,
            borderColor: wf(theme).borderLight,
            '&:hover': { backgroundColor: 'transparent', borderColor: wf(theme).borderLight },
          },
          '&&[data-destructive="true"]': {
            color: wf(theme).alert,
            // The hue answers for its own hover: a destructive verb that greys
            // like every other one loses the only thing marking it out at the
            // moment the pointer is on it.
            '&:hover': { backgroundColor: wf(theme).alertTint, color: wf(theme).alertStrong },
          },
          '&&[aria-disabled="true"][data-destructive="true"]': {
            color: wf(theme).alert,
            opacity: 0.62,
          },
        }),
        sizeSmall: { padding: '5px 11px', fontSize: fs(11) },
        sizeMedium: { padding: '8px 16px' },
        sizeLarge: { padding: '10px 20px' },
      },
      variants: [
        {
          props: { variant: 'outlined' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).surfaceControl,
            border: `1px solid ${wf(theme).iconBoxBorder}`,
            color: wf(theme).ink,
            // Colour, never `border`: the shorthand re-states a width, and a state
            // that can set a width is a state that can move what sits beside it.
            '&:hover': {
              backgroundColor: wf(theme).surfaceSunken,
              borderColor: wf(theme).borderStrong,
            },
            // An outlined button holding a choice is promoted rather than
            // filled — a second filled button on a screen is rule 5's whole
            // concern. Border colour and type weight together, because a
            // browser floors a 1.5px border to 1px and the border alone moves
            // too little to notice.
            '&[aria-pressed="true"]': {
              border: `1.5px solid ${wf(theme).borderStrong}`,
              fontWeight: 600,
            },
            '&.Mui-disabled': {
              border: `1px solid ${wf(theme).borderLight}`,
              color: wf(theme).textGhost,
            },
          }),
        },
        {
          props: { variant: 'contained' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).inkFilled,
            border: `1.5px solid ${wf(theme).inkFilled}`,
            color: wf(theme).surface,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            '&:hover': { backgroundColor: wf(theme).ink, borderColor: wf(theme).ink },
            // Drops to the outlined disabled look: a pale fill with pale ink was
            // unreadable in dark, where the two land a shade apart.
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              borderColor: wf(theme).borderLight,
              color: wf(theme).textGhost,
            },
          }),
        },
        {
          // Rule 5's third option: a text link with a hairline underline.
          props: { variant: 'text' },
          style: ({ theme }) => ({
            color: wf(theme).textBody,

            padding: '5px 3px',
            '&:hover': {
              backgroundColor: 'transparent',
              color: wf(theme).ink,
              borderBottomColor: wf(theme).borderStrong,
            },
          }),
        },
        {
          props: { variant: 'quiet' },
          style: ({ theme }) => ({
            border: 'none',
            backgroundColor: 'transparent',
            color: wf(theme).textBody,
            minWidth: 0,
            // Hover is the fainter of the two greys and pressed is the stronger,
            // which is the way round it has to be: they were reversed, and an
            // underline was doing the work of telling them apart.
            '&:hover': { backgroundColor: wf(theme).surfaceAlt, color: wf(theme).ink },
            // The same fill a section title carries in the side panel, so "this
            // is the one in hand" is one colour across the app rather than a
            // rule here and a band there.
            '&[aria-pressed="true"]': {
              backgroundColor: wf(theme).surfaceControl,
              color: wf(theme).ink,
            },
            '&.Mui-disabled': { color: wf(theme).textGhost },
          }),
        },
        {
          props: { color: 'error', variant: 'contained' },
          style: ({ theme }) => ({
            backgroundColor: wf(theme).alert,
            borderColor: wf(theme).alert,
            color: wf(theme).surface,
            // A step of the hue rather than a grey border thrown round it: the
            // button was answering a hover by drawing a different outline, which
            // on the one control in the language that is already filled reads as
            // nothing happening.
            '&:hover': {
              backgroundColor: wf(theme).alertStrong,
              borderColor: wf(theme).alertStrong,
            },
          }),
        },
        {
          props: { color: 'error', variant: 'outlined' },
          style: ({ theme }) => ({
            color: wf(theme).alert,
            borderColor: wf(theme).alert,
            '&:hover': {
              backgroundColor: wf(theme).alertTint,
              borderColor: wf(theme).alertStrong,
              color: wf(theme).alertStrong,
            },
          }),
        },
        {
          props: { color: 'error', variant: 'text' },
          style: ({ theme }) => ({
            color: wf(theme).alert,
            '&:hover': { backgroundColor: wf(theme).alertTint, color: wf(theme).alertStrong },
          }),
        },
      ],
    },

    // A split button: the tool and its caret. The group carries the active look so
    // the fill is one block under both, rather than each half drawing its own.
    MuiButtonGroup: {
      defaultProps: { variant: 'text' },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          // The caret belongs to the word beside it, so MUI's own divider goes:
          // a rule between them would make one cell read as two buttons. Doubled
          // to outweigh the variant rule that puts it there.
          // MUI rules off the halves of a text-variant group, on the right when
          // it is a row and along the bottom when it is a column. Both are the
          // library's divider and neither is ours: the caret belongs to the word
          // beside it, and a line under an unarmed tool was reading as the mark
          // that says which tool is armed.
          '&& .MuiButtonGroup-firstButton, && .MuiButtonGroup-middleButton': {
            borderRight: 'none',
            borderBottom: 'none',
          },
          [ACTIVE]: {
            backgroundColor: wf(theme).surfaceControl,
            // Filled once across the cell rather than by each half of it.
            '& .MuiButtonGroup-grouped': { backgroundColor: 'transparent' },
          },
        }),
        grouped: { borderRadius: 0, minWidth: 0 },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          color: wf(theme).textFaint,
          '&:hover, &:focus-visible': {
            backgroundColor: 'transparent',
            color: wf(theme).ink,
          },
          // A toggle that is on (a pinned star) is ink at rest, not only on hover.
          '&[aria-pressed="true"]': { color: wf(theme).ink },
          // A latching icon button wears the segmented control's pressed state, so a
          // rail of them reads as one control.
          [ACTIVE]: {
            ...activeButton(theme),
            '&:hover, &:focus-visible': activeButton(theme),
          },
        }),
      },
    },

    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${wf(theme).borderLight}`,
          backgroundColor: wf(theme).surfaceSunken,
          borderRadius: 0,
          display: 'flex',
        }),
        // Filling is asked for, not assumed: a switch in a panel is read by which
        // half is filled, and equal halves are what make that comparison work. A
        // group in a toolbar is one control among several on the same row, and
        // stretching it pushes the rest off the end.
        fullWidth: { width: '100%' },
        grouped: { borderRadius: 0, margin: 0 },
        groupedHorizontal: {
          '.MuiToggleButtonGroup-fullWidth &': { flex: 1, minWidth: 0 },
        },
      },
    },

    // Rule 8: a bordered row, the active segment filled, a hairline between.
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Reserved rather than grown, as the quiet button's underline is: the
          // hairline between segments and the fill of a picked one colour this in.
          // A segment that gained an edge on hover would shove the row it is in,
          // and it would be a pixel wider than the segment beside it.
          border: '1px solid transparent',
          borderRadius: 0,
          padding: '5px 11px',
          fontSize: fs(10.5),
          lineHeight: 1.2,
          // Text sizes by line-height and an icon by its 20px box, so a row
          // mixing them steps up and down. One height for both.
          minHeight: 26,
          boxSizing: 'border-box',
          // One line, always: a segment is a label, and a two-line one makes the
          // row it sits in taller than the segment beside it.
          whiteSpace: 'nowrap',
          textTransform: 'none',
          color: wf(theme).textBody,
          transition: 'background-color 80ms ease-out, color 80ms ease-out',
          '& + &': { borderLeftColor: wf(theme).borderLight },
          '&:hover': { backgroundColor: wf(theme).surfaceControl },
          [ACTIVE]: {
            ...activeButton(theme),
            '&:hover': activeButton(theme),
          },
          // The labels stay sentences in the markup and are shouted here.
          '&[data-emphasis="strong"]': {
            ...theme.typography.statusLabel,
            fontSize: fs(11),
          },
        }),
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          backgroundColor: wf(theme).white,
          fontSize: fs(12),
        }),
        input: ({ theme }) => ({
          '&::placeholder': { color: wf(theme).textGhost, opacity: 1 },
        }),
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          // The notch mirrors the label at its own font size, so the uppercasing and
          // tracking must be repeated here or the gap is measured for other words.
          '& legend': { letterSpacing: '.06em', textTransform: 'uppercase' },
          '& .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: wf(theme).border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: wf(theme).borderStrong },
          // The active input is promoted by weight, not by a hue.
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
            borderColor: wf(theme).borderStrong,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: wf(theme).alert },
          // The required field is the one with the heavier edge, not a red asterisk.
          '&:has(input:required, textarea:required) .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
            borderColor: wf(theme).inkFilled,
          },
        }),
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: fs(12),
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: wf(theme).textFaint,
          '&.Mui-focused': { color: wf(theme).textBody },
          '&.Mui-error': { color: wf(theme).alert },
          '& .MuiFormLabel-asterisk': { display: 'none' },
        }),
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.meta,
          marginLeft: 0,
          color: wf(theme).textMuted,
          '&.Mui-error': { color: wf(theme).alert },
        }),
      },
    },

    MuiSelect: {
      styleOverrides: { icon: ({ theme }) => ({ color: wf(theme).textFaint }) },
    },

    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: wf(theme).white,
          border: `1px solid ${wf(theme).borderStrong}`,
          borderRadius: 0,
          boxShadow: wf(theme).menuShadow,
        }),
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          // Wide enough for the long verbs a context menu carries.
          minWidth: MENU_WIDTH,
          // And not, where the menu is two words hanging off a small control. Keyed
          // off a class on the menu itself, the one thing MUI lets a caller put there.
          [`.${COMPACT_MENU} &`]: { minWidth: 0 },
          backgroundColor: wf(theme).white,
          border: `1px solid ${wf(theme).borderStrong}`,
          borderRadius: 0,
          boxShadow: wf(theme).menuShadow,
        }),
        list: { padding: 5 },
      },
    },

    // The two shapes a menu item takes are named at the call site and drawn here.
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          padding: '7px 10px',
          fontSize: fs(11.5),
          lineHeight: 1.2,
          minHeight: 0,
          // Wrapping, not MUI's `nowrap`: the menus here hold a fixed width, and
          // a clipped verb has stopped saying the thing an item exists to say.
          whiteSpace: 'normal',
          color: wf(theme).ink,
          '&:hover, &:focus-visible, &.Mui-focusVisible': {
            backgroundColor: wf(theme).surfaceControl,
          },
          '&[data-destructive="true"]': {
            color: wf(theme).alert,
            '&:hover, &:focus-visible, &.Mui-focusVisible': {
              backgroundColor: wf(theme).alertTint,
              color: wf(theme).alertStrong,
            },
          },
          // `aria-disabled` and not MUI's `disabled`: the item still has to raise its
          // own tooltip saying why it is unusable.
          '&[aria-disabled="true"]': {
            cursor: 'not-allowed',
            color: wf(theme).textGhost,
            '&:hover, &:focus-visible': { backgroundColor: 'transparent' },
          },
          '&[aria-disabled="true"][data-destructive="true"]': {
            color: wf(theme).alert,
            opacity: 0.62,
          },
          '&[data-group-start="true"]': {
            marginTop: 3,
            borderTop: `1px solid ${wf(theme).borderFainter}`,
          },
        }),
      },
    },

    MuiList: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingTop: 0,
          paddingBottom: 0,
          // A list of statements rather than of controls: no hover, no hit area, and
          // a dash for the marker, because a filled disc is the one round thing here.
          '&[data-variant="bullets"]': {
            display: 'grid',
            gap: 4,
            '& > li': {
              ...theme.typography.body2,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 8,
              padding: 0,
              color: wf(theme).textBody,
            },
            '& > li::before': { content: '"\u2013"', color: wf(theme).textFaint },
          },
        }),
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          '&:hover': { backgroundColor: wf(theme).surfaceAlt },
          '&.Mui-selected': {
            backgroundColor: wf(theme).surfaceControl,
            '&:hover': { backgroundColor: wf(theme).surfaceControl },
          },
        }),
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: fs(12) },
        secondary: ({ theme }) => ({ ...theme.typography.meta, color: wf(theme).textMuted }),
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.microLabel,
          backgroundColor: 'transparent',
          color: wf(theme).textFaint,
          lineHeight: 2.4,
          // The same rule a menu item draws, for a heading that opens the group instead.
          '&[data-group-start="true"]': {
            marginTop: 3,
            borderTop: `1px solid ${wf(theme).borderFainter}`,
          },
        }),
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: ({ theme }) => ({ backgroundColor: wf(theme).scrim }),
        invisible: { backgroundColor: 'transparent' },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: wf(theme).white,
          border: `1.5px solid ${wf(theme).borderStrong}`,
          borderRadius: 0,
          boxShadow: wf(theme).modalShadow,
        }),
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.overline,
          color: wf(theme).textFaint,
          padding: '13px 18px',
          borderBottom: `1px solid ${wf(theme).borderFainter}`,
          // A headline under the eyebrow is the sentence, not more label: the
          // strip's small caps and tracking must not follow it down.
          '& .MuiTypography-h4': {
            marginTop: 3,
            color: wf(theme).ink,
            letterSpacing: 'normal',
            textTransform: 'none',
          },
        }),
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 18,
          // MUI zeroes this where a title is a heading the body reads on from.
          // Ours is a strip with a rule under it, and a sentence starting on that
          // rule is why every modal in the app looked squashed against its own top.
          '.MuiDialogTitle-root + &': { paddingTop: 18 },
        },
      },
    },

    MuiDialogContentText: {
      styleOverrides: { root: ({ theme }) => ({ color: wf(theme).textBody, fontSize: fs(12) }) },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: '12px 18px',
          gap: 10,
          borderTop: `1px solid ${wf(theme).borderFainter}`,
        }),
      },
    },

    MuiChip: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.microLabel,
          borderRadius: 0,
          height: 'auto',
          padding: '2px 0',
          border: `1px solid ${wf(theme).borderLight}`,
          backgroundColor: 'transparent',
          color: wf(theme).textFaint,
          // Content the player typed ("Lvl 2 · Evocation") keeps its casing; labels do not.
          '&[data-casing="as-written"]': { textTransform: 'none', letterSpacing: 0 },
          // Contrast tracks liveness, so a grid of them sorts itself before it is read.
          '&[data-tone="live"]': {
            backgroundColor: wf(theme).inkFilled,
            borderColor: wf(theme).inkFilled,
            color: wf(theme).surface,
          },
          '&[data-tone="prep"]': {
            backgroundColor: wf(theme).captionChip,
            borderColor: wf(theme).borderStrong,
            color: wf(theme).inkFilled,
          },
          '&[data-tone="idle"]': {
            backgroundColor: wf(theme).captionChip,
            borderColor: wf(theme).borderLight,
            color: wf(theme).textFaint,
          },
          '&[data-tone="empty"]': {
            backgroundColor: wf(theme).captionChip,
            borderColor: wf(theme).borderFaint,
            color: wf(theme).textGhost,
          },
        }),
        label: { padding: '0 6px' },
        // A chip's icon is a unit of its label, not an ornament beside it.
        icon: { fontSize: fs(12), marginLeft: 5, marginRight: -3, color: 'inherit' },
        filled: ({ theme }) => ({
          backgroundColor: wf(theme).inkFilled,
          borderColor: wf(theme).inkFilled,
          color: wf(theme).surface,
        }),
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: wf(theme).borderFaint,
          // The default is a seam inside one panel. This is a rule between two
          // things, and it carries the same weight as the borders around them.
          '&[data-tone="strong"]': { borderColor: wf(theme).border },
          // A rule and its label are one mark, so the colour reaches the line either side.
          '&[data-tone="alert"]': {
            borderColor: wf(theme).alert,
            '&::before, &::after': { borderColor: wf(theme).alert },
          },
        }),
      },
    },

    // Inline editors on a dense row, where an outlined field would double its height.
    MuiInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: 'transparent',
          '&::before': { borderBottom: `1px solid ${wf(theme).border}` },
          '&:hover:not(.Mui-disabled)::before': {
            borderBottom: `1px solid ${wf(theme).borderStrong}`,
          },
          '&::after': { borderBottom: `1.5px solid ${wf(theme).borderStrong}` },
        }),
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          ...theme.typography.statusLabel,
          backgroundColor: wf(theme).inkFilled,
          color: wf(theme).surface,
          borderRadius: 0,
          padding: '5px 8px',
        }),
        arrow: ({ theme }) => ({ color: wf(theme).inkFilled }),
      },
    },

    MuiAlert: {
      defaultProps: { variant: 'outlined', icon: false },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          fontSize: fs(11.5),
          padding: '7px 11px',
          backgroundColor: wf(theme).surfaceAlt,
          border: `1px solid ${wf(theme).borderLight}`,
          color: wf(theme).ink,
        }),
        message: { padding: 0 },
        outlinedError: ({ theme }) => ({ borderColor: wf(theme).alert, color: wf(theme).alert }),
      },
    },

    MuiLink: {
      defaultProps: { underline: 'none' },
      styleOverrides: {
        root: ({ theme }) => ({
          color: wf(theme).ink,
          borderBottom: `1px solid ${wf(theme).borderLight}`,
          '&:hover': { borderBottomColor: wf(theme).borderStrong },
        }),
      },
    },

    /** Rule 4's one exception, restated so `shape.borderRadius: 0` cannot take it. */
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '50%',
          fontWeight: 600,
          color: wf(theme).ink,
          backgroundColor: wf(theme).iconBoxFill,
          border: `1px solid ${wf(theme).iconBoxBorder}`,
          // Presence, said with border weight: there is no second colour to reach for.
          '&[data-online="true"]': { borderWidth: 1.5, borderColor: wf(theme).borderStrong },
        }),
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: ({ theme }) => ({
          ...theme.typography.microLabel,
          borderRadius: 0,
          backgroundColor: wf(theme).alert,
          color: wf(theme).surface,
        }),
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: 0, backgroundColor: wf(theme).borderFaint }),
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: 0, backgroundColor: wf(theme).borderFaint }),
        bar: ({ theme }) => ({ backgroundColor: wf(theme).inkFilled }),
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
          color: wf(theme).iconBoxBorder,
          '&.Mui-checked': { color: wf(theme).inkFilled },
        }),
      },
    },

    MuiRadio: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: wf(theme).iconBoxBorder,
          '&.Mui-checked': { color: wf(theme).inkFilled },
        }),
      },
    },

    MuiFormControlLabel: { styleOverrides: { label: { fontSize: fs(12) } } },

    MuiSwitch: {
      styleOverrides: {
        // Nested under the root so every rule beats the slot defaults, and both
        // states are painted rather than one being the absence of the other.
        // An off switch was a transparent track with a hairline that read as
        // nothing against the panel, which left the thumb alone on the page —
        // a small dark rectangle, with no track to say it was a switch at all.
        root: ({ theme }) => ({
          '& .MuiSwitch-track': {
            borderRadius: 0,
            opacity: 1,
            backgroundColor: wf(theme).surfaceControl,
            border: `1px solid ${wf(theme).borderStrong}`,
          },
          '& .MuiSwitch-thumb': {
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: wf(theme).borderStrong,
          },
          // `inkFilled` inverts between the schemes, so on is the high-contrast
          // one either way and the thumb takes the page's own colour against it.
          '& .MuiSwitch-switchBase.Mui-checked': {
            '& + .MuiSwitch-track': {
              backgroundColor: wf(theme).inkFilled,
              borderColor: wf(theme).inkFilled,
              opacity: 1,
            },
            '& .MuiSwitch-thumb': { backgroundColor: wf(theme).surface },
          },
          '& .MuiSwitch-switchBase.Mui-disabled': {
            '& + .MuiSwitch-track': { borderColor: wf(theme).border, opacity: 1 },
            '& .MuiSwitch-thumb': { backgroundColor: wf(theme).border },
          },
        }),
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${wf(theme).borderLight}`,
          // No indicator to draw: the active tab merges with the panel below, and the
          // seam is the indicator.
          '&[data-strip="true"]': {
            minHeight: 0,
            borderBottom: `1px solid ${wf(theme).border}`,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-flexContainer': { alignItems: 'stretch' },
          },
          // A sidebar: the rule runs down its edge, and the marker sits on it.
          '&.MuiTabs-vertical': {
            borderBottom: 'none',
            borderRight: `1px solid ${wf(theme).borderLight}`,
            '& .MuiTabs-indicator': { width: 1.5, height: 'auto' },
          },
        }),
        indicator: ({ theme }) => ({ backgroundColor: wf(theme).inkFilled, height: 1.5 }),
      },
    },

    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.microLabel,
          minHeight: 34,
          color: wf(theme).textFaint,
          '&.Mui-selected': { color: wf(theme).ink },
          '.MuiTabs-vertical &': {
            alignItems: 'flex-start',
            textAlign: 'left',
            padding: '9px 20px',
            '&.Mui-selected': { backgroundColor: wf(theme).surfaceControl },
          },
          '&[data-strip="true"]': {
            flex: 1,
            maxWidth: 'none',
            minHeight: 0,
            padding: '12px 0 11px',
            fontSize: fs(11.5),
            fontWeight: 400,
            letterSpacing: 0,
            textTransform: 'none',
            backgroundColor: wf(theme).surfaceSunken,
            color: wf(theme).textMuted,
            borderBottom: `1px solid ${wf(theme).border}`,
            '& + &': { borderLeft: `1px solid ${wf(theme).borderLight}` },
            '& [data-count]': { color: wf(theme).textDashed },
            '&.Mui-selected': {
              fontWeight: 600,
              backgroundColor: wf(theme).surface,
              color: wf(theme).ink,
              // The merge: the active tab paints over the strip's own rule.
              borderBottom: `1px solid ${wf(theme).surface}`,
              marginBottom: -1,
              '& [data-count]': { color: wf(theme).textFaint },
            },
          },
        }),
      },
    },

    // Square handle, hairline track: the crop stage's scale and rotate.
    MuiSlider: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: wf(theme).inkFilled,
          height: 1,
          padding: '9px 0',
        }),
        rail: ({ theme }) => ({ backgroundColor: wf(theme).borderLight, opacity: 1, height: 1 }),
        track: ({ theme }) => ({
          backgroundColor: wf(theme).borderStrong,
          border: 'none',
          height: 1,
        }),
        thumb: ({ theme }) => ({
          width: 9,
          height: 9,
          borderRadius: 0,
          backgroundColor: wf(theme).inkFilled,
          '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' },
        }),
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: fs(11.5),
          // MUI's 16px each side is built for a data grid on a page, not a
          // table in a 360px column, where it spends the width on nothing.
          padding: '8px 10px',
          borderBottom: `1px solid ${wf(theme).borderFaint}`,
        }),
        head: ({ theme }) => ({ ...theme.typography.microLabel, color: wf(theme).textFaint }),
      },
    },

    // A grid of editable squares needs its vertical rules; a table of prose reads
    // better without them, so this is asked for rather than given to every table.
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&[data-grid="true"]': {
            '& th, & td': { borderRight: `1px solid ${wf(theme).borderFaint}` },
            '& th:last-of-type, & td:last-of-type': { borderRight: 0 },
            // Opaque, or the body scrolls through the header it is pinned under.
            '& thead th': { backgroundColor: wf(theme).surfaceSunken, zIndex: 1 },
            // The cell is the field. An input carrying its own ground and padding
            // inside one is what makes a grid read as a column of text boxes.
            '& tbody td': { padding: 0 },
            '& tbody .MuiInputBase-root': { backgroundColor: 'transparent', width: '100%' },
            '& tbody td:focus-within': {
              backgroundColor: wf(theme).white,
              outline: `1.5px solid ${wf(theme).borderStrong}`,
              outlineOffset: -1,
            },
          },
        }),
      },
    },

    MuiTableSortLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: 'inherit',
          '&:hover': { color: wf(theme).ink },
          '&.Mui-active': { color: wf(theme).ink, '& .MuiTableSortLabel-icon': { opacity: 1 } },
        }),
        icon: { fontSize: fs(14), color: 'inherit', opacity: 0.4 },
      },
    },
  },
})

export { theme }

// Emotion's default cache turns speedy off in development, giving every rule its own
// <style> element — thousands of them. DevTools indexes stylesheets in O(n) per sheet,
// so opening the Inspector against that freezes the tab for tens of seconds. `speedy`
// inserts through CSSOM into one sheet instead; `key` matches the default so the
// cascade order is unchanged.
const cache = createCache({ key: 'css', speedy: true })

/** Owns the palette, typography, and the Light/Dark/Auto choice for the whole app. */
export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={cache}>
      {/* noSsr: without it `mode` is undefined for one render, long enough to paint the
          wrong scheme. enableColorScheme: otherwise scrollbars stay light. */}
      <ThemeProvider theme={theme} defaultMode="system" noSsr>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
