import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUser } from '@/context/UserContext'
import { UserProvider } from '@/context/UserContext'
import * as firebaseAuth from 'firebase/auth'

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  auth: {},
}))

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial loading state with null user', () => {
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
      return () => {}
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider>{children}</UserProvider>
    )

    const { result } = renderHook(() => useUser(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('returns authenticated user and sets loading to false', () => {
    const mockUser = {
      uid: 'u1',
      email: 'test@example.com',
      displayName: 'Test User',
    }

    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      callback?.(mockUser as any)
      return () => {}
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider>{children}</UserProvider>
    )

    const { result } = renderHook(() => useUser(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(result.current.user?.uid).toBe('u1')
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.user?.displayName).toBe('Test User')
  })

  it('returns null user when signed out and sets loading to false', () => {
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((auth, callback) => {
      callback?.(null)
      return () => {}
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider>{children}</UserProvider>
    )

    const { result } = renderHook(() => useUser(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('calls unsubscribe on cleanup', () => {
    const unsubscribeMock = vi.fn()

    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation(() => {
      return unsubscribeMock
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProvider>{children}</UserProvider>
    )

    const { unmount } = renderHook(() => useUser(), { wrapper })

    unmount()

    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })
})
