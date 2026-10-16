import type { Character, User } from '@player-ledger/shared'
import { createContext, type ReactNode, useContext } from 'react'

type ActiveCharacter = { user: User; character: Character }

const ActiveCharacterContext = createContext<ActiveCharacter | null>(null)

export function ActiveCharacterProvider({
  value,
  children,
}: {
  value: ActiveCharacter
  children: ReactNode
}) {
  return <ActiveCharacterContext.Provider value={value}>{children}</ActiveCharacterContext.Provider>
}

/** Only below IdentityGate, where there is always one. */
export function useActiveCharacter(): ActiveCharacter {
  const active = useContext(ActiveCharacterContext)
  if (!active) throw new Error('useActiveCharacter used outside IdentityGate')
  return active
}
