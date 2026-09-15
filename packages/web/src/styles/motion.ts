/** What a panel leaving or arriving takes; the sidebar's width uses the same. */
export const AWAY_MS = 160

/**
 * Off the edge rather than unmounted, so it can come back the way it left.
 * Visibility flips only once it has gone: a panel clipped by its container is
 * still in the tab order, and Tab would land on controls nobody can see.
 */
export function slideAwaySx(away: boolean, transform: { rest: string; gone: string }) {
  return {
    transform: away ? transform.gone : transform.rest,
    visibility: away ? 'hidden' : 'visible',
    transition: `transform ${AWAY_MS}ms ease-out, visibility 0s linear ${away ? AWAY_MS : 0}ms`,
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  } as const
}
