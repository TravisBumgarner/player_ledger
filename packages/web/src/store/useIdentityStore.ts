import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type State = {
  userId: string | null
  characterId: string | null
  /** A character belongs to one user, so changing user always drops it. */
  setUserId: (userId: string | null) => void
  setCharacterId: (characterId: string | null) => void
}

/** Who is at the keyboard, remembered per device until there is a real login. */
const useIdentityStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        characterId: null,
        setUserId: (userId) => set({ userId, characterId: null }),
        setCharacterId: (characterId) => set({ characterId }),
      }),
      {
        name: 'awesomeness-mgmt:identity',
        storage: createJSONStorage(() => localStorage),
        partialize: ({ userId, characterId }) => ({ userId, characterId }),
      },
    ),
    { name: 'identity' },
  ),
)

export const useUserId = () => useIdentityStore((s) => s.userId)
export const useCharacterId = () => useIdentityStore((s) => s.characterId)
export const useSetUserId = () => useIdentityStore((s) => s.setUserId)
export const useSetCharacterId = () => useIdentityStore((s) => s.setCharacterId)

export default useIdentityStore
