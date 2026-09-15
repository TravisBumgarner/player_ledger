import { create } from 'zustand'

type State = {
  /** The profile ref shown in the right-hand panel, or null when it is closed. */
  openRef: string | null
  openProfile: (ref: string) => void
  closeProfile: () => void
}

const useCharacterPanelStore = create<State>()((set) => ({
  openRef: null,
  openProfile: (openRef) => set({ openRef }),
  closeProfile: () => set({ openRef: null }),
}))

export const useOpenProfileRef = () => useCharacterPanelStore((s) => s.openRef)
export const useOpenProfile = () => useCharacterPanelStore((s) => s.openProfile)
export const useCloseProfile = () => useCharacterPanelStore((s) => s.closeProfile)

export default useCharacterPanelStore
