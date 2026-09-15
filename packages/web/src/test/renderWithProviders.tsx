import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/test/Providers'

export function renderWithProviders(ui: ReactNode, { route = '/' } = {}) {
  return render(<Providers route={route}>{ui}</Providers>)
}
