import { LedgerMotion } from '@/components/ledger/motion'
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/spectral/400.css'
import '@fontsource/spectral/400-italic.css'
import '@fontsource/spectral/500.css'
import '@fontsource/spectral/600.css'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import type { Shadows } from '@mui/material/styles'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import { MENU_WIDTH, Z_INDEX } from '@/styles/styleConsts'
import {
  DANGER,
  FONTS,
  LAYOUT,
  type LedgerPalette,
  PALETTES,
  type PaletteName,
  RADIUS,
  SPACING_BASE,
  TYPE,
} from './tokens'

export const PALETTE_STORAGE_KEY = 'ledger-palette'

declare module '@mui/material/styles' {
  interface Palette {
    ledger: LedgerPalette
  }
  interface PaletteOptions {
    ledger: LedgerPalette
  }
  interface TypographyVariants {
    capsXs: CSSProperties
    capsSm: CSSProperties
    capsMd: CSSProperties
    bodySm: CSSProperties
    subtitle: CSSProperties
    title: CSSProperties
    stat: CSSProperties
    meta: CSSProperties
  }
  interface TypographyVariantsOptions {
    capsXs?: CSSProperties
    capsSm?: CSSProperties
    capsMd?: CSSProperties
    bodySm?: CSSProperties
    subtitle?: CSSProperties
    title?: CSSProperties
    stat?: CSSProperties
    meta?: CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    capsXs: true
    capsSm: true
    capsMd: true
    bodySm: true
    subtitle: true
    title: true
    stat: true
    meta: true
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    /** The page's primary action: accent outline, small caps. */
    accent: true
    /** Muted until hovered; for actions that sit inside a row. */
    quiet: true
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    /** `panel` ground and a `line` border. */
    panel: true
    /** No frame: sections are ruled, not boxed. */
    section: true
    card: true
    row: true
    strip: true
    menu: true
    placeholder: true
    panelBody: true
    modal: true
  }
}

const shadows = Array.from({ length: 25 }, () => 'none') as unknown as Shadows

