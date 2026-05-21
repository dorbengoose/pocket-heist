import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeistCard } from '@/components/HeistCard'
import { Heist } from '@/types/firestore/heist'

vi.mock('next/navigation')

const createMockHeist = (overrides?: Partial<Heist>): Heist => ({
  id: 'heist-1',
  title: 'Steal the Office Coffee Machine',
  description: 'A delicate operation to liberate the office coffee machine.',
  createdBy: 'user-1',
  createdByCodename: 'Shadow Fox',
  assignedTo: 'user-2',
  assignedToCodename: 'Midnight Owl',
  createdAt: new Date('2024-01-15'),
  deadline: new Date('2024-02-15T17:00:00'),
  finalStatus: null,
  ...overrides,
})

describe('HeistCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the heist title as a link to /heists/:id', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    const titleLink = screen.getByRole('link', { name: heist.title })
    expect(titleLink).toBeInTheDocument()
    expect(titleLink).toHaveAttribute('href', `/heists/${heist.id}`)
  })

  it('renders the description', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    expect(screen.getByText(heist.description)).toBeInTheDocument()
  })

  it('renders the createdByCodename', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    expect(screen.getByText(heist.createdByCodename)).toBeInTheDocument()
  })

  it('renders the assignedToCodename', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    expect(screen.getByText(heist.assignedToCodename)).toBeInTheDocument()
  })

  it('renders the deadline in human-readable format', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    const deadlineText = screen.getByText(/Feb/)
    expect(deadlineText).toBeInTheDocument()
  })

  it('renders "Active" badge when finalStatus is null', () => {
    const heist = createMockHeist({ finalStatus: null })
    render(<HeistCard heist={heist} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Success" badge when finalStatus is success', () => {
    const heist = createMockHeist({ finalStatus: 'success' })
    render(<HeistCard heist={heist} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('renders "Failed" badge when finalStatus is failure', () => {
    const heist = createMockHeist({ finalStatus: 'failure' })
    render(<HeistCard heist={heist} />)

    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders View Details link pointing to /heists/:id', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    const viewDetailsLink = screen.getByRole('link', { name: /view details/i })
    expect(viewDetailsLink).toBeInTheDocument()
    expect(viewDetailsLink).toHaveAttribute('href', `/heists/${heist.id}`)
  })

  it('renders both title link and View Details link with the same href', () => {
    const heist = createMockHeist()
    render(<HeistCard heist={heist} />)

    const titleLink = screen.getByRole('link', { name: heist.title })
    const viewDetailsLink = screen.getByRole('link', { name: /view details/i })

    expect(titleLink).toHaveAttribute('href', viewDetailsLink.getAttribute('href'))
  })
})
