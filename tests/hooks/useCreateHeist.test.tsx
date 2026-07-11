import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type Firestore } from 'firebase/firestore'
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import {
  setupFirestoreEmulator,
  clearFirestoreEmulator,
  teardownFirestoreEmulator,
  getAuthedFirestore,
} from '../helpers/firestoreEmulator'
import { useCreateHeist } from '@/hooks/useCreateHeist'
import type { CreateHeistInput } from '@/types/firestore'

const CREATOR_UID = 'creator-uid'
const ASSIGNEE_UID = 'assignee-uid'

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
  emulatorDb = getAuthedFirestore(testEnv, CREATOR_UID)

  // Seed the creator's own user doc so rules referencing it (if any) are satisfiable.
  await setDoc(doc(getAuthedFirestore(testEnv, CREATOR_UID), 'users', CREATOR_UID), {
    id: CREATOR_UID,
    codename: 'Creator',
  })
})

afterEach(async () => {
  await clearFirestoreEmulator(testEnv)
  emulatorDb = getAuthedFirestore(testEnv, CREATOR_UID)
})

afterAll(async () => {
  await teardownFirestoreEmulator(testEnv)
})

describe('useCreateHeist', () => {
  it('creates a heists/{id} document via the Firestore emulator', async () => {
    const { result } = renderHook(() => useCreateHeist())

    const input: CreateHeistInput = {
      title: 'Office Coffee Heist',
      description: 'Steal the last bag of espresso.',
      createdBy: CREATOR_UID,
      createdByCodename: 'Creator',
      assignedTo: ASSIGNEE_UID,
      assignedToCodename: 'Assignee',
      createdAt: serverTimestamp(),
      deadline: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)),
      finalStatus: null,
    }

    let createdId: string | undefined
    await act(async () => {
      createdId = await result.current.createHeist(input)
    })

    expect(createdId).toBeTruthy()

    const snapshot = await getDoc(doc(emulatorDb, 'heists', createdId!))
    expect(snapshot.exists()).toBe(true)
    const data = snapshot.data()
    expect(data?.title).toBe(input.title)
    expect(data?.description).toBe(input.description)
    expect(data?.createdBy).toBe(input.createdBy)
    expect(data?.assignedTo).toBe(input.assignedTo)
    expect(data?.finalStatus).toBeNull()
  })
})