export function buildTheme(name: PaletteName) {
  const p = PALETTES[name]
  const line = `1px solid ${p.line}`
  const line2 = `1px solid ${p.line2}`

  return createTheme({
    spacing: SPACING_BASE,
    shadows,
    shape: { borderRadius: RADIUS.control },
    zIndex: {
      appBar: Z_INDEX.appBar,
      drawer: Z_INDEX.drawer,
      modal: Z_INDEX.modal,
      snackbar: Z_INDEX.toast,
    },
    palette: {
      mode: 'dark',
      ledger: p,
      primary: { main: p.accent, contrastText: p.ground },
      secondary: { main: p.mention, contrastText: p.ground },
      error: { main: DANGER, contrastText: p.ground },
      success: { main: p.accent, contrastText: p.ground },
      warning: { main: DANGER, contrastText: p.ground },
      info: { main: p.muted, contrastText: p.ground },
      background: { default: p.ground, paper: p.panel },
      text: { primary: p.text, secondary: p.muted, disabled: p.line2 },
      divider: p.line,
    },
    typography: {
      fontFamily: FONTS.body,
      h1: TYPE.h1,
      h2: { ...TYPE.title, fontSize: 22 },
      h3: TYPE.title,
      h4: { ...TYPE.title, fontSize: 16 },
      h5: TYPE.capsMd,
      h6: TYPE.capsSm,
      body1: TYPE.body,
      body2: TYPE.bodySm,
      caption: TYPE.caption,
      button: { ...TYPE.bodySm, textTransform: 'none' },
      overline: TYPE.capsXs,
      capsXs: TYPE.capsXs,
      capsSm: TYPE.capsSm,
      capsMd: TYPE.capsMd,
      bodySm: TYPE.bodySm,
      subtitle: TYPE.subtitle,
      title: TYPE.title,
      stat: TYPE.stat,
      meta: TYPE.caption,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { colorScheme: 'dark' },
          body: { backgroundColor: p.ground, color: p.text, fontFamily: FONTS.body },
          'body:has(> .MuiDialog-root) #root': { overflow: 'hidden' },
          '::selection': { backgroundColor: p.line2, color: p.text },
          ':focus-visible': { outline: `2px solid ${p.accent}`, outlineOffset: 2 },
          '::-webkit-scrollbar': { width: 10, height: 10, backgroundColor: 'transparent' },
          '::-webkit-scrollbar-thumb': { backgroundColor: p.line, borderRadius: RADIUS.control },
          '[data-flash="true"]': { backgroundColor: p.panel },
        },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },

      MuiTypography: {
        defaultProps: {
          variantMapping: {
            capsXs: 'span',
            capsSm: 'span',
            capsMd: 'h2',
            bodySm: 'p',
            subtitle: 'p',
            title: 'h3',
            stat: 'span',
            meta: 'span',
          },
        },
        styleOverrides: {
          root: {
            '&[data-empty="true"]': { color: p.muted, fontStyle: 'italic' },
            '&[data-done="true"]': { color: p.muted, textDecoration: 'line-through' },
          },
        },
        variants: [
          { props: { variant: 'overline' }, style: { color: p.muted } },
          { props: { variant: 'capsXs' }, style: { color: p.muted } },
          { props: { variant: 'capsMd' }, style: { color: p.muted } },
          { props: { variant: 'subtitle' }, style: { color: p.muted } },
          { props: { variant: 'caption' }, style: { color: p.muted } },
          { props: { variant: 'meta' }, style: { color: p.muted } },
        ],
      },

      MuiButton: {
        defaultProps: { variant: 'outlined', disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: RADIUS.control,
            minWidth: 0,
            minHeight: LAYOUT.iconButton,
            padding: '0 12px',
            color: p.text,
            '&[data-destructive="true"]': { color: DANGER },
          },
          sizeSmall: { minHeight: 32, padding: '0 8px' },
        },
        variants: [
          {
            props: { variant: 'outlined' },
            // Small caps like the nav; Cinzel's caps also sit centred where Spectral's body face rides high.
            style: {
              ...TYPE.capsSm,
              lineHeight: 1,
              border: line2,
              backgroundColor: 'transparent',
              '&:hover': { borderColor: p.text, backgroundColor: 'transparent' },
              '&.Mui-disabled': { borderColor: p.line, color: p.line2 },
            },
          },
          {
            props: { variant: 'accent' },
            style: {
              ...TYPE.capsSm,
              border: `1px solid ${p.accent}`,
              color: p.accent,
              padding: '0 24px',
              minHeight: 44,
              '&:hover': { backgroundColor: p.panel },
              '&.Mui-disabled': { borderColor: p.line, color: p.line2 },
            },
          },
          {
            props: { variant: 'contained' },
            style: {
              ...TYPE.capsSm,
              border: `1px solid ${p.accent}`,
              backgroundColor: 'transparent',
              color: p.accent,
              '&:hover': { backgroundColor: p.panel },
              '&.Mui-disabled': { borderColor: p.line, color: p.line2 },
            },
          },
          {
            props: { variant: 'text' },
            style: {
              padding: 0,
              minHeight: 0,
              color: p.accent,
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            },
          },
          {
            props: { variant: 'quiet' },
            style: {
              padding: '0 8px',
              color: p.muted,
              '&:hover': { backgroundColor: 'transparent', color: p.text },
            },
          },
          { props: { color: 'error' }, style: { color: DANGER, borderColor: DANGER } },
        ],
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            width: LAYOUT.iconButton,
            height: LAYOUT.iconButton,
            borderRadius: RADIUS.control,
            color: p.muted,
            '&:hover': { backgroundColor: 'transparent', color: p.text },
            '&[aria-pressed="true"]': { color: p.accent },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: { ...TYPE.body, color: p.text },
          input: { '&::placeholder': { color: p.muted, opacity: 0.85 } },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.control,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: p.line2 },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p.muted },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: p.accent,
              borderWidth: 1,
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            '&::before': { borderBottom: line2 },
            '&:hover:not(.Mui-disabled)::before': { borderBottom: `1px solid ${p.muted}` },
            '&::after': { borderBottom: `1px solid ${p.accent}` },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { ...TYPE.capsXs, color: p.muted, '&.Mui-focused': { color: p.accent } },
        },
      },
      MuiFormHelperText: { styleOverrides: { root: { ...TYPE.caption, color: p.muted } } },
      MuiFormControlLabel: { styleOverrides: { label: { ...TYPE.bodySm, color: p.muted } } },

      MuiCheckbox: {
        styleOverrides: {
          root: { color: p.line2, '&.Mui-checked': { color: p.accent } },
        },
      },

      MuiDivider: { styleOverrides: { root: { borderColor: p.line } } },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            ...TYPE.caption,
            backgroundColor: p.panel,
            color: p.text,
            border: line2,
            borderRadius: RADIUS.control,
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            minWidth: MENU_WIDTH / 1.5,
            backgroundColor: p.panel,
            border: line2,
            borderRadius: RADIUS.control,
          },
          list: { padding: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...TYPE.bodySm,
            minHeight: LAYOUT.iconButton,
            borderRadius: RADIUS.badge,
            '&:hover, &.Mui-focusVisible': { backgroundColor: p.ground },
            '&[data-destructive="true"]': { color: DANGER },
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { backgroundColor: p.panel, border: line2, borderRadius: RADIUS.portraitBottom },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { ...TYPE.title, padding: '24px 24px 8px' } } },
      MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px' } } },
      MuiDialogContentText: { styleOverrides: { root: { ...TYPE.bodySm, color: p.muted } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },

      MuiAlert: {
        styleOverrides: {
          root: { ...TYPE.bodySm, backgroundColor: p.panel, border: line2, color: p.text },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...TYPE.capsXs,
            height: 22,
            borderRadius: RADIUS.badge,
            border: line2,
            backgroundColor: 'transparent',
            color: p.muted,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: FONTS.display,
            fontSize: 13,
            backgroundColor: 'transparent',
            color: p.text,
            border: line2,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 3, backgroundColor: p.line },
          bar: { borderRadius: 3, backgroundColor: p.accent },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            ...TYPE.bodySm,
            textTransform: 'none',
            color: p.muted,
            borderColor: p.line2,
            '&.Mui-selected': { color: p.accent, backgroundColor: p.ground },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { ...TYPE.bodySm, borderBottom: line, color: p.text },
          head: { ...TYPE.capsXs, color: p.muted },
        },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderBottom: line, '&:hover': { backgroundColor: p.panel } } },
      },
      MuiLink: { styleOverrides: { root: { color: p.accent, textDecorationColor: p.line2 } } },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none', backgroundColor: p.panel } },
        variants: [
          { props: { variant: 'outlined' }, style: { border: line } },
          { props: { variant: 'panel' }, style: { border: line, padding: 20 } },
          {
            props: { variant: 'section' },
            style: { backgroundColor: 'transparent', display: 'grid', gap: 12 },
          },
          { props: { variant: 'card' }, style: { border: line, padding: 16 } },
          {
            props: { variant: 'row' },
            style: { backgroundColor: 'transparent', borderBottom: line, borderRadius: 0 },
          },
          { props: { variant: 'strip' }, style: { backgroundColor: 'transparent' } },
          { props: { variant: 'menu' }, style: { border: line2 } },
          { props: { variant: 'placeholder' }, style: { border: line, minHeight: 80 } },
          {
            props: { variant: 'panelBody' },
            style: { backgroundColor: p.ground, borderLeft: line },
          },
          { props: { variant: 'modal' }, style: { border: line2 } },
        ],
      },
    },
  })
}

