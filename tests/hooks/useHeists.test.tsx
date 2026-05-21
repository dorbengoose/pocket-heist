import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({
    withConverter: vi.fn(() => ({})),
  })),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ _type: 'timestamp', toDate: () => date })),
  },
}))

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
}))

// Mock UserContext
vi.mock('@/context/UserContext', () => ({
  useUser: () => ({
    user: {
      uid: 'test-user-id',
      displayName: 'TestAgent',
    },
    loading: false,
  }),
}))

// Mock Firestore types
vi.mock('@/types/firestore', () => ({
  COLLECTIONS: {
    HEISTS: 'heists',
    USERS: 'users',
  },
  heistConverter: {
    toFirestore: (data: any) => data,
    fromFirestore: (snapshot: any) => ({
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      deadline: snapshot.data().deadline?.toDate(),
    }),
  },
}))

import { useHeists } from '@/hooks/useHeists'

describe('useHeists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial render', () => {
    it('returns loading: true and empty heists initially', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      vi.mocked(onSnapshot).mockImplementation(() => vi.fn())

      const { result } = renderHook(() => useHeists('active'))

      expect(result.current.loading).toBe(true)
      expect(result.current.heists).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('onSnapshot callback', () => {
    it('updates state when onSnapshot fires with active filter', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback, error) => {
        snapCallback = callback
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('active'))

      const mockHeist = {
        id: 'heist-1',
        title: 'Test Heist',
        deadline: new Date(Date.now() + 86400000), // future date
        finalStatus: null,
      }

      snapCallback({
        docs: [{ id: 'heist-1', data: () => mockHeist }],
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.heists).toHaveLength(1)
        expect(result.current.heists[0].title).toBe('Test Heist')
      })
    })

    it('filters out past-deadline heists for active filter', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('active'))

      const futureHeist = {
        id: 'heist-1',
        title: 'Future Heist',
        deadline: new Date(Date.now() + 86400000),
      }

      const pastHeist = {
        id: 'heist-2',
        title: 'Past Heist',
        deadline: new Date(Date.now() - 86400000),
      }

      snapCallback({
        docs: [
          { id: 'heist-1', data: () => futureHeist },
          { id: 'heist-2', data: () => pastHeist },
        ],
      })

      await waitFor(() => {
        expect(result.current.heists).toHaveLength(1)
        expect(result.current.heists[0].title).toBe('Future Heist')
      })
    })

    it('filters out past-deadline heists for assigned filter', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('assigned'))

      const futureHeist = {
        id: 'heist-1',
        title: 'Future Heist',
        deadline: new Date(Date.now() + 86400000),
      }

      const pastHeist = {
        id: 'heist-2',
        title: 'Past Heist',
        deadline: new Date(Date.now() - 86400000),
      }

      snapCallback({
        docs: [
          { id: 'heist-1', data: () => futureHeist },
          { id: 'heist-2', data: () => pastHeist },
        ],
      })

      await waitFor(() => {
        expect(result.current.heists).toHaveLength(1)
        expect(result.current.heists[0].title).toBe('Future Heist')
      })
    })

    it('filters heists with finalStatus !== null for expired filter', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('expired'))

      const completedHeist = {
        id: 'heist-1',
        title: 'Completed Heist',
        deadline: new Date(Date.now() - 86400000),
        finalStatus: 'success',
      }

      const incompleteHeist = {
        id: 'heist-2',
        title: 'Incomplete Heist',
        deadline: new Date(Date.now() - 86400000),
        finalStatus: null,
      }

      snapCallback({
        docs: [
          { id: 'heist-1', data: () => completedHeist },
          { id: 'heist-2', data: () => incompleteHeist },
        ],
      })

      await waitFor(() => {
        expect(result.current.heists).toHaveLength(1)
        expect(result.current.heists[0].title).toBe('Completed Heist')
      })
    })
  })

  describe('Firestore queries', () => {
    it('queries with assignedTo for active filter', async () => {
      const { onSnapshot, query, where } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      renderHook(() => useHeists('active'))

      await waitFor(() => {
        expect(query).toHaveBeenCalled()
        expect(where).toHaveBeenCalledWith('assignedTo', '==', 'test-user-id')
      })
    })

    it('queries with createdBy for assigned filter', async () => {
      const { onSnapshot, query, where } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation(() => vi.fn())

      renderHook(() => useHeists('assigned'))

      await waitFor(() => {
        expect(where).toHaveBeenCalledWith('createdBy', '==', 'test-user-id')
      })
    })

    it('queries with deadline for expired filter', async () => {
      const { onSnapshot, query, where, Timestamp } = await import('firebase/firestore')

      vi.mocked(onSnapshot).mockImplementation(() => vi.fn())

      renderHook(() => useHeists('expired'))

      await waitFor(() => {
        expect(where).toHaveBeenCalledWith('deadline', '<=', expect.anything())
      })
    })
  })

  describe('Null user handling', () => {
    beforeEach(() => {
      vi.resetModules()
    })

    it('returns empty heists immediately for active filter when user is null', async () => {
      vi.doMock('@/context/UserContext', () => ({
        useUser: () => ({
          user: null,
          loading: false,
        }),
      }))

      const { useHeists: useHeistsWithNullUser } = await import('@/hooks/useHeists')

      const { result } = renderHook(() => useHeistsWithNullUser('active'))

      expect(result.current.heists).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('returns empty heists immediately for assigned filter when user is null', async () => {
      vi.doMock('@/context/UserContext', () => ({
        useUser: () => ({
          user: null,
          loading: false,
        }),
      }))

      const { useHeists: useHeistsWithNullUser } = await import('@/hooks/useHeists')

      const { result } = renderHook(() => useHeistsWithNullUser('assigned'))

      expect(result.current.heists).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('sets error state when onSnapshot error callback fires', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let errorCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback, errorCb) => {
        errorCallback = errorCb
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('active'))

      const testError = new Error('Firestore error')
      errorCallback(testError)

      await waitFor(() => {
        expect(result.current.error).toBe(testError)
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Cleanup', () => {
    it('unsubscribes on unmount', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      const unsubscribeMock = vi.fn()

      vi.mocked(onSnapshot).mockReturnValue(unsubscribeMock)

      const { unmount } = renderHook(() => useHeists('active'))

      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })

  describe('Filter changes', () => {
    it('re-subscribes when filter changes', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      const { rerender } = renderHook(
        ({ filter }) => useHeists(filter),
        { initialProps: { filter: 'active' as const } }
      )

      expect(onSnapshot).toHaveBeenCalledTimes(1)

      rerender({ filter: 'assigned' as const })

      await waitFor(() => {
        expect(onSnapshot).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Empty results', () => {
    it('returns empty array when no heists match', async () => {
      const { onSnapshot } = await import('firebase/firestore')
      let snapCallback: any

      vi.mocked(onSnapshot).mockImplementation((q, callback) => {
        snapCallback = callback
        return vi.fn()
      })

      const { result } = renderHook(() => useHeists('active'))

      snapCallback({ docs: [] })

      await waitFor(() => {
        expect(result.current.heists).toEqual([])
        expect(result.current.loading).toBe(false)
      })
    })
  })
})
