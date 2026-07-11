import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { doc, setDoc, type Firestore } from 'firebase/firestore'
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  setupFirestoreEmulator,
  clearFirestoreEmulator,
  teardownFirestoreEmulator,
  getAuthedFirestore,
} from '../helpers/firestoreEmulator'
import { useUsers } from '@/hooks/useUsers'

const READER_UID = 'reader-uid'

let testEnv: RulesTestEnvironment
let emulatorDb: Firestore

// Redirects the app's `db` singleton to an authenticated Firestore emulator
// instance. `firebase/firestore` itself is NOT mocked (FR-004).
vi.mock('@/lib/firebase', () => ({
  get db() {
    return emulatorDb
  },
}))

beforeAll(async () => {
  testEnv = await setupFirestoreEmulator()
  emulatorDb = getAuthedFirestore(testEnv, READER_UID)
})

afterEach(async () => {
  await clearFirestoreEmulator(testEnv)
})

afterAll(async () => {
  await teardownFirestoreEmulator(testEnv)
})

describe('useUsers', () => {
  it('reads all users/{uid} documents from the Firestore emulator', async () => {
    // Seed users as their own authenticated identity (rules require
    // auth.uid == userId for create).
    const aliceDb = getAuthedFirestore(testEnv, 'alice-uid')
    const bobDb = getAuthedFirestore(testEnv, 'bob-uid')
    await setDoc(doc(aliceDb, 'users', 'alice-uid'), { id: 'alice-uid', codename: 'Alice' })
    await setDoc(doc(bobDb, 'users', 'bob-uid'), { id: 'bob-uid', codename: 'Bob' })

    const { result } = renderHook(() => useUsers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.users).toHaveLength(2)
    expect(result.current.users).toEqual(
      expect.arrayContaining([
        { id: 'alice-uid', codename: 'Alice' },
        { id: 'bob-uid', codename: 'Bob' },
      ])
    )
  })
})