type PaletteContextValue = { palette: PaletteName; setPalette: (name: PaletteName) => void }
const PaletteContext = createContext<PaletteContextValue | null>(null)

export function usePalette(): PaletteContextValue {
  const value = useContext(PaletteContext)
  if (!value) throw new Error('usePalette must be used inside AppThemeProvider')
  return value
}

function storedPalette(): PaletteName {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    return stored === 'neutral' ? 'neutral' : 'grove'
  } catch {
    return 'grove'
  }
}

// Speedy (one insertRule per style) keeps a theme-wide restyle from repainting the whole sheet.
const cache = createCache({ key: 'css', speedy: true })

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteName>(storedPalette)
  const theme = useMemo(() => buildTheme(palette), [palette])

  const value = useMemo<PaletteContextValue>(
    () => ({
      palette,
      setPalette: (name) => {
        setPaletteState(name)
        try {
          localStorage.setItem(PALETTE_STORAGE_KEY, name)
        } catch {
          // A palette that does not persist still applies for this session.
        }
      },
    }),
    [palette],
  )

  return (
    <CacheProvider value={cache}>
      <PaletteContext.Provider value={value}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LedgerMotion>{children}</LedgerMotion>
        </ThemeProvider>
      </PaletteContext.Provider>
    </CacheProvider>
  )
}
