import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import type { Firestore } from 'firebase/firestore'

const FIRESTORE_EMULATOR_PORT = 8080

/**
 * Starts a RulesTestEnvironment against the running Firestore emulator
 * (`npm run emulators:start`), loaded with this repo's real firestore.rules.
 * Call once per test file, in `beforeAll`.
 *
 * Each call gets its own randomly suffixed `projectId` — Vitest runs test
 * files in parallel, and a shared projectId means one file's
 * `clearFirestore()` (in another file's `afterEach`) can wipe data an
 * in-flight assertion in this file still needs.
 */
export async function setupFirestoreEmulator(): Promise<RulesTestEnvironment> {
  const rules = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8')

  return initializeTestEnvironment({
    projectId: `demo-pocket-heist-${randomUUID()}`,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: FIRESTORE_EMULATOR_PORT,
    },
  })
}

/** Wipes all Firestore data between tests. Call in `afterEach`. */
export async function clearFirestoreEmulator(testEnv: RulesTestEnvironment): Promise<void> {
  await testEnv.clearFirestore()
}

/** Destroys the test environment's contexts. Call once per test file, in `afterAll`. */
export async function teardownFirestoreEmulator(testEnv: RulesTestEnvironment): Promise<void> {
  await testEnv.cleanup()
}

/**
 * Returns a Firestore instance authenticated as `uid`, matching the auth
 * context a signed-in user's hook calls run under in the app.
 *
 * `RulesTestContext.firestore()` is typed as the compat SDK, but the instance
 * it returns wraps the same underlying client the modular SDK uses, so it can
 * be passed directly to modular functions (`doc`, `setDoc`, `getDocs`, ...) —
 * this is the pattern documented by @firebase/rules-unit-testing itself.
 */
export function getAuthedFirestore(testEnv: RulesTestEnvironment, uid: string): Firestore {
  return testEnv.authenticatedContext(uid).firestore() as unknown as Firestore
}

/** Returns a Firestore instance for an unauthenticated (signed-out) client. */
export function getUnauthedFirestore(testEnv: RulesTestEnvironment): Firestore {
  return testEnv.unauthenticatedContext().firestore() as unknown as Firestore
}
