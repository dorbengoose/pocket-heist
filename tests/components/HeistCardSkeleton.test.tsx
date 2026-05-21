import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HeistCardSkeleton } from '@/components/HeistCardSkeleton'

describe('HeistCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeistCardSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders the skeleton wrapper element', () => {
    const { container } = render(<HeistCardSkeleton />)
    const skeletonCard = container.firstChild
    expect(skeletonCard).toBeInTheDocument()
  })

  it('renders multiple skeleton blocks', () => {
    const { container } = render(<HeistCardSkeleton />)
    const skeletonBlocks = container.querySelectorAll('[style*="height"]')
    expect(skeletonBlocks.length).toBeGreaterThan(0)
  })
})
