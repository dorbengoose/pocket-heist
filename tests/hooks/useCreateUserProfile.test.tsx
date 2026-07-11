import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { doc, getDoc, type Firestore } from 'firebase/firestore'
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  setupFirestoreEmulator,
  clearFirestoreEmulator,
  teardownFirestoreEmulator,
  getAuthedFirestore,
} from '../helpers/firestoreEmulator'
import { useCreateUserProfile } from '@/hooks/useCreateUserProfile'

const TEST_UID = 'test-user-1'

let testEnv: RulesTestEnvironment
let emulatorDb: Firestore

// Redirects the app's `db` singleton to an authenticated Firestore emulator
// instance instead of production. `firebase/firestore` itself is NOT mocked —
// setDoc/doc/getDoc run for real against the emulator (FR-004).
vi.mock('@/lib/firebase', () => ({
  get db() {
    return emulatorDb
  },
}))

beforeAll(async () => {
  testEnv = await setupFirestoreEmulator()
  emulatorDb = getAuthedFirestore(testEnv, TEST_UID)
})

afterEach(async () => {
  await clearFirestoreEmulator(testEnv)
})

afterAll(async () => {
  await teardownFirestoreEmulator(testEnv)
})

describe('useCreateUserProfile', () => {
  it('writes a users/{uid} document with { id, codename } via the Firestore emulator', async () => {
    const { result } = renderHook(() => useCreateUserProfile())

    await act(async () => {
      await result.current.createUserProfile(TEST_UID, 'GhostFox')
    })

    const snapshot = await getDoc(doc(emulatorDb, 'users', TEST_UID))
    expect(snapshot.exists()).toBe(true)
    expect(snapshot.data()).toEqual({ id: TEST_UID, codename: 'GhostFox' })
  })
})
