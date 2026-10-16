import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** One curve and two durations for the whole app, so nothing moves out of step. */
export const EASE = [0.22, 1, 0.36, 1] as const
export const FAST = 0.16
export const SLOW = 0.24

/** Respects the OS's reduced-motion setting everywhere below it. */
export function LedgerMotion({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: FAST, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}

/** A row that grows in and folds away; its neighbours slide rather than jump. */
export function MotionRow({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="motion-row"
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: SLOW, ease: EASE }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )
}

/** A card that fades up into place; no height clip, so its corner brackets stay whole. */
export function MotionCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: SLOW, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export { AnimatePresence, LayoutGroup, motion }
